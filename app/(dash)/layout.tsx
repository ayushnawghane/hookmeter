import { Suspense } from "react";
import Link from "next/link";
import Nav, { NavFallback } from "@/components/nav";
import RefreshButton from "@/components/refresh-button";
import { SettingsIcon } from "@/components/icons";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="wordmark" aria-label="Hookmeter home">hookmeter</Link>
          <Suspense fallback={<NavFallback />}>
            <Nav />
          </Suspense>
          <div className="topbar-actions">
            <RefreshButton />
            <Link href="/settings" className="icon-btn" aria-label="Settings"><SettingsIcon /></Link>
          </div>
        </div>
      </header>
      <main className="container page">{children}</main>
    </>
  );
}
