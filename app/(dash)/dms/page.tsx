import { Suspense } from "react";
import Link from "next/link";
import { getDashboard, getDmCounts, getKeywordComments, type DmStats } from "@/lib/ig";
import CopyButton from "@/components/copy-button";
import { num, pct } from "@/lib/format";

export default function DmsPage() {
  return (
    <>
      <h1 className="page-title">Comment to DM</h1>
      <p className="lead muted">DMs the bot sent per keyword, the public &quot;check your DMs&quot; replies under those comments, and the comments on the reel.</p>
      <Suspense fallback={<div>{Array.from({ length: 4 }, (_, i) => <div key={i} className="skel skel-row" />)}</div>}>
        <Queue />
      </Suspense>
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

// Keyword comments from the last 8 days the bot hasn't DM'd: reply by hand from here.
async function Queue() {
  const [dmRaw, { posts }] = await Promise.all([getDmCounts(), getDashboard()]);
  const newest = posts.reduce((m, p) => (p.date > m ? p.date : m), "");
  const comments = newest ? await getKeywordComments(posts, newest) : [];
  const dm: DmStats | null = dmRaw && !("error" in dmRaw) ? dmRaw : null;
  const known = new Set(dm?.replied ?? []);
  const waiting = comments.filter((c) => !known.has(c.id));
  return (
    <section className="card list-card queue" aria-labelledby="queue-h">
      <div className="section-head">
        <h2 id="queue-h">Waiting for a DM</h2>
        <p className="muted small">{dm ? `${waiting.length} of ${comments.length} keyword comments in the last 8 days` : "bot status unknown until STATS_TOKEN is set"}</p>
      </div>
      {waiting.length === 0 ? (
        <p className="muted">Nobody is waiting. Every keyword comment Instagram shows apps has had its DM.</p>
      ) : (
        <ul className="qlist">
          {waiting.map((c) => (
            <li key={c.id} className="qrow">
              <div className="qtext">
                <a href={`https://www.instagram.com/${c.username}/`} target="_blank" rel="noreferrer" className="qname">@{c.username}</a>
                <span className="muted small"> on {c.keyword}, {new Date(c.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}</span>
                <p className="qcomment">{c.text}</p>
              </div>
              <div className="qactions">
                {dm?.texts[c.keyword] && <CopyButton text={dm.texts[c.keyword]} />}
                <a className="btn btn-quiet btn-small" href={c.permalink} target="_blank" rel="noreferrer">Open reel</a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="muted small">Comments Instagram hides from apps (its spam filter, limited accounts) never show here. Check Hidden comments in the app too.</p>
    </section>
  );
}
