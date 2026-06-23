import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lürú | lifestyle tracker",
  description: "Daily nutrition & lifestyle logging",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
