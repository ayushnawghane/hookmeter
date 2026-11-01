import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDashboard } from "@/lib/ig";
import { getSnapshots, historyEnabled } from "@/lib/store";
import { num, pct, secs, shortDate } from "@/lib/format";
import SkipBar from "@/components/skip-bar";
import LineChart from "@/components/line-chart";
import OpenerPicker from "@/components/opener-picker";
import { getOpenerTags } from "@/lib/openers";
import { openerFor } from "@/lib/opener-types";

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="skel" style={{ height: 420 }} aria-busy="true" aria-label="Loading post" />}>
      <PostDetail params={params} />
    </Suspense>
  );
}

async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ posts }, snaps, tags] = await Promise.all([getDashboard(), getSnapshots(), getOpenerTags()]);
  const p = posts.find((x) => x.id === id);
  if (!p) notFound();
  const series = snaps.filter((s) => s.posts[id]?.views !== undefined).map((s) => ({ x: s.date, y: s.posts[id].views! }));
  const rows: [string, string][] = [
    ["Views", num(p.views)],
    ["Reach", num(p.reach)],
    ["Likes", num(p.likes)],
    ["Comments", num(p.comments)],
    ["Shares", num(p.shares)],
    ["Sends per 1k reach", p.reach && p.shares !== undefined ? ((p.shares / p.reach) * 1000).toFixed(1) : "n/a"],
    ["Saves", num(p.saved)],
    ["Saves per 1k reach", p.reach && p.saved !== undefined ? ((p.saved / p.reach) * 1000).toFixed(1) : "n/a"],
    ["Reposts", num(p.reposts)],
  ];
  if (p.format === "reel") rows.splice(0, 0, ["Avg watch", secs(p.avgWatch)]);
  else rows.push(["Follows from post", num(p.follows)], ["Profile visits", num(p.profile_visits)]);

  return (
    <article className="detail">
      <p><Link href="/" className="back">Back to posts</Link></p>
      <header className="detail-head">
        {p.thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.thumb} alt="" referrerPolicy="no-referrer" width={120} height={150} className="detail-thumb" />
        )}
        <div>
          <h1>{p.keyword ? `${p.keyword} ${p.format}` : p.format}</h1>
          <p className="muted">{shortDate(p.date)}. {p.caption}</p>
          <p><a href={p.permalink} target="_blank" rel="noreferrer">Open on Instagram</a></p>
        </div>
      </header>
      {p.error && <p className="state state-error" role="alert">Instagram returned no insights for this post: {p.error}</p>}
      {p.format === "reel" && (
        <section className="spotlight detail-skip" aria-label="Skip rate">
          <p className="spot-label">Skip rate</p>
          <p className="spot-figure"><span className="spot-num">{pct(p.skip)}</span> <span className="spot-unit">swiped away in 3 s</span></p>
          <SkipBar value={p.skip} pill={false} />
        </section>
      )}
      {p.format === "reel" && (
        <section className="card panel" aria-labelledby="f0-h">
          <h2 id="f0-h">What did frame 0 show?</h2>
          <OpenerPicker mediaId={p.id} current={openerFor(p, tags)} />
        </section>
      )}
      <dl className="metric-list card">
        {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="num">{v}</dd></div>)}
      </dl>
      {historyEnabled() ? <LineChart title="Views by day" points={series} /> : <p className="state-inline">Connect Upstash Redis to see views by day.</p>}
    </article>
  );
}
