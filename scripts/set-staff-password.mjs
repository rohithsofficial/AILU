// Sets a staff password from your own computer, for the first owner or a lost owner password.
// Usage: npm run staff:password -- owner@example.com
// The password is typed here and is never stored in a file. Only its hash goes to the database.
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import readline from "node:readline";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email.includes("@")) { console.error("Usage: npm run staff:password -- owner@example.com"); process.exit(1); }
if (!process.env.DIRECT_URL) { console.error("DIRECT_URL is missing from .env.local."); process.exit(1); }

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => { if (text.includes(question)) process.stdout.write(text); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write("\n"); resolve(answer); });
  });
}

const password = await askHidden("New password (at least 10 characters): ");
if (password.length < 10) { console.error("Use at least 10 characters."); process.exit(1); }
if (password !== await askHidden("Type it again: ")) { console.error("The two passwords do not match."); process.exit(1); }

const N = 32768, R = 8, P = 1;
const salt = randomBytes(16);
const key = await promisify(scrypt)(password, salt, 64, { N, r: R, p: P, maxmem: 128 * 1024 * 1024 });
const hash = `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;

const client = new pg.Client({ connectionString: process.env.DIRECT_URL });
await client.connect();
try {
  const updated = await client.query(`UPDATE "StaffUser" SET "passwordHash" = $1, "passwordChangedAt" = NOW() WHERE email = $2`, [hash, email]);
  if (updated.rowCount) {
    console.log(`Password set for ${email}.`);
  } else {
    const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM "StaffUser"`);
    if (rows[0].count !== 0) {
      console.error(`${email} is not in the staff list. Add them at /admin/settings/staff.`);
      process.exitCode = 1;
    } else {
      await client.query(`INSERT INTO "StaffUser" (id, email, name, role, active, "passwordHash", "passwordChangedAt") VALUES ($1, $2, $2, 'OWNER', true, $3, NOW())`, [randomBytes(12).toString("hex"), email, hash]);
      console.log(`Created the first owner: ${email}.`);
    }
  }
} finally {
  await client.end();
}
