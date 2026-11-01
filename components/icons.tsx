// Line icons drawn for this app (24px grid, 1.75 stroke). Decorative: labels sit beside or in aria-label.
type P = { size?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const PostsIcon = ({ size = 22 }: P) => (
  <svg {...base(size)} aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="9" rx="2" /><rect x="13.5" y="3.5" width="7" height="5" rx="2" /><rect x="3.5" y="15.5" width="7" height="5" rx="2" /><rect x="13.5" y="11.5" width="7" height="9" rx="2" /></svg>
);
export const GrowthIcon = ({ size = 22 }: P) => (
  <svg {...base(size)} aria-hidden="true"><path d="M4 19h16" /><path d="M5 15l4.5-4.5 3.5 3L19 7" /><path d="M15 7h4v4" /></svg>
);
export const CompetitorsIcon = ({ size = 22 }: P) => (
  <svg {...base(size)} aria-hidden="true"><circle cx="9" cy="8.5" r="3.5" /><path d="M3 19.5c.8-3.2 3.3-5 6-5s5.2 1.8 6 5" /><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" /><path d="M18 14.8c1.6.7 2.6 2.4 3 4.7" /></svg>
);
export const DmsIcon = ({ size = 22 }: P) => (
  <svg {...base(size)} aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z" /><path d="M8.5 9h7M8.5 12.5h4.5" /></svg>
);
export const RefreshIcon = ({ size = 20 }: P) => (
  <svg {...base(size)} aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></svg>
);
export const ArrowIcon = ({ size = 16 }: P) => (
  <svg {...base(size)} aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
