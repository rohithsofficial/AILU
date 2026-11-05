import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getPrisma } from "@/lib/db";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";
import { clientIpFrom, consumeRateLimit, PUBLIC_RATE_LIMITS } from "@/lib/rate-limit";
import type { StaffRole } from "@prisma/client";

export const bootstrapEmail = () => (process.env.ADMIN_BOOTSTRAP_EMAIL ?? "").trim().toLowerCase();

// Staff sign in with email and password. Google stays available behind this switch for later.
export const googleEnabled = () =>
  process.env.AUTH_GOOGLE_ENABLED === "true" && !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

async function recogniseStaff(email: string, name: string) {
  const db = getPrisma();
  const lower = email.toLowerCase();
  let staff = await db.staffUser.findUnique({ where: { email: lower } });
  if (!staff) {
    // The bootstrap address is valid only while the staff table is empty.
    // Once an owner has been created, all new staff must be added by an owner.
    if (lower !== bootstrapEmail() || (await db.staffUser.count()) !== 0) return null;
    try {
      staff = await db.staffUser.create({ data: { email: lower, name: name || lower, role: "OWNER", active: true } });
    } catch (error) {
      // Handle two first-time OAuth callbacks racing to create the bootstrap owner.
      staff = await db.staffUser.findUnique({ where: { email: lower } });
      if (!staff) throw error;
    }
  }
  if (!staff.active) return null;
  return staff;
}

// RATE_LIMIT_SALT protects the public forms; AUTH_SECRET keeps login limits working if it is not set yet.
async function loginAllowed(email: string, request: Request) {
  const store = getPrisma();
  const salt = process.env.RATE_LIMIT_SALT || process.env.AUTH_SECRET;
  const ip = await consumeRateLimit({ store, ...PUBLIC_RATE_LIMITS.staffLoginIp, identifier: clientIpFrom(request.headers), salt });
  const account = await consumeRateLimit({ store, ...PUBLIC_RATE_LIMITS.staffLoginEmail, identifier: email, salt });
  return ip.allowed && account.allowed;
}

const providers = [];
providers.push(
  Credentials({
    id: "password",
    name: "Email and password",
    credentials: { email: { label: "Email" }, password: { label: "Password" } },
    authorize: async (creds, request) => {
      const email = String(creds?.email ?? "").trim().toLowerCase();
      const password = String(creds?.password ?? "");
      if (!email || !password || password.length > 200) return null;
      if (!(await loginAllowed(email, request))) return null;
      const staff = await getPrisma().staffUser.findUnique({ where: { email } });
      const matches = await verifyPassword(password, staff?.passwordHash ?? DUMMY_HASH);
      if (!staff?.passwordHash || !staff.active || !matches) return null;
      return { id: staff.id, email: staff.email, name: staff.name };
    },
  }),
);
if (googleEnabled()) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers,
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 }, // staff sessions last half a day
  callbacks: {
    signIn: async ({ user }) => {
      const email = user?.email;
      if (!email) return false;
      const staff = await recogniseStaff(email, user.name ?? "");
      if (!staff) return false;
      await getPrisma().auditLog.create({
        data: { actorId: staff.id, action: "staff.sign_in", entity: "StaffUser", entityId: staff.id },
      });
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) token.signedInAt = Date.now();
      const email = token.email?.toLowerCase();
      if (!email) return token;
      const staff = await getPrisma().staffUser.findUnique({ where: { email } });
      // A password change or reset signs out every session that started before it.
      const signedInAt = typeof token.signedInAt === "number" ? token.signedInAt : 0;
      if (staff?.passwordChangedAt && signedInAt < staff.passwordChangedAt.getTime()) return null;
      token.staffId = staff?.active ? staff.id : undefined;
      token.role = staff?.active ? staff.role : undefined;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = typeof token.staffId === "string" ? token.staffId : "";
        session.user.role = token.role as StaffRole | undefined;
      }
      return session;
    },
  },
});
