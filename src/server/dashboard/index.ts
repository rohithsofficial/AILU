import type { Staff } from "@/lib/authz";
import { can } from "@/lib/permissions";
import { getPrisma } from "@/lib/db";
import { EVENT_STATUSES } from "@/lib/eventStatus";
import { calculateEventFinancials } from "@/lib/eventFinance";
import { ATTENTION_THRESHOLDS, buildAttentionItems, type AttentionItem } from "./attention-rules";
import { isDueWithinDays, marginForCompletedEvents, outstandingPaise, summarizeDue } from "./money-rules";

const day = 24 * 60 * 60 * 1000;
const indiaDayStart = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const fields = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(`${fields.year}-${fields.month}-${fields.day}T00:00:00.000Z`);
};
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * day);
const eventScope = (staff: Staff) => ({ archivedAt: null, ...(staff.role === "STAFF" ? { ownerId: staff.id } : {}) });
const taskScope = (staff: Staff) => staff.role === "STAFF" ? { assigneeId: staff.id } : {};

export async function dashboardA4Counts(staff: Staff) {
  const db = getPrisma();
  const [applications, partners, commissionsPending, commissionsPayable, dreams] = await Promise.all([
    can(staff.role, "applications.read") ? db.application.count({ where: { status: "SUBMITTED" } }) : Promise.resolve(null),
    can(staff.role, "partners.read") ? db.salesPartner.count({ where: { status: "PENDING" } }) : Promise.resolve(null),
    can(staff.role, "commissions.approve") ? db.commission.count({ where: { status: "PENDING_APPROVAL" } }) : Promise.resolve(null),
    can(staff.role, "commissions.mark_paid") ? db.commission.count({ where: { status: "APPROVED" } }) : Promise.resolve(null),
    can(staff.role, "dream.read") ? db.dream.count({ where: { status: "SUBMITTED" } }) : Promise.resolve(null),
  ]);
  return { applications, partners, commissionsPending, commissionsPayable, dreams };
}

