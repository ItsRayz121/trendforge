import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "TrendForge — AI Content Creation Platform",
  description:
    "AI-powered content generation for Telegram, Instagram, Facebook & Twitter. Real-time trends, platform-specific outputs, and smart scheduling.",
  keywords: "AI content, social media, trend analysis, content generator, marketing",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TrendForge",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TrendForge" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body>
        {children}
        <PwaRegister />
        <SpeedInsights />
      </body>
    </html>
  );
}
