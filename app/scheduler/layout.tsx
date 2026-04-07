import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Content Scheduler",
  description: "Plan and schedule your social media content calendar.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
