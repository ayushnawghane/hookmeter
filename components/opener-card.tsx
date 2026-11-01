import Link from "next/link";
import type { Post } from "@/lib/ig";
import { median } from "@/lib/ig";
import { OPENERS, openerFor, type Opener } from "@/lib/opener-types";
import { pct, skipBand } from "@/lib/format";

// Median skip rate per frame-0 type. Horizontal bars on a 0-100% scale with the 50% target marked.
export default function OpenerCard({ posts, tags }: { posts: Post[]; tags: Record<string, Opener> }) {
  const reels = posts.filter((p) => p.format === "reel" && typeof p.skip === "number" && (p.views ?? 0) >= 100);
  const rows = OPENERS.map((o) => {
    const group = reels.filter((p) => openerFor(p, tags) === o.value);
    return { ...o, n: group.length, skip: group.length ? median(group.map((p) => p.skip!)) : undefined };
  });
  const untagged = reels.filter((p) => !openerFor(p, tags));
  return (
    <section className="card panel opener-card" aria-labelledby="opener-h">
      <div className="section-head">
        <h2 id="opener-h">Skip rate by opener</h2>
        <p className="muted small">median per type, reels with 100+ views</p>
      </div>
      <ul className="obars">
        {rows.map((r) => (
          <li key={r.value} className="obar" data-band={skipBand(r.skip)}>
            <span className="obar-label">{r.label}<span className="muted small"> {r.n} {r.n === 1 ? "reel" : "reels"}</span></span>
            <span className="obar-track" aria-hidden="true">
              {r.skip !== undefined && <span className="obar-fill" style={{ transform: `scaleX(${r.skip / 100})` }} />}
              <span className="skip-target" />
            </span>
            <span className="obar-num">{r.n ? pct(r.skip) : "no data"}</span>
          </li>
        ))}
      </ul>
      {untagged.length > 0 && (
        <p className="muted small">
          {untagged.length} {untagged.length === 1 ? "reel isn't" : "reels aren't"} tagged yet:{" "}
          {untagged.slice(0, 4).map((p, i) => (
            <span key={p.id}>{i ? ", " : ""}<Link href={`/post/${p.id}`}>{p.keyword ?? p.caption.slice(0, 18)}</Link></span>
          ))}
          {untagged.length > 4 ? " and more" : ""}. Open one and pick what frame 0 showed.
        </p>
      )}
    </section>
  );
}
