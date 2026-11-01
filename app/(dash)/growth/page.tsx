import { Suspense } from "react";
import { getSnapshots, historyEnabled } from "@/lib/store";
import LineChart from "@/components/line-chart";

export default function GrowthPage() {
  return (
    <>
      <h1 className="page-title">Growth</h1>
      <Suspense fallback={<div className="charts">{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 260 }} />)}</div>}>
        <Charts />
      </Suspense>
    </>
  );
}

async function Charts() {
  if (!historyEnabled()) {
    return (
      <section className="state">
        <h2>History is off</h2>
        <p>Growth charts need somewhere to keep a daily snapshot. In Vercel, open this project, then Storage, and add Upstash Redis (free). The first snapshot is saved that night.</p>
      </section>
    );
  }
  const snaps = await getSnapshots();
  return (
    <div className="charts">
      <LineChart title="Followers" points={snaps.map((s) => ({ x: s.date, y: s.followers }))} />
      <LineChart title="Reach, last 28 days" points={snaps.filter((s) => s.reach !== undefined).map((s) => ({ x: s.date, y: s.reach! }))} />
      <LineChart title="Reach from non-followers, last 28 days" points={snaps.filter((s) => s.reachNonFollower !== undefined).map((s) => ({ x: s.date, y: s.reachNonFollower! }))} />
    </div>
  );
}
