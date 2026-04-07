import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Keyword Alerts",
  description: "Monitor keywords in real-time and get notified when they trend.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
