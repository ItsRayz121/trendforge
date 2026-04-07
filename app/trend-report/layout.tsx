import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Trend Report",
  description: "AI-generated weekly trend report for your niche.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
