import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your TrendForge dashboard — stats, recent content, and quick actions.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
