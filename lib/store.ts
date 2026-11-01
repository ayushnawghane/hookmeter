// Daily snapshots in Upstash Redis (REST API, no SDK). Optional: without the env vars, history is off.
import { cacheLife, cacheTag } from "next/cache";
import { redis, redisEnabled } from "./redis";

export type Snapshot = {
  date: string;
  followers: number;
  reach?: number;
  reachNonFollower?: number;
  views?: number;
  posts: Record<string, { views?: number; reach?: number; skip?: number; shares?: number }>;
};

export const historyEnabled = redisEnabled;

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
