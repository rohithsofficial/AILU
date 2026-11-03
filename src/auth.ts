import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getPrisma } from "@/lib/db";

// Bootstrap allowlist: these emails become OWNER the first time they sign in.
// Everyone else must be added to StaffUser by an OWNER before they can sign in.
export const ownerAllowlist = () =>
  (process.env.STAFF_OWNER_EMAILS ?? "")
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

// Dev-only password login so role gating can be tested without Google credentials.
// Never enable in production: it is ignored unless ADMIN_DEV_LOGIN=true AND NODE_ENV !== "production".
export const devLoginEnabled =
  process.env.ADMIN_DEV_LOGIN === "true" && process.env.NODE_ENV !== "production";

export const authConfigured = () => !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

async function recogniseStaff(email: string, name: string) {
  const db = getPrisma();
  const lower = email.toLowerCase();
  let staff = await db.staffUser.findUnique({ where: { email: lower } });
  if (!staff) {
    if (!ownerAllowlist().includes(lower)) return null; // not allowlisted
    staff = await db.staffUser.create({ data: { email: lower, name: name || lower, role: "OWNER", active: true } });
  }
  if (!staff.active) return null;
  return staff;
}

const providers = [];
if (authConfigured()) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
  // AUTH_SECRET is preferred; PREVIEW_SECRET is already a long server-only random string and serves as a safe fallback.
  secret: process.env.AUTH_SECRET || process.env.PREVIEW_SECRET,
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
  },
});
