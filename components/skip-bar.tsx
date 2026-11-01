import { pct, skipBand } from "@/lib/format";

const WORD = { good: "good", mid: "okay", bad: "high" } as const;

// The ledger's mark: skip rate 0-100% with the 50% target as a hairline, and a worded status.
export default function SkipBar({ value, pill = true }: { value?: number; pill?: boolean }) {
  const band = skipBand(value);
  if (band === "none") return <span className="muted">n/a</span>;
  return (
    <span className="skip" data-band={band}>
      <span className="skip-num">{pct(value)}</span>
      <span className="skip-track" aria-hidden="true">
        <span className="skip-fill" style={{ transform: `scaleX(${Math.min(100, value!) / 100})` }} />
        <span className="skip-target" />
      </span>
      {pill && <span className="pill" data-band={band}>{WORD[band]}</span>}
    </span>
  );
}
