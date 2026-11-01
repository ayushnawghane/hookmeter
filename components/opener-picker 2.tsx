"use client";

import { useState, useTransition } from "react";
import { setOpener } from "@/app/actions";
import { OPENERS, type Opener } from "@/lib/opener-types";

// Tag what a reel opened on. Saves straight away; the home screen's opener chart picks it up.
export default function OpenerPicker({ mediaId, current }: { mediaId: string; current?: Opener }) {
  const [value, setValue] = useState<Opener | undefined>(current);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const pick = (v: Opener) => {
    const prev = value;
    setValue(v);
    setError(undefined);
    start(async () => {
      const res = await setOpener(mediaId, v);
      if (res.error) {
        setValue(prev);
        setError(res.error);
      }
    });
  };
  return (
    <div className="opener-picker">
      <div className="seg seg-wrap" role="radiogroup" aria-label="What frame 0 showed" aria-busy={pending}>
        {OPENERS.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className="seg-opt" onClick={() => pick(o.value)} disabled={pending}>
            {o.label}
          </button>
        ))}
      </div>
      <p className="help" role="status">{error ?? ""}</p>
    </div>
  );
}
