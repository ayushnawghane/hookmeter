"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Post } from "@/lib/ig";
import { num, secs, shortDate } from "@/lib/format";
import SkipBar from "./skip-bar";

type Key = "date" | "skip" | "avgWatch" | "views" | "reach" | "shares" | "saved" | "comments";
const COLS: { key: Key; label: string }[] = [
  { key: "skip", label: "Skip rate" },
  { key: "avgWatch", label: "Avg watch" },
  { key: "views", label: "Views" },
  { key: "reach", label: "Reach" },
  { key: "shares", label: "Shares" },
  { key: "saved", label: "Saves" },
  { key: "comments", label: "Comments" },
];
const FORMATS = [
  { value: "all", label: "All" },
  { value: "reel", label: "Reels" },
  { value: "carousel", label: "Carousels" },
];

export default function PostsTable({ posts }: { posts: Post[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const sort = (params.get("sort") as Key) || "date";
  const dir = params.get("dir") === "asc" ? "asc" : "desc";
  const fmt = params.get("fmt") || "all";

  const set = (next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) p.set(k, v);
    router.replace(`${path}?${p}`, { scroll: false });
  };

  const rows = posts
    .filter((p) => fmt === "all" || p.format === fmt)
    .sort((a, b) => {
      const av = sort === "date" ? a.date : a[sort];
      const bv = sort === "date" ? b.date : b[sort];
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      const c = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? c : -c;
    });

  const head = (key: Key, label: string) => {
    const active = sort === key;
    return (
      <th scope="col" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"} className={key === "date" ? "" : "num-col"}>
        <button type="button" className="sort" onClick={() => set({ sort: key, dir: active && dir === "desc" ? "asc" : "desc" })}>
          {label}
          <span className="sort-mark" aria-hidden="true">{active ? (dir === "asc" ? "↑" : "↓") : ""}</span>
        </button>
      </th>
    );
  };

  return (
    <section aria-labelledby="posts-h" className="card list-card">
      <div className="section-head">
        <h2 id="posts-h">Posts</h2>
        <div className="seg" role="radiogroup" aria-label="Format">
          {FORMATS.map((f) => (
            <button key={f.value} type="button" role="radio" aria-checked={fmt === f.value} className="seg-opt" onClick={() => set({ fmt: f.value })}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="state">
          <p>No {fmt === "all" ? "posts" : `${fmt}s`} yet. Post one and press Refresh.</p>
        </div>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              {head("date", "Post")}
              {COLS.map((c) => head(c.key, c.label))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.id}>
                <th scope="row">
                  <Link href={`/post/${p.id}`} className="post-cell">
                    {p.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumb} alt="" referrerPolicy="no-referrer" width={40} height={50} loading={i < 6 ? "eager" : "lazy"} className="thumb" />
                    ) : (
                      <span className="thumb thumb-empty" aria-hidden="true" />
                    )}
                    <span className="post-text">
                      <span className="post-title">{p.keyword ? `${p.keyword} reel` : p.caption.slice(0, 48) || "Untitled post"}</span>
                      <span className="post-meta">
                        {shortDate(p.date)}, {p.format}
                        {p.aboveMedian && <span className="badge">above median</span>}
                      </span>
                    </span>
                  </Link>
                </th>
                <td data-label="Skip rate"><SkipBar value={p.skip} /></td>
                <td data-label="Avg watch" className="num">{secs(p.avgWatch)}</td>
                <td data-label="Views" className="num">{num(p.views)}</td>
                <td data-label="Reach" className="num">{num(p.reach)}</td>
                <td data-label="Shares" className="num">{num(p.shares)}</td>
                <td data-label="Saves" className="num">{num(p.saved)}</td>
                <td data-label="Comments" className="num">{num(p.comments)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
