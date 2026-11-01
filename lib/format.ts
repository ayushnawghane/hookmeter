export const num = (v?: number) => (typeof v === "number" ? v.toLocaleString("en-US") : "n/a");
export const pct = (v?: number) => (typeof v === "number" ? `${Math.round(v * 10) / 10}%` : "n/a");
export const secs = (v?: number) => (typeof v === "number" ? `${v.toFixed(1)}s` : "n/a");
// "1 Nov", or "15 Nov 2025" when its year differs from `ref` (a YYYY-MM-DD from the same data).
export const shortDate = (d: string, ref?: string) => {
  const date = new Date(`${d}T00:00:00Z`);
  const sameYear = !ref || d.slice(0, 4) === ref.slice(0, 4);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }), timeZone: "UTC" });
};

// Skip-rate bands: under 50% is the target, over 60% needs a new opening.
export const skipBand = (v?: number) => (typeof v !== "number" ? "none" : v < 50 ? "good" : v > 60 ? "bad" : "mid");
