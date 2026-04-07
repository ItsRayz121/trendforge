import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Research Tools",
  description: "Competitor spy, best time to post, and content gap analysis.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
