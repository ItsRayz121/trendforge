import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Live Trends",
  description: "Real-time trending topics powered by Perplexity Sonar web search.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
