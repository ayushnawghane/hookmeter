"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { id: string };

// A password field with a show/hide toggle. The toggle never submits the form.
export default function PasswordInput(props: Props) {
  const [shown, setShown] = useState(false);
  return (
    <span className="pw-field">
      <input {...props} type={shown ? "text" : "password"} spellCheck={false} autoCapitalize="off" autoCorrect="off" />
      <button
        type="button"
        className="pw-toggle"
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        aria-controls={props.id}
        onClick={() => setShown((s) => !s)}
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
}
