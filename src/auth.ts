import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getPrisma } from "@/lib/db";
import type { StaffRole } from "@prisma/client";

export const bootstrapEmail = () => (process.env.ADMIN_BOOTSTRAP_EMAIL ?? "").trim().toLowerCase();

// Dev-only password login so role gating can be tested without Google credentials.
// Never enable in production: it is ignored unless ADMIN_DEV_LOGIN=true AND NODE_ENV !== "production".
export const devLoginEnabled =
  process.env.ADMIN_DEV_LOGIN === "true" && process.env.NODE_ENV !== "production";

export const authConfigured = () => !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

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

const providers = [];
if (authConfigured()) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}
if (devLoginEnabled) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev staff login",
      credentials: { email: { label: "Email" }, password: { label: "Password" } },
      authorize: async (creds) => {
        if (!creds?.email || !creds.password || !process.env.ADMIN_DEV_PASSWORD) return null;
        if (creds.password !== process.env.ADMIN_DEV_PASSWORD) return null;
        const staff = await recogniseStaff(String(creds.email), "");
        if (!staff) return null;
        return { id: staff.id, email: staff.email, name: staff.name };
      },
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
    jwt: async ({ token }) => {
      const email = token.email?.toLowerCase();
      if (!email) return token;
      const staff = await getPrisma().staffUser.findUnique({ where: { email } });
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
