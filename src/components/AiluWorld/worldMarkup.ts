import { SITE_CONTENT } from "@/content/site";
import { BODY_HTML } from "./body";

// body.ts is generated from the original AILU Celebrations page and must not be edited by hand.
// The site-specific changes are applied here instead, and worldMarkup.test.ts checks the result.
const COPY = SITE_CONTENT.world;

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const linkBtn = (href: string, label: string, line = false) =>
  `<a class="btn${line ? " line" : ""}" href="${esc(href)}">${esc(label)} <span aria-hidden="true">↗</span></a>`;

/** Links inside the world that open a real page of the site. Anything not listed stays inside the world. */
export const WORLD_ROUTES: Record<string, string> = {
  "#jobs": "/join/team",
  "#apply": "/join/team",
  "#dreams": "/dreams",
  "#share": "/dreams",
  "#enquire": "/events#enquire",
  "#policies": "/privacy",
  "#donate": "/donate",
};

// The engine moves these elements into its form card by id, so the replacement keeps the id.
function formLink(attrs: string) {
  const id = /\bid="(\w+)"/.exec(attrs)?.[1] as keyof typeof COPY.forms | undefined;
  const item = id && COPY.forms[id];
  if (!item) return "";
  return `<div class="wide" id="${id}" style="display:grid;gap:12px"><p class="lede">${esc(item.lead)}</p><div class="cta">${linkBtn(item.href, item.label)}</div><p class="fine">${esc(item.note)}</p></div>`;
}

const partnerCard = (headTag: "h3") =>
  `<div><span class="status">${esc(COPY.partner.status)}</span><${headTag}>${esc(COPY.partner.title)}</${headTag}><p>${esc(COPY.partner.body)}</p><p class="fine">${esc(COPY.partner.note)}</p>${linkBtn(COPY.partner.href, COPY.partner.label, true)}</div>`;

// The rewards engine still looks up these ids, so they stay as hidden, empty elements.
const rewardsView = `<main id="rewardsView" hidden>
  <div hidden aria-hidden="true"><div id="hands"><canvas id="rwFx"></canvas></div><b id="tally"></b><button type="button" id="rwReset" tabindex="-1"></button></div>
  <section class="page-hero"><div class="wrap"><div class="sec-head">
    <p class="eyebrow">${esc(COPY.referral.eyebrow)}</p>
    <h1>${esc(COPY.referral.title)} <em>${esc(COPY.referral.em)}</em></h1>
    <p class="lede">${esc(COPY.referral.body)}</p>
    <div class="cta">${linkBtn(COPY.partner.href, COPY.partner.label)}${linkBtn("/referral-policy", "Read the referral policy", true)}</div>
  </div></div></section>
</main>`;

const policiesView = `<main id="policiesView" hidden>
  <section class="page-hero"><div class="wrap"><div class="sec-head">
    <p class="eyebrow">Clear expectations</p>
    <h1>${esc(COPY.policies.title)} <em>${esc(COPY.policies.em)}</em></h1>
    <p class="lede">${esc(COPY.policies.body)}</p>
    <div class="cta">${COPY.policies.links.map((link, i) => linkBtn(link.href, link.label, i > 0)).join("")}</div>
  </div></div></section>
</main>`;

const PATCHES: [RegExp, string | ((match: string, ...groups: string[]) => string)][] = [
  // No form inside the world may collect data.
  [/<form class="waForm"([^>]*)>[\s\S]*?<\/form>/g, (_m, attrs) => formLink(attrs)],
  // Rewards/points preview stays out until AILU decides on rewards.
  [/\s*<a href="#rewards" data-v="rewards">Rewards<\/a>/g, ""],
  [/<a href="#rewards">Rewards<\/a>/g, ""],
  [/<div><span class="status">[^<]*<\/span><h3>AILU Rewards<\/h3>[\s\S]*?<\/a><\/div>/, () => partnerCard("h3")],
  [/<main id="rewardsView" hidden>[\s\S]*?<\/main>/, () => rewardsView],
  // The partner programme is open (/join/partner); the old copy said it was closed.
  [/<div><span class="status">[^<]*<\/span><h3>Field sales and referrals<\/h3>[\s\S]*?<\/p><\/div>/, () => partnerCard("h3")],
  // The old policy summary described another host and a closed referral programme. The real pages are the source.
  [/<main id="policiesView" hidden>[\s\S]*?<\/main>/, () => policiesView],
  // Dreams: private, guardian involvement for minors, form lives on /dreams.
  [/<span class="status">Open<\/span><h3>AILU Dreamers<\/h3>/, () => `<span class="status">${esc(COPY.dreamsStatus)}</span><h3>AILU Dreamers</h3>`],
  [/<p class="lede">Your words stay between you and AILU\.[^<]*<\/p>/, () => `<p class="lede">${esc(COPY.dreamsShareLead)}</p>`],
  [/<p class="fine">Private submissions for adults\.[^<]*<\/p>/, () => `<p class="fine">${esc(COPY.dreamsShareNote)}</p>`],
];

export function buildWorldMarkup(source: string = BODY_HTML) {
  let html = source;
  for (const [pattern, replacement] of PATCHES) html = html.replace(pattern, replacement as string);
  return html.replace(/href="(#[a-z]+)"/g, (match, hash: string) => (WORLD_ROUTES[hash] ? `href="${WORLD_ROUTES[hash]}"` : match));
}

export const WORLD_MARKUP = buildWorldMarkup();

/** Places the engine still builds that the site has switched off (see CHANGES_FOR_GENERATOR.md). */
export const HIDDEN_PLACES = ["Rewards"];
