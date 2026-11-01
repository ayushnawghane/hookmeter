import { Suspense } from "react";
import { getCompetitors } from "@/lib/ig";
import { num, shortDate } from "@/lib/format";

export default function CompetitorsPage() {
  return (
    <>
      <h1 className="page-title">Competitor outliers</h1>
      <p className="lead muted">Reels that got 3 times or more their own account&apos;s usual views. Start research here.</p>
      <Suspense fallback={<div>{Array.from({ length: 5 }, (_, i) => <div key={i} className="skel skel-row" />)}</div>}>
        <Outliers />
      </Suspense>
    </>
  );
}

async function Outliers() {
  if (!process.env.COMPETITORS) {
    return <section className="state"><p>No accounts to watch yet. Add usernames to COMPETITORS in Vercel, separated by commas.</p></section>;
  }
  const { accounts, outliers } = await getCompetitors();
  const newest = outliers.reduce((m, o) => (o.date > m ? o.date : m), "");
  return (
    <>
      {outliers.length === 0 ? (
        <section className="state"><p>No reel beat 3 times its account&apos;s median in the last 25 posts. Check back tomorrow, or add more accounts.</p></section>
      ) : (
        <div className="card list-card"><table className="ledger">
          <thead>
            <tr>
              <th scope="col">Reel</th>
              <th scope="col" className="num-col">Times usual</th>
              <th scope="col" className="num-col">Views</th>
              <th scope="col" className="num-col">Comments</th>
            </tr>
          </thead>
          <tbody>
            {outliers.map((o) => (
              <tr key={o.id}>
                <th scope="row">
                  <a href={o.permalink} target="_blank" rel="noreferrer" className="post-cell">
                    <span className="post-text">
                      <span className="post-title">{o.caption || "No caption"}</span>
                      <span className="post-meta">@{o.username}, {shortDate(o.date, newest)}</span>
                    </span>
                  </a>
                </th>
                <td data-label="Times usual" className="num ratio">{o.ratio.toFixed(1)}×</td>
                <td data-label="Views" className="num">{num(o.views)}</td>
                <td data-label="Comments" className="num">{num(o.comments)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
      <details className="accounts card">
        <summary>Accounts watched ({accounts.length})</summary>
        <ul>
          {accounts.map((a) => (
            <li key={a.username}>
              <a href={`https://www.instagram.com/${a.username}/`} target="_blank" rel="noreferrer">@{a.username}</a>
              {a.error ? <span className="error-text"> could not be read: {a.error}</span> : <span className="muted num"> {num(a.followers)} followers, usual reel {num(Math.round(a.medianViews))} views</span>}
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
