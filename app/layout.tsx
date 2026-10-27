import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lürúee tools | Lifestyle Tracker",
  description: "Daily nutrition & lifestyle logging",
  icons: {
    icon: "https://tool.luruee.com/logo-20260824-v2.png",
    apple: "https://tool.luruee.com/logo-20260824-v2.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
