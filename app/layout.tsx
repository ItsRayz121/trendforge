import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendForge — AI Content Creation Platform",
  description:
    "AI-powered content generation for Telegram, Instagram, Facebook & Twitter. Real-time trends, platform-specific outputs, and smart scheduling.",
  keywords: "AI content, social media, trend analysis, content generator, marketing",
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
