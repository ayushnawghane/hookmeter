"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompetitorsIcon, DmsIcon, GrowthIcon, PostsIcon } from "./icons";

export const TABS = [
  { href: "/", label: "Posts", Icon: PostsIcon },
  { href: "/growth", label: "Growth", Icon: GrowthIcon },
  { href: "/competitors", label: "Competitors", Icon: CompetitorsIcon },
  { href: "/dms", label: "DMs", Icon: DmsIcon },
];

function Tabs({ current }: { current: string | null }) {
  return (
    <nav aria-label="Sections" className="tabbar">
      {TABS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className="tab" aria-current={current === href ? "page" : undefined}>
          <span className="tab-icon"><Icon /></span>
          <span className="tab-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function Nav() {
  const path = usePathname();
  const current = TABS.find((t) => (t.href === "/" ? path === "/" || path.startsWith("/post/") : path.startsWith(t.href)))?.href ?? null;
  return <Tabs current={current} />;
}

// Shown while the current path streams in: same links, no current tab.
export function NavFallback() {
  return <Tabs current={null} />;
}
