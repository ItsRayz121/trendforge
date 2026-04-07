import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Content Studio",
  description: "Generate AI-powered social media content for every platform.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