async function moneyDashboard(staff: Staff, now: Date) {
  if (!can(staff.role, "finance.read")) return null;
  const db = getPrisma();
  const startToday = indiaDayStart(now);
  const within14 = addDays(startToday, 14);
  const dateParts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).formatToParts(now).map((part) => [part.type, part.value]));
  const monthStart = new Date(Date.UTC(Number(dateParts.year), Number(dateParts.month) - 1, 1));
  const monthEnd = new Date(Date.UTC(Number(dateParts.year), Number(dateParts.month), 1));

  const [clientEvents, vendorRows, teamRows, completedRows] = await Promise.all([
    db.event.findMany({ where: { ...eventScope(staff), status: { notIn: ["CANCELLED", "LOST"] }, quotations: { some: { status: "ACCEPTED" } } }, orderBy: [{ startDate: "asc" }, { title: "asc" }], select: { id: true, title: true, status: true, startDate: true, quotations: { where: { status: "ACCEPTED" }, orderBy: { version: "desc" }, take: 1, select: { totalPaise: true } } } }),
    db.vendorBooking.findMany({ where: { status: { not: "CANCELLED" }, agreedAmountPaise: { not: null }, event: { archivedAt: null, status: { notIn: ["CANCELLED", "LOST"] }, OR: [{ status: "COMPLETED" }, { startDate: { gte: startToday, lte: within14 } }] } }, select: { id: true, agreedAmountPaise: true, vendor: { select: { name: true } }, event: { select: { id: true, title: true, status: true, startDate: true } } } }),
    db.eventAssignment.findMany({ where: { status: { not: "DROPPED" }, feePaise: { not: null }, event: { archivedAt: null, status: { notIn: ["CANCELLED", "LOST"] }, OR: [{ status: "COMPLETED" }, { startDate: { gte: startToday, lte: within14 } }] } }, select: { id: true, feePaise: true, teamMember: { select: { name: true } }, event: { select: { id: true, title: true, status: true, startDate: true } } } }),
    db.event.findMany({ where: { archivedAt: null, status: "COMPLETED", startDate: { gte: monthStart, lt: monthEnd }, quotations: { some: { status: "ACCEPTED" } }, ... (staff.role === "STAFF" ? { ownerId: staff.id } : {}) }, select: { id: true, quotations: { where: { status: "ACCEPTED" }, orderBy: { version: "desc" }, take: 1, select: { totalPaise: true } }, payments: { select: { direction: true, amountPaise: true, vendorBookingId: true, assignmentId: true } }, expenses: { select: { amountPaise: true, vendorBookingId: true } }, vendorBookings: { where: { status: { not: "CANCELLED" } }, select: { id: true, agreedAmountPaise: true } }, assignments: { where: { status: { not: "DROPPED" } }, select: { id: true, feePaise: true, status: true } }, commissions: { where: { status: { in: ["APPROVED", "PAID"] } }, select: { amountPaise: true } } } }),
  ]);
  const ids = clientEvents.map((event) => event.id);
  const [clientPaid, vendorPaid, teamPaid] = await Promise.all([
    ids.length ? db.payment.groupBy({ by: ["eventId"], where: { eventId: { in: ids }, direction: "IN" }, _sum: { amountPaise: true } }) : Promise.resolve([]),
    vendorRows.length ? db.payment.groupBy({ by: ["vendorBookingId"], where: { vendorBookingId: { in: vendorRows.map((row) => row.id) }, direction: "OUT" }, _sum: { amountPaise: true } }) : Promise.resolve([]),
    teamRows.length ? db.payment.groupBy({ by: ["assignmentId"], where: { assignmentId: { in: teamRows.map((row) => row.id) }, direction: "OUT" }, _sum: { amountPaise: true } }) : Promise.resolve([]),
  ]);
  const clientPaidMap = new Map(clientPaid.map((row) => [row.eventId, row._sum.amountPaise ?? 0]));
  const clientSummary = summarizeDue(clientEvents.map((event) => ({ id: event.id, title: event.title, status: event.status, startDate: event.startDate, duePaise: outstandingPaise(event.quotations[0]?.totalPaise ?? null, clientPaidMap.get(event.id) ?? 0) })), now);
  const vendorPaidMap = new Map(vendorPaid.map((row) => [row.vendorBookingId, row._sum.amountPaise ?? 0]));
  const vendorSummary = summarizeDue(vendorRows.map((row) => ({ id: row.id, title: row.event.title, eventId: row.event.id, status: row.event.status, startDate: row.event.startDate, duePaise: outstandingPaise(row.agreedAmountPaise, vendorPaidMap.get(row.id) ?? 0) })), now);
  const teamPaidMap = new Map(teamPaid.map((row) => [row.assignmentId, row._sum.amountPaise ?? 0]));
  const teamSummary = summarizeDue(teamRows.map((row) => ({ id: row.id, title: row.event.title, eventId: row.event.id, status: row.event.status, startDate: row.event.startDate, duePaise: outstandingPaise(row.feePaise, teamPaidMap.get(row.id) ?? 0) })), now);

  const monthMarginPaise = marginForCompletedEvents(completedRows.map((event) => {
    const finance = calculateEventFinancials({ acceptedQuotePaise: event.quotations[0]?.totalPaise ?? 0, payments: event.payments, expenses: event.expenses, bookings: event.vendorBookings, assignments: event.assignments, approvedCommissionPaise: event.commissions.reduce((sum, commission) => sum + commission.amountPaise, 0) });
    return { acceptedQuotePaise: finance.quotedPaise, vendorCostsPaise: finance.vendorCostPaise, teamCostsPaise: finance.teamCostPaise, commissionCostsPaise: finance.partnerCommissionPaise, otherExpensesPaise: finance.otherExpensePaise };
  }));
  return {
    clientBalances: { totalPaise: clientSummary.totalPaise, rows: clientSummary.rows.map((row) => ({ ...row, withinSevenDays: isDueWithinDays(row.startDate, now) })) },
    vendorPayments: { totalPaise: vendorSummary.totalPaise, rows: vendorSummary.rows.map((row) => ({ ...row, resourceName: vendorRows.find((booking) => booking.id === row.id)?.vendor.name ?? "Vendor" })) },
    teamFees: { totalPaise: teamSummary.totalPaise, rows: teamSummary.rows.map((row) => ({ ...row, resourceName: teamRows.find((assignment) => assignment.id === row.id)?.teamMember.name ?? "Team member" })) },
    monthMarginPaise,
    monthDateFrom: monthStart.toISOString().slice(0, 10),
    monthDateTo: new Date(monthEnd.getTime() - day).toISOString().slice(0, 10),
  };
}

