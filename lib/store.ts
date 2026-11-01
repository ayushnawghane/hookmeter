/* eslint-disable @typescript-eslint/no-explicit-any -- raw Graph API / Redis JSON */
// Daily snapshots in Upstash Redis (REST API, no SDK). Optional: without the env vars, history is off.
import { cacheLife, cacheTag } from "next/cache";

export type Snapshot = {
  date: string;
  followers: number;
  reach?: number;
  reachNonFollower?: number;
  views?: number;
  posts: Record<string, { views?: number; reach?: number; skip?: number; shares?: number }>;
};

const url = () => process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const historyEnabled = () => Boolean(url() && token());

async function redis(...command: (string | number)[]): Promise<any> {
  const res = await fetch(url()!, {
    method: "POST",
    headers: { authorization: `Bearer ${token()}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const body = await res.json();
  if (body.error) throw new Error(`Redis: ${body.error}`);
  return body.result;
}

export async function saveSnapshot(s: Snapshot): Promise<void> {
  await redis("SET", `snap:${s.date}`, JSON.stringify(s));
  await redis("SADD", "snap:dates", s.date);
}

export async function getSnapshots(): Promise<Snapshot[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag("snapshots");

  if (!historyEnabled()) return [];
  const dates: string[] = ((await redis("SMEMBERS", "snap:dates")) ?? []).sort();
  if (!dates.length) return [];
  const rows: (string | null)[] = await redis("MGET", ...dates.map((d) => `snap:${d}`));
  return rows.filter(Boolean).map((r) => JSON.parse(r!));
}
