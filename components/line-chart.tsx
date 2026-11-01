"use client";

import { useId, useState } from "react";

// One series over time: 2px line, 3-4 hairline gridlines, crosshair + tooltip on hover and arrow keys,
// and a table view so no value is hover-only.
export default function LineChart({ title, points, unit = "" }: { title: string; points: { x: string; y: number }[]; unit?: string }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const W = 640, H = 200, L = 44, R = 12, T = 12, B = 28;
  if (points.length < 2) {
    return (
      <figure className="chart card">
        <figcaption className="chart-title">{title}</figcaption>
        <p className="state-inline">
          {points.length === 1
            ? `One day so far: ${points[0].y.toLocaleString("en-US")}${unit}. The line starts after the second daily snapshot.`
            : "No snapshots yet. The first one is saved tonight at 08:30 IST."}
        </p>
      </figure>
    );
  }
  const ys = points.map((p) => p.y);
  const max = Math.max(...ys);
  const top = niceTop(max);
  const x = (i: number) => L + (i * (W - L - R)) / (points.length - 1);
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join("");
  const ticks = [0, top / 3, (2 * top) / 3, top];
  const last = points.length - 1;
  const show = active ?? last;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    setActive(Math.max(0, Math.min(last, Math.round(((px - L) / (W - L - R)) * last))));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setActive(Math.max(0, show - 1));
    if (e.key === "ArrowRight") setActive(Math.min(last, show + 1));
  };

  return (
    <figure className="chart card">
      <figcaption className="chart-title" id={`${id}-t`}>{title}</figcaption>
      <div className="chart-readout" aria-live="polite">
        <span className="num readout-value">{points[show].y.toLocaleString("en-US")}{unit}</span>
        <span className="readout-label">{fmtDay(points[show].x)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-labelledby={`${id}-t`} tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="axis num">{compact(t)}</text>
          </g>
        ))}
        <text x={L} y={H - 6} className="axis">{fmtDay(points[0].x)}</text>
        <text x={W - R} y={H - 6} textAnchor="end" className="axis">{fmtDay(points[last].x)}</text>
        <path d={`${d}L${x(last)},${y(0)}L${x(0)},${y(0)}Z`} className="area" />
        <path d={d} className="line" />
        {active !== null && <line x1={x(active)} x2={x(active)} y1={T} y2={H - B} className="crosshair" />}
        <circle cx={x(show)} cy={y(points[show].y)} r={4.5} className="dot" />
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setActive(null)} />
      </svg>
      <details className="chart-table">
        <summary>Show as table</summary>
        <table>
          <thead><tr><th scope="col">Day</th><th scope="col" className="num-col">{title}</th></tr></thead>
          <tbody>{points.map((p) => <tr key={p.x}><td>{fmtDay(p.x)}</td><td className="num">{p.y.toLocaleString("en-US")}{unit}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

function niceTop(max: number) {
  if (max <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 1.5, 2, 3, 5, 7.5, 10]) if (m * step >= max) return m * step;
  return 10 * step;
}
const compact = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${Math.round(v)}`);
const fmtDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
