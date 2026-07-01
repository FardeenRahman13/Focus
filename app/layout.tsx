import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "focus.tools",
  description: "Roll a task. Time your session. Stay on track.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
