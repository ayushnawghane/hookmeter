import { Suspense } from "react";
import Link from "next/link";
import { getDashboard, getDmCounts } from "@/lib/ig";
import { num, pct } from "@/lib/format";

export default function DmsPage() {
  return (
    <>
      <h1 className="page-title">Comment to DM</h1>
      <p className="lead muted">DMs the bot sent per keyword, the public &quot;check your DMs&quot; replies under those comments, and the comments on the reel.</p>
      <Suspense fallback={<div>{Array.from({ length: 5 }, (_, i) => <div key={i} className="skel skel-row" />)}</div>}>
        <Keywords />
      </Suspense>
    </>
  );
}

async function Keywords() {
  const [dm, { posts }] = await Promise.all([getDmCounts(), getDashboard()]);
  if (!dm) {
    return <section className="state"><p>Not connected to the bot. Set BOT_STATS_URL and BOT_STATS_TOKEN in Vercel, and the same token as STATS_TOKEN on the worker.</p></section>;
  }
  if ("error" in dm) {
    return <section className="state state-error" role="alert"><h2>The bot didn&apos;t share its numbers</h2><p>{dm.error}</p></section>;
  }
  const rows = Object.entries(dm.counts).map(([word, sent]) => {
    const post = posts.find((p) => p.keyword === word);
    return { word, sent, replied: dm.publicReplies[word] ?? 0, post, rate: post?.comments ? (sent / post.comments) * 100 : undefined };
  });
  rows.sort((a, b) => b.sent - a.sent);
  return (
    <div className="card list-card"><table className="ledger">
      <thead>
        <tr>
          <th scope="col">Keyword</th>
          <th scope="col" className="num-col">DMs sent</th>
          <th scope="col" className="num-col">Public replies</th>
          <th scope="col" className="num-col">Comments on reel</th>
          <th scope="col" className="num-col">DMs per comment</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.word}>
            <th scope="row">
              {r.post ? <Link href={`/post/${r.post.id}`} className="kw">{r.word}</Link> : <span className="kw">{r.word}</span>}
              {!r.post && <span className="post-meta"> no live reel found</span>}
            </th>
            <td data-label="DMs sent" className="num">{num(r.sent)}</td>
            <td data-label="Public replies" className="num">{num(r.replied)}</td>
            <td data-label="Comments on reel" className="num">{num(r.post?.comments)}</td>
            <td data-label="DMs per comment" className="num">{pct(r.rate)}</td>
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}
