import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Image Generator",
  description: "Generate platform-optimized AI images for your social media posts.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
