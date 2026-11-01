"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "../actions";
import PasswordInput from "@/components/password-input";

export default function LoginForm() {
  const next = useSearchParams().get("next") ?? "/";
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="form">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password">Password</label>
      <PasswordInput
        id="password"
        name="password"
        autoComplete="current-password"
        required
        autoFocus
        aria-invalid={state.error ? true : undefined}
        aria-describedby="password-help"
      />
      <p id="password-help" className="help" role="alert">{state.error ?? ""}</p>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Checking…" : "Open dashboard"}
      </button>
    </form>
  );
}
