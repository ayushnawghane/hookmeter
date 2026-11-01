"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type ChangeState } from "@/app/actions";
import PasswordInput from "@/components/password-input";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangeState, FormData>(changePassword, {});
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) form.current?.reset();
    if (state.field) form.current?.querySelector<HTMLInputElement>(`[name="${state.field}"]`)?.focus();
  }, [state]);

  const invalid = (f: ChangeState["field"]) => (state.field === f ? true : undefined);
  return (
    <form ref={form} action={action} className="form">
      <label htmlFor="current">Current password</label>
      <PasswordInput id="current" name="current" autoComplete="current-password" required aria-invalid={invalid("current")} aria-describedby="pw-msg" />
      <label htmlFor="next">New password</label>
      <PasswordInput id="next" name="next" autoComplete="new-password" required minLength={12} aria-invalid={invalid("next")} aria-describedby="pw-hint pw-msg" />
      <p id="pw-hint" className="hint">At least 12 characters.</p>
      <label htmlFor="confirm">New password, again</label>
      <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required aria-invalid={invalid("confirm")} aria-describedby="pw-msg" />
      <p id="pw-msg" className={state.ok ? "help help-ok" : "help"} role="status">
        {state.ok ? "Password changed. Other devices are signed out." : state.error ?? ""}
      </p>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
