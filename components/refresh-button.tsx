"use client";

import { useTransition } from "react";
import { refresh } from "@/app/actions";
import { RefreshIcon } from "./icons";

export default function RefreshButton() {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="icon-btn" disabled={pending} aria-busy={pending} aria-label={pending ? "Refreshing" : "Refresh numbers"} onClick={() => start(() => refresh())}>
      <span className={pending ? "spin" : undefined}><RefreshIcon /></span>
    </button>
  );
}
