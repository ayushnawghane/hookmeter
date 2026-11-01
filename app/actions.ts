"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, safeEqual, sessionValue } from "@/lib/auth";

export async function refresh() {
  updateTag("ig");
  updateTag("competitors");
  updateTag("snapshots");
}

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const given = String(form.get("password") ?? "");
  const expected = process.env.APP_PASSWORD ?? "";
  if (!expected || !safeEqual(given, expected)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "That password doesn't match. Try again." };
  }
  (await cookies()).set(COOKIE, await sessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  const next = String(form.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}
