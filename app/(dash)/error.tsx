"use client";

export default function DashError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="state state-error" role="alert">
      <h2>Couldn&apos;t load your numbers</h2>
      <p>{error.message || "Instagram didn't answer."} If the token was revoked, make a new one in Business Settings and update IG_ACCESS_TOKEN.</p>
      <button type="button" className="btn btn-primary" onClick={reset}>Try again</button>
    </section>
  );
}