async function needsAttention(staff: Staff, now: Date, limit: number) {
  const db = getPrisma();
  const finance = can(staff.role, "finance.read");
  const inbox = can(staff.role, "inbox.read");
  const partners = can(staff.role, "partners.read");
  const scope = eventScope(staff);
  const overdueBefore = new Date(now.getTime() - ATTENTION_THRESHOLDS.overdueTaskDays * day);
  const enquiryBefore = new Date(now.getTime() - ATTENTION_THRESHOLDS.enquiryHours * 60 * 60 * 1000);
  const quotationBefore = new Date(now.getTime() - ATTENTION_THRESHOLDS.sentQuotationDays * day);
  const dreamReviewBefore = new Date(now.getTime() - ATTENTION_THRESHOLDS.dreamReviewDays * day);
  const planningFrom = indiaDayStart(now);
  const planningUntil = addDays(planningFrom, ATTENTION_THRESHOLDS.preEventDays);
  const balanceUntil = addDays(planningFrom, ATTENTION_THRESHOLDS.balanceDueDays);
  const [enquiries, quotations, planning, executed, overdueTasks, pendingPartners, clientMoney, dreams] = await Promise.all([
    inbox ? db.eventEnquiry.findMany({ where: { spam: false, createdAt: { lt: enquiryBefore }, OR: [{ ownerId: null }, { eventId: null }], ...(staff.role === "STAFF" ? { AND: [{ OR: [{ ownerId: staff.id }, { ownerId: null }] }] } : {}) }, select: { id: true, name: true, ownerId: true, eventId: true, spam: true, createdAt: true }, take: 1000 }) : Promise.resolve([]),
    db.quotation.findMany({ where: { status: "SENT", createdAt: { lt: quotationBefore }, event: scope }, select: { id: true, eventId: true, status: true, createdAt: true, event: { select: { title: true } } }, take: 1000 }),
    db.event.findMany({ where: { ...scope, status: { in: ["CONFIRMED", "PLANNING"] }, startDate: { gte: planningFrom, lte: planningUntil } }, select: { id: true, title: true, status: true, startDate: true, _count: { select: { vendorBookings: { where: { status: { not: "CANCELLED" } } }, assignments: { where: { status: { not: "DROPPED" } } } } } }, take: 1000 }),
    db.event.findMany({ where: { ...scope, status: "EXECUTED" }, orderBy: { updatedAt: "asc" }, select: { id: true, title: true, status: true, startDate: true }, take: 1000 }),
    db.task.findMany({ where: { doneAt: null, dueAt: { lt: overdueBefore }, OR: [{ eventId: { not: null } }, { clientId: { not: null } }], ...(staff.role === "STAFF" ? { assigneeId: staff.id } : {}) }, orderBy: { dueAt: "asc" }, select: { id: true, title: true, dueAt: true, eventId: true, clientId: true }, take: 1000 }),
    partners ? db.salesPartner.findMany({ where: { status: "PENDING", createdAt: { lt: new Date(now.getTime() - ATTENTION_THRESHOLDS.pendingPartnerDays * day) } }, select: { id: true, name: true, status: true, createdAt: true }, take: 1000 }) : Promise.resolve([]),
    finance ? db.event.findMany({ where: { ...scope, status: { notIn: ["CANCELLED", "LOST"] }, startDate: { gte: planningFrom, lte: balanceUntil }, quotations: { some: { status: "ACCEPTED" } } }, select: { id: true, title: true, startDate: true, quotations: { where: { status: "ACCEPTED" }, orderBy: { version: "desc" }, take: 1, select: { totalPaise: true } }, payments: { where: { direction: "IN" }, select: { amountPaise: true } } }, take: 1000 }) : Promise.resolve([]),
    can(staff.role, "dream.read") ? db.dream.findMany({ where: { status: "SUBMITTED", createdAt: { lt: dreamReviewBefore } }, select: { id: true, status: true, createdAt: true }, take: 1000 }) : Promise.resolve([]),
  ]);
  const balances = clientMoney.map((event) => ({ id: event.id, title: event.title, startDate: event.startDate!, balanceDuePaise: outstandingPaise(event.quotations[0]?.totalPaise ?? null, event.payments.reduce((sum, payment) => sum + payment.amountPaise, 0)) }));
  const executionActivities = executed.length ? await db.activity.findMany({ where: { kind: "STATUS", eventId: { in: executed.map((event) => event.id) }, body: { contains: "→ EXECUTED" } }, orderBy: { at: "desc" }, select: { eventId: true, at: true } }) : [];
  const executedAtByEvent = new Map<string, Date>();
  for (const activity of executionActivities) if (activity.eventId && !executedAtByEvent.has(activity.eventId)) executedAtByEvent.set(activity.eventId, activity.at);
  let visibleOverdueTasks = overdueTasks;
  let allowedEventIds = new Set<string>();
  let allowedClientIds = new Set<string>();
  if (staff.role === "STAFF") {
    const [taskEvents, taskClients] = await Promise.all([
      db.event.findMany({ where: { id: { in: overdueTasks.flatMap((task) => task.eventId ? [task.eventId] : []) }, ownerId: staff.id }, select: { id: true } }),
      db.client.findMany({ where: { id: { in: overdueTasks.flatMap((task) => task.clientId ? [task.clientId] : []) }, ownerId: staff.id }, select: { id: true } }),
    ]);
    allowedEventIds = new Set(taskEvents.map((event) => event.id));
    allowedClientIds = new Set(taskClients.map((client) => client.id));
    visibleOverdueTasks = overdueTasks.filter((task) => (task.eventId && allowedEventIds.has(task.eventId)) || (task.clientId && allowedClientIds.has(task.clientId)));
  }
  const taskRows = visibleOverdueTasks.map(({ dueAt, ...task }) => ({
    ...task,
    dueAt: dueAt!,
    ...(staff.role === "STAFF" ? {
      eventId: task.eventId && allowedEventIds.has(task.eventId) ? task.eventId : null,
      clientId: task.clientId && allowedClientIds.has(task.clientId) ? task.clientId : null,
    } : {}),
  }));
  const rows = buildAttentionItems({
    enquiries,
    quotations: quotations.map((row) => ({ ...row, eventTitle: row.event.title })),
    planningEvents: planning.map((event) => ({ id: event.id, title: event.title, status: event.status, startDate: event.startDate!, vendorBookingCount: event._count.vendorBookings, assignmentCount: event._count.assignments })),
    balancesDue: balances,
    executedEvents: executed.map((event) => ({ ...event, executedAt: executedAtByEvent.get(event.id) ?? null })),
    overdueTasks: taskRows,
    pendingPartners,
    dreams,
  }, now, finance);
  return rows.slice(0, Math.max(1, Math.min(1000, limit)));
}

