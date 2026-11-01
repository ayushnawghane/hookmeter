import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hookmeter",
    short_name: "Hookmeter",
    description: "Is your hook working? Skip rate, reach and DMs for @ayush.nawghane.dev.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eef0ec",
    theme_color: "#eef0ec",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
