import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Saved Content",
  description: "Your saved content library — browse, copy, and manage all saved posts.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
