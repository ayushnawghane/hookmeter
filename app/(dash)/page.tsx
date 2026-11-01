import { Suspense } from "react";
import Link from "next/link";
import { getDashboard, median } from "@/lib/ig";
import { num, pct, secs, shortDate } from "@/lib/format";
import PostsTable from "@/components/posts-table";
import SkipBar from "@/components/skip-bar";
import { ArrowIcon } from "@/components/icons";
import OpenerCard from "@/components/opener-card";
import { getOpenerTags } from "@/lib/openers";

export default function PostsPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const [{ account: a, posts, pulledAt }, tags] = await Promise.all([getDashboard(), getOpenerTags()]);
  // Reels with enough views for the skip rate to mean something, newest first.
  const reels = posts.filter((p) => p.format === "reel" && typeof p.skip === "number" && (p.views ?? 0) >= 100);
  const latest = reels[0];
  const before = reels.slice(1, 6);
  const beforeMedian = before.length ? median(before.map((p) => p.skip!)) : undefined;
  const last5 = reels.slice(0, 5);
  const watch = last5.length ? median(last5.filter((p) => p.avgWatch !== undefined).map((p) => p.avgWatch!)) : undefined;
  const nonFollowerShare = a.reach && a.reachNonFollower !== undefined ? (a.reachNonFollower / a.reach) * 100 : undefined;
  const first = (a.name || a.username).split(" ")[0];
  const delta = latest && beforeMedian !== undefined ? latest.skip! - beforeMedian : undefined;

  return (
    <>
      <header className="hello">
        <div>
          <h1>Hello {first}</h1>
          <p className="muted">Here&apos;s how your reels are doing.</p>
        </div>
        {a.picture && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.picture} alt="" referrerPolicy="no-referrer" width={48} height={48} className="avatar" />
        )}
      </header>

      {latest && (
        <section className="spotlight" aria-labelledby="spot-h">
          <h2 id="spot-h" className="spot-head">Your latest reel, {latest.keyword ?? "untitled"}, {shortDate(latest.date)}</h2>
          <p className="spot-figure"><span className="spot-num">{pct(latest.skip)}</span> <span className="spot-unit">skip rate</span></p>
          <SkipBar value={latest.skip} pill={false} />
          {beforeMedian !== undefined && (
            <p className="spot-note">
              {delta! <= 0 ? "Fewer people swiped away than usual." : "More people swiped away than usual."} Your median over the {before.length} reels before it was {pct(beforeMedian)}. Aim for under 50%.
            </p>
          )}
          <Link href={`/post/${latest.id}`} className="spot-link">
            See the reel <span className="spot-link-icon"><ArrowIcon /></span>
          </Link>
        </section>
      )}

      <dl className="stat-cards">
        <div className="card stat"><dt>Followers</dt><dd>{num(a.followers)}</dd></div>
        <div className="card stat"><dt>Reach, {a.days} days</dt><dd>{num(a.reach)}</dd><p className="stat-sub">{pct(nonFollowerShare)} from non-followers</p></div>
        <div className="card stat"><dt>Profile views, {a.days} days</dt><dd>{num(a.profileViews)}</dd></div>
        <div className="card stat"><dt>Avg watch, last {last5.length} reels</dt><dd>{secs(watch)}</dd><p className="stat-sub">median per reel</p></div>
      </dl>

      <OpenerCard posts={posts} tags={tags} />

      <PostsTable posts={posts} tags={tags} />
      <p className="pulled">Pulled {new Date(pulledAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST. Instagram can lag up to 48 hours.</p>
    </>
  );
}

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your numbers">
      <div className="skel" style={{ height: 64, marginBottom: 24 }} />
      <div className="skel" style={{ height: 260, marginBottom: 16, borderRadius: 24 }} />
      <div className="stat-cards">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 120, borderRadius: 24 }} />)}</div>
      <div className="skel" style={{ height: 420, borderRadius: 24 }} />
    </div>
  );
}
