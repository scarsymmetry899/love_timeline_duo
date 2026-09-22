import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Path",
  description: "A private path of memories for the two of you. Each side stays sealed until you both choose to open it.",
};

export const viewport: Viewport = {
  themeColor: "#fcefb8",
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
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..800&family=Instrument+Sans:wght@400..700&family=Caveat:wght@600&family=Dancing+Script:wght@600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
