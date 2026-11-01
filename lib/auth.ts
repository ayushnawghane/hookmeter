// Password gate. The password is APP_PASSWORD until it's changed in Settings; after that a salted
// PBKDF2 hash in Redis (auth:password) wins. The session cookie is an HMAC keyed by whichever is
// current, so a change signs out every other device.
import { redis, redisEnabled } from "./redis";

export const COOKIE = "ig_session";
const KEY = "auth:password";
const ITERATIONS = 210_000;
const enc = new TextEncoder();

type Stored = { salt: string; hash: string; iter: number; changedAt: string };

const hex = (buf: ArrayBuffer | Uint8Array) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const unhex = (s: string) => new Uint8Array(s.match(/../g)!.map((h) => parseInt(h, 16)));

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Cached for 30 s per server instance, so most requests don't wait on Redis.
let memo: { at: number; value: Stored | null } | null = null;

export async function getStoredPassword(fresh = false): Promise<Stored | null> {
  if (!redisEnabled()) return null;
  if (!fresh && memo && Date.now() - memo.at < 30_000) return memo.value;
  const raw = await redis("GET", KEY);
  memo = { at: Date.now(), value: raw ? JSON.parse(raw) : null };
  return memo.value;
}

async function pbkdf2(password: string, salt: Uint8Array, iter: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: iter }, key, 256);
  return hex(bits);
}

export async function checkPassword(password: string): Promise<boolean> {
  const stored = await getStoredPassword(true);
  if (stored) return safeEqual(await pbkdf2(password, unhex(stored.salt), stored.iter), stored.hash);
  const env = process.env.APP_PASSWORD ?? "";
  return Boolean(env) && safeEqual(password, env);
}

export async function setPassword(password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const stored: Stored = { salt: hex(salt), hash: await pbkdf2(password, salt, ITERATIONS), iter: ITERATIONS, changedAt: new Date().toISOString() };
  await redis("SET", KEY, JSON.stringify(stored));
  memo = { at: Date.now(), value: stored };
}

export async function sessionValue(fresh = false): Promise<string> {
  const stored = await getStoredPassword(fresh);
  const secret = stored?.hash ?? process.env.APP_PASSWORD;
  if (!secret) throw new Error("APP_PASSWORD is not set");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode("ig-insights-session-v1")));
}
