import { Suspense } from "react";
import Link from "next/link";
import Nav, { NavFallback } from "@/components/nav";
import RefreshButton from "@/components/refresh-button";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="wordmark" aria-label="Insights home">insights</Link>
          <Suspense fallback={<NavFallback />}>
            <Nav />
          </Suspense>
          <RefreshButton />
        </div>
      </header>
      <main className="container page">{children}</main>
    </>
  );
}
