import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your API keys, default preferences, and account settings.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
