"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, checkPassword, sessionValue, setPassword } from "@/lib/auth";
import { redisEnabled } from "@/lib/redis";

export async function refresh() {
  updateTag("ig");
  updateTag("competitors");
  updateTag("snapshots");
}

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const given = String(form.get("password") ?? "");
  if (!(await checkPassword(given))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "That password doesn't match. Try again." };
  }
  await setSession();
  const next = String(form.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}

async function setSession() {
  (await cookies()).set(COOKIE, await sessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
}

export type ChangeState = { ok?: boolean; error?: string; field?: "current" | "next" | "confirm" };

export async function changePassword(_: ChangeState, form: FormData): Promise<ChangeState> {
  if (!redisEnabled()) return { error: "Connect Upstash Redis first. Until then, change APP_PASSWORD in Vercel." };
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (!(await checkPassword(current))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Your current password doesn't match.", field: "current" };
  }
  if (next.length < 12) return { error: "Use at least 12 characters.", field: "next" };
  if (next === current) return { error: "Pick a password you haven't used here.", field: "next" };
  if (next !== confirm) return { error: "The two new passwords don't match.", field: "confirm" };
  await setPassword(next);
  await setSession(); // this device stays signed in; every other session's cookie no longer matches
  return { ok: true };
}
