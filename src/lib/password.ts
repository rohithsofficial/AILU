import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Staff passwords use the scrypt built into Node. scripts/set-staff-password.mjs writes the same format.
const N = 32768, R = 8, P = 1, KEY_LENGTH = 64, MAX_MEMORY = 128 * 1024 * 1024;
export const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 200;

function derive(password: string, salt: Buffer, n: number, r: number, p: number, length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, length, { N: n, r, p, maxmem: MAX_MEMORY }, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (password.length > PASSWORD_MAX_LENGTH) return "That password is too long.";
  return null;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P, KEY_LENGTH);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p), expected.length);
  return timingSafeEqual(actual, expected);
}

// Compared when the email is unknown, so a wrong email takes as long as a wrong password.
export const DUMMY_HASH = `scrypt$${N}$${R}$${P}$${"A".repeat(22)}==$${"A".repeat(86)}==`;
