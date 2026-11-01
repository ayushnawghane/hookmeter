import { redisEnabled } from "@/lib/redis";
import { logout } from "@/app/actions";
import ChangePasswordForm from "./form";

export const metadata = { title: "Settings · Hookmeter" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="page-title">Settings</h1>
      <div className="settings">
        <section className="card panel" aria-labelledby="pw-h">
          <h2 id="pw-h">Change password</h2>
          {redisEnabled() ? (
            <>
              <p className="muted">Every other device is signed out when you change it.</p>
              <ChangePasswordForm />
            </>
          ) : (
            <p className="muted">
              Changing the password here needs Upstash Redis (Vercel, then this project, then Storage). Until it&apos;s connected,
              change APP_PASSWORD in Project Settings, then Environment Variables, and redeploy.
            </p>
          )}
        </section>
        <section className="card panel" aria-labelledby="out-h">
          <h2 id="out-h">Sign out</h2>
          <p className="muted">Signs this device out. You&apos;ll need the password to get back in.</p>
          <form action={logout}>
            <button type="submit" className="btn btn-quiet">Sign out</button>
          </form>
        </section>
      </div>
    </>
  );
}
