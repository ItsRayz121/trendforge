import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Analytics",
  description: "AI-powered trend analysis and content performance insights.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