export async function dashboardData(staff: Staff, now = new Date()) {
  const db = getPrisma();
  const todayStart = indiaDayStart(now);
  const tomorrow = addDays(todayStart, 1);
  const weekEnd = addDays(todayStart, 7);
  const monthAhead = addDays(todayStart, 30);
  const scope = eventScope(staff);
  const taskOwner = taskScope(staff);
  const hasInbox = can(staff.role, "inbox.read");
  const [counts, todayMine, todayOther, overdueMineCount, weekEvents, unassigned, newEnquiries, pipelineRows, upcomingRows, upcomingCount, attention, money] = await Promise.all([
    dashboardA4Counts(staff),
    db.task.findMany({ where: { assigneeId: staff.id, doneAt: null, dueAt: { lt: tomorrow } }, orderBy: [{ dueAt: "asc" }, { priority: "desc" }], take: 8, select: { id: true, title: true, dueAt: true, eventId: true, clientId: true, enquiryId: true } }),
    staff.role === "STAFF" ? Promise.resolve([]) : db.task.findMany({ where: { ...taskOwner, OR: [{ assigneeId: { not: staff.id } }, { assigneeId: null }], doneAt: null, dueAt: { lt: tomorrow } }, orderBy: [{ dueAt: "asc" }, { priority: "desc" }], take: 8, select: { id: true, title: true, dueAt: true, eventId: true, clientId: true, enquiryId: true } }),
    db.task.count({ where: { assigneeId: staff.id, doneAt: null, dueAt: { lt: todayStart } } }),
    db.event.findMany({ where: { ...scope, startDate: { gte: todayStart, lt: weekEnd } }, orderBy: { startDate: "asc" }, take: 8, select: { id: true, title: true, status: true, startDate: true, venueCity: true } }),
    hasInbox ? db.eventEnquiry.findMany({ where: { ownerId: null, spam: false }, orderBy: { createdAt: "asc" }, take: 8, select: { id: true, name: true, category: true, createdAt: true } }) : Promise.resolve([]),
    hasInbox ? db.eventEnquiry.findMany({ where: { eventId: null, spam: false, ...(staff.role === "STAFF" ? { OR: [{ ownerId: staff.id }, { ownerId: null }] } : {}) }, orderBy: { createdAt: "asc" }, take: 8, select: { id: true, name: true, category: true, createdAt: true } }) : Promise.resolve([]),
    db.event.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    db.event.findMany({ where: { ...scope, startDate: { gte: todayStart, lt: monthAhead } }, orderBy: { startDate: "asc" }, take: 8, select: { id: true, title: true, status: true, startDate: true, venueCity: true } }),
    db.event.count({ where: { ...scope, startDate: { gte: todayStart, lt: monthAhead } } }),
    needsAttention(staff, now, 15),
    moneyDashboard(staff, now),
  ]);
  const tasks = [...todayMine, ...todayOther].slice(0, 10);
  const newEnquiryCount = hasInbox ? await db.eventEnquiry.count({ where: { eventId: null, spam: false, ...(staff.role === "STAFF" ? { OR: [{ ownerId: staff.id }, { ownerId: null }] } : {}) } }) : 0;
  return {
    counts, today: {
      tasks, overdueMineCount, events: weekEvents, unassignedEnquiries: unassigned,
      eventsHref: `/admin/events?dateFrom=${todayStart.toISOString().slice(0, 10)}&dateTo=${addDays(todayStart, 6).toISOString().slice(0, 10)}`,
      unassignedHref: "/admin/inbox?owner=unassigned",
    },
    newEnquiries: { count: newEnquiryCount, rows: newEnquiries },
    pipeline: EVENT_STATUSES.map((status) => ({ status, count: pipelineRows.find((row) => row.status === status)?._count._all ?? 0 })),
    upcoming: { rows: upcomingRows, count: upcomingCount, href: `/admin/events?dateFrom=${todayStart.toISOString().slice(0, 10)}&dateTo=${addDays(todayStart, 29).toISOString().slice(0, 10)}` }, attention, money,
  };
}

export async function attentionData(staff: Staff, limit = 1000, now = new Date()): Promise<AttentionItem[]> {
  return needsAttention(staff, now, limit);
}

export async function financeDashboardData(staff: Staff, now = new Date()) {
  if (!can(staff.role, "finance.read")) return null;
  return moneyDashboard(staff, now);
}
