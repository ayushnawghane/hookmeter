/* eslint-disable @typescript-eslint/no-explicit-any -- raw Graph API / Redis JSON */
// Instagram Graph API reads for the dashboard. The token stays on the server.
// Metric names checked against v24.0 on 1 Nov 2026 (see ig-comment-dm/src/insights.ts).
import { cacheLife, cacheTag } from "next/cache";

const GRAPH = "https://graph.facebook.com/v24.0";

const COMMON = ["reach", "views", "likes", "comments", "shares", "saved", "total_interactions"];
const METRICS: Record<string, string[]> = {
  REELS: [...COMMON, "ig_reels_avg_watch_time", "ig_reels_video_view_total_time", "reels_skip_rate", "reposts"],
  FEED: [...COMMON, "profile_visits", "follows"],
};
const ACCOUNT_METRICS = ["reach", "views", "profile_views", "accounts_engaged", "total_interactions"];

export type Format = "reel" | "carousel" | "image" | "video";

export type Post = {
  id: string;
  date: string;
  format: Format;
  caption: string;
  keyword: string | null;
  permalink: string;
  thumb: string | null;
  views?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saved?: number;
  reposts?: number;
  follows?: number;
  profile_visits?: number;
  total_interactions?: number;
  skip?: number;
  avgWatch?: number;
  aboveMedian: boolean;
  error?: string;
};

export type Account = {
  username: string;
  name?: string;
  picture?: string;
  followers: number;
  mediaCount: number;
  days: number;
  reach?: number;
  views?: number;
  profileViews?: number;
  accountsEngaged?: number;
  totalInteractions?: number;
  reachFollower?: number;
  reachNonFollower?: number;
};

export type Dashboard = { pulledAt: string; account: Account; posts: Post[] };

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function graph(path: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { authorization: `Bearer ${env("IG_ACCESS_TOKEN")}` } });
  const body = await res.json();
  if (body.error) throw new Error(body.error.error_user_title ?? `${path}: ${body.error.message}`);
  return body;
}

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function format(m: any): Format {
  if (m.media_product_type === "REELS") return "reel";
  if (m.media_type === "CAROUSEL_ALBUM") return "carousel";
  return m.media_type === "VIDEO" ? "video" : "image";
}

const firstLine = (s = "") => s.trim().split("\n")[0].trim();

async function listMedia(): Promise<any[]> {
  const media: any[] = [];
  let page = await graph(`${env("IG_USER_ID")}/media`, {
    fields: "id,caption,media_type,media_product_type,timestamp,permalink,thumbnail_url,media_url",
    limit: "100",
  });
  while (true) {
    media.push(...page.data);
    if (!page.paging?.next) break;
    page = await (await fetch(page.paging.next)).json();
  }
  return media;
}

async function postInsights(m: any): Promise<Record<string, number | string>> {
  const metrics = METRICS[m.media_product_type];
  if (!metrics) return {};
  try {
    const body = await graph(`${m.id}/insights`, { metric: metrics.join(",") });
    return Object.fromEntries(body.data.map((d: any) => [d.name, d.values[0].value]));
  } catch (err) {
    return { error: (err as Error).message };
  }
}

async function accountInsights(days: number): Promise<Account> {
  const id = env("IG_USER_ID");
  const until = Math.floor(Date.now() / 1000);
  const range = { period: "day", metric_type: "total_value", since: `${until - days * 86400}`, until: `${until}` };
  const [totals, split, profile] = await Promise.all([
    graph(`${id}/insights`, { ...range, metric: ACCOUNT_METRICS.join(",") }),
    graph(`${id}/insights`, { ...range, metric: "reach", breakdown: "follow_type" }),
    graph(id, { fields: "username,name,profile_picture_url,followers_count,media_count" }),
  ]);
  const t: Record<string, number> = Object.fromEntries(totals.data.map((d: any) => [d.name, d.total_value.value]));
  const a: Account = {
    username: profile.username,
    name: profile.name,
    picture: profile.profile_picture_url,
    followers: profile.followers_count,
    mediaCount: profile.media_count,
    days,
    reach: t.reach,
    views: t.views,
    profileViews: t.profile_views,
    accountsEngaged: t.accounts_engaged,
    totalInteractions: t.total_interactions,
  };
  for (const r of split.data[0]?.total_value?.breakdowns?.[0]?.results ?? []) {
    if (r.dimension_values[0] === "FOLLOWER") a.reachFollower = r.value;
    if (r.dimension_values[0] === "NON_FOLLOWER") a.reachNonFollower = r.value;
  }
  return a;
}

// Everything the posts screen needs, refreshed every 15 minutes (or on Refresh).
export async function getDashboard(): Promise<Dashboard> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
  cacheTag("ig");
  return loadDashboard();
}

