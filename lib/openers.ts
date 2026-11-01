// Frame-0 tags kept in Redis (hash "opener", media id -> type). Server only.
import { cacheLife, cacheTag } from "next/cache";
import { redis, redisEnabled } from "./redis";
import type { Opener } from "./opener-types";

export async function getOpenerTags(): Promise<Record<string, Opener>> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 86400 });
  cacheTag("openers");
  if (!redisEnabled()) return {};
  const flat: string[] = (await redis("HGETALL", "opener")) ?? [];
  const tags: Record<string, Opener> = {};
  for (let i = 0; i < flat.length; i += 2) tags[flat[i]] = flat[i + 1] as Opener;
  return tags;
}

export async function saveOpener(mediaId: string, opener: Opener): Promise<void> {
  await redis("HSET", "opener", mediaId, opener);
}
