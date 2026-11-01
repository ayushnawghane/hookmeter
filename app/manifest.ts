import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Insights for @ayush.nawghane.dev",
    short_name: "Insights",
    description: "Reach, skip rate and DMs for @ayush.nawghane.dev.",
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
