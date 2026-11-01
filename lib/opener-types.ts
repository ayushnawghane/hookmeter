// What a reel opened on (frame 0). Client-safe: labels, defaults and the lookup, no server code.
import type { Post } from "./ig";

export type Opener = "footage" | "ai" | "text";

export const OPENERS: { value: Opener; label: string; hint: string }[] = [
  { value: "footage", label: "Real footage", hint: "the real thing, already moving" },
  { value: "ai", label: "AI image or mock-up", hint: "Codex image, drawn UI" },
  { value: "text", label: "Text or counter", hint: "title card, still, racing number" },
];

// Known from the build notes (by caption keyword); a tag set in the app wins.
const DEFAULTS: Record<string, Opener> = {
  MARIO: "footage",
  CONTRA: "footage",
  MENUBAR: "footage",
  STUDIO: "ai",
  TAKEOVER: "ai",
  CRYPTO: "text",
};

export const openerFor = (p: Post, tags: Record<string, Opener>): Opener | undefined =>
  tags[p.id] ?? (p.keyword ? DEFAULTS[p.keyword] : undefined);
