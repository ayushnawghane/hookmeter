import { Suspense } from "react";
import LoginForm from "./form";

export const metadata = { title: "Sign in · Hookmeter" };

export default function LoginPage() {
  return (
    <main className="login">
      <div className="login-card">
        <p className="wordmark">hookmeter</p>
        <h1>Your Instagram numbers</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
