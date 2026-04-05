import Link from "next/link";
import {
  Zap,
  TrendingUp,
  Wand2,
  ImageIcon,
  Calendar,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Live Trend Intelligence",
    description:
      "Fetch real-time trends from global news sources. Filter by country, niche, and platform to find what's actually going viral.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: Wand2,
    title: "AI Content Studio",
    description:
      "Generate platform-specific content for Telegram, Instagram, Facebook, and Twitter/X with a single click. Never write from scratch again.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: ImageIcon,
    title: "Image Prompt Generator",
    description:
      "Get professional AI image prompts optimized for each platform's exact dimensions. Real reference links included.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    icon: BarChart3,
    title: "Trend Analysis Engine",
    description:
      "Understand why trends go viral. Get content angles, virality scores, audience relevance, and optimal posting windows.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    icon: Calendar,
    title: "Content Scheduler",
    description:
      "Plan your content calendar with AI-suggested posting times per platform. Build your pipeline and stay consistent.",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: Globe,
    title: "Multi-Country & Language",
    description:
      "Create content for 30+ countries in 10 languages. Country-specific tone, references, and audience targeting built in.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
];

const platforms = [
  { name: "Telegram", icon: "✈️", color: "text-sky-400" },
  { name: "Instagram", icon: "📸", color: "text-pink-400" },
  { name: "Facebook", icon: "👥", color: "text-blue-400" },
  { name: "Twitter / X", icon: "🐦", color: "text-cyan-400" },
];

const stats = [
  { value: "4", label: "Platforms Supported" },
  { value: "30+", label: "Countries" },
  { value: "10x", label: "Faster Content Creation" },
  { value: "100%", label: "Customizable" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-surface-700 bg-surface-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">TrendForge</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28 bg-hero-glow">
        {/* Background glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            AI-Powered Content Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight mb-6">
            Create Viral Content
            <br />
            <span className="gradient-text">10x Faster</span> with AI
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate platform-specific content for Telegram, Instagram, Facebook & Twitter.
            Powered by real-time trend intelligence and AI content generation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-xl shadow-violet-500/25 hover:shadow-violet-500/35 w-full sm:w-auto justify-center"
            >
              <Wand2 className="w-4 h-4" />
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/trends"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-700 hover:bg-surface-600 border border-surface-500 text-slate-200 font-medium transition-all w-full sm:w-auto justify-center"
            >
              <TrendingUp className="w-4 h-4" />
              View Live Trends
            </Link>
          </div>

          {/* Platform badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs text-slate-600">Works with:</span>
            {platforms.map((p) => (
              <span
                key={p.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-700 border border-surface-500 text-xs font-medium text-slate-300"
              >
                <span>{p.icon}</span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-surface-700 bg-surface-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-100 mb-3">
            Everything you need to dominate social media
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            One platform. Every tool a content creator, marketer, or trend analyst needs.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-surface-500 bg-surface-800 p-6 hover:border-surface-400 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${feature.bg}`}
                >
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/10 rounded-2xl border border-violet-500/20 p-10">
            <h2 className="text-2xl font-bold text-slate-100 mb-3">
              Ready to forge your first trend?
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
              Join thousands of creators using AI to stay ahead of the curve.
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-xl shadow-violet-500/25"
            >
              <Wand2 className="w-4 h-4" />
              Start Creating Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">TrendForge</span>
          </div>
          <p className="text-xs text-slate-600">
            AI-Powered Content Creation Platform — Ready for Real API Integration
          </p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-400 transition-colors">Dashboard</Link>
            <Link href="/settings" className="hover:text-slate-400 transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
