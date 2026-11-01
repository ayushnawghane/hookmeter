import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "@/components/register-sw";

export const metadata: Metadata = {
  title: "Hookmeter · @ayush.nawghane.dev",
  description: "Is your hook working? Skip rate, reach and DMs for @ayush.nawghane.dev, refreshed every 15 minutes.",
  appleWebApp: { capable: true, title: "Hookmeter", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#eef0ec",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" />
      </head>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
