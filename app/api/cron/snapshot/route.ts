import { revalidateTag } from "next/cache";
import { loadDashboard } from "@/lib/ig";
import { historyEnabled, saveSnapshot, type Snapshot } from "@/lib/store";

// Vercel Cron calls this daily with "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }
  if (!historyEnabled()) return Response.json({ saved: false, reason: "Upstash Redis is not connected" });

  const { account, posts } = await loadDashboard();
  const snap: Snapshot = {
    date: new Date().toISOString().slice(0, 10),
    followers: account.followers,
    reach: account.reach,
    reachNonFollower: account.reachNonFollower,
    views: account.views,
    posts: Object.fromEntries(posts.map((p) => [p.id, { views: p.views, reach: p.reach, skip: p.skip, shares: p.shares }])),
  };
  await saveSnapshot(snap);
  revalidateTag("snapshots", "max");
  return Response.json({ saved: true, date: snap.date, posts: posts.length });
}