// Uncached read, for the nightly snapshot.
export async function loadDashboard(): Promise<Dashboard> {
  const [media, account] = await Promise.all([listMedia(), accountInsights(28)]);
  const insights = await Promise.all(media.map(postInsights));
  const posts: Post[] = media.map((m, i) => {
    const ins: any = insights[i];
    const caption = firstLine(m.caption);
    return {
      id: m.id,
      date: m.timestamp.slice(0, 10),
      format: format(m),
      caption,
      // "Comment MARIO ..." anywhere in the caption (older captions put the ask lower down). Uppercase only,
      // so ordinary words after "comment" don't count.
      keyword: (m.caption ?? "").match(/\bcomment\s+([A-Z0-9]{3,})\b/i)?.[1]?.match(/^[A-Z0-9]+$/)?.[0] ?? null,
      permalink: m.permalink,
      thumb: m.thumbnail_url ?? (m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM" ? m.media_url : null) ?? null,
      views: ins.views,
      reach: ins.reach,
      likes: ins.likes,
      comments: ins.comments,
      shares: ins.shares,
      saved: ins.saved,
      reposts: ins.reposts,
      follows: ins.follows,
      profile_visits: ins.profile_visits,
      total_interactions: ins.total_interactions,
      skip: ins.reels_skip_rate,
      avgWatch: typeof ins.ig_reels_avg_watch_time === "number" ? ins.ig_reels_avg_watch_time / 1000 : undefined,
      aboveMedian: false,
      error: ins.error,
    };
  });
  for (const fmt of new Set(posts.map((p) => p.format))) {
    const group = posts.filter((p) => p.format === fmt);
    const med = median(group.map((p) => p.views ?? 0));
    for (const p of group) p.aboveMedian = (p.views ?? 0) > med;
  }
  return { pulledAt: new Date().toISOString(), account, posts };
}

export type CompetitorReel = {
  username: string;
  id: string;
  date: string;
  caption: string;
  permalink: string;
  views: number;
  likes: number;
  comments: number;
  ratio: number;
};

export type CompetitorAccount = { username: string; followers: number; medianViews: number; error?: string };

// Reels that did 3x or more their own account's median views. Cached 6 hours: one call per account.
export async function getCompetitors(): Promise<{ accounts: CompetitorAccount[]; outliers: CompetitorReel[] }> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 21600, expire: 172800 });
  cacheTag("competitors");

  const names = (process.env.COMPETITORS ?? "").split(",").map((s) => s.trim().replace(/^@/, "")).filter(Boolean);
  const accounts: CompetitorAccount[] = [];
  const outliers: CompetitorReel[] = [];
  await Promise.all(
    names.map(async (username) => {
      try {
        const body = await graph(env("IG_USER_ID"), {
          fields: `business_discovery.username(${username}){followers_count,media.limit(25){media_product_type,timestamp,caption,permalink,like_count,comments_count,view_count}}`,
        });
        const bd = body.business_discovery;
        const reels = (bd.media?.data ?? []).filter((m: any) => m.media_product_type === "REELS" && typeof m.view_count === "number");
        const med = median(reels.map((m: any) => m.view_count));
        const newest = reels.reduce((m: string, r: any) => (r.timestamp > m ? r.timestamp : m), "");
        const recentCutoff = newest ? new Date(newest).getTime() - 30 * 86400_000 : 0;
        accounts.push({ username, followers: bd.followers_count, medianViews: med });
        for (const m of reels) {
          const ratio = med ? m.view_count / med : 0;
          if (ratio >= 3 && new Date(m.timestamp).getTime() >= recentCutoff) {
            outliers.push({
              username,
              id: m.id,
              date: m.timestamp.slice(0, 10),
              caption: firstLine(m.caption).slice(0, 140),
              permalink: m.permalink,
              views: m.view_count,
              likes: m.like_count ?? 0,
              comments: m.comments_count ?? 0,
              ratio,
            });
          }
        }
      } catch (err) {
        accounts.push({ username, followers: 0, medianViews: 0, error: (err as Error).message });
      }
    }),
  );
  accounts.sort((a, b) => b.followers - a.followers);
  outliers.sort((a, b) => b.ratio - a.ratio);
  return { accounts, outliers };
}

// DMs sent per keyword, from the comment bot's /stats endpoint.
export type DmStats = {
  counts: Record<string, number>;
  publicReplies: Record<string, number>;
  replied: string[];
  texts: Record<string, string>;
};

export async function getDmCounts(): Promise<DmStats | { error: string } | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 86400 });
  cacheTag("ig");

  const url = process.env.BOT_STATS_URL;
  const token = process.env.BOT_STATS_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) return { error: `The bot answered ${res.status}. Set STATS_TOKEN on the worker to the same value as BOT_STATS_TOKEN here.` };
  const body = await res.json();
  // Older bot versions returned the counts object alone.
  return body.counts
    ? { counts: body.counts, publicReplies: body.publicReplies ?? {}, replied: body.replied ?? [], texts: body.texts ?? {} }
    : { counts: body, publicReplies: {}, replied: [], texts: {} };
}

export type KeywordComment = { id: string; username: string; text: string; timestamp: string; keyword: string; postId: string; permalink: string };

// Comments that contain a reel's keyword, on reels from the last 8 days (Instagram allows a private
// reply for 7 days). Comments Instagram hides from apps never appear here.
export async function getKeywordComments(posts: Post[], newestDate: string): Promise<KeywordComment[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 86400 });
  cacheTag("ig");

  const cutoff = new Date(`${newestDate}T00:00:00Z`).getTime() - 8 * 86400_000;
  const reels = posts.filter((p) => p.keyword && new Date(`${p.date}T00:00:00Z`).getTime() >= cutoff && (p.comments ?? 0) > 0);
  const found: KeywordComment[] = [];
  await Promise.all(
    reels.map(async (p) => {
      const body = await graph(`${p.id}/comments`, { fields: "id,text,username,timestamp", limit: "50" }).catch(() => ({ data: [] }));
      const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${p.keyword}([^\\p{L}\\p{N}]|$)`, "iu");
      for (const c of body.data ?? []) {
        if (c.text && pattern.test(c.text)) {
          found.push({ id: c.id, username: c.username ?? "someone", text: c.text, timestamp: c.timestamp, keyword: p.keyword!, postId: p.id, permalink: p.permalink });
        }
      }
    }),
  );
  return found.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
