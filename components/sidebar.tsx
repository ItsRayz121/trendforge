"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Wand2,
  ImageIcon,
  Calendar,
  Bell,
  Settings,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Content Studio",
    href: "/studio",
    icon: Wand2,
  },
  {
    label: "Trending",
    href: "/trends",
    icon: TrendingUp,
  },
  {
    label: "Trend Analysis",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Image Generator",
    href: "/image-generator",
    icon: ImageIcon,
  },
  {
    label: "Scheduler",
    href: "/scheduler",
    icon: Calendar,
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-[260px] bg-surface-900 border-r border-surface-700 z-40 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo - Clickable to home */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-105 group"
            aria-label="Go to Home Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text group-hover:text-violet-400 transition-colors">TrendForge</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-violet-600/15 text-violet-400 border border-violet-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-700"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-colors",
                    isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span>{item.label}</span>
                {item.label === "Trending" && (
                  <span className="ml-auto text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 rounded-full px-1.5 py-0.5 font-medium">
                    Live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom info */}
        <div className="p-4 border-t border-surface-700">
          <div className="bg-surface-700 rounded-lg p-3">
            <p className="text-xs font-medium text-slate-300 mb-1">AI Credits</p>
            <div className="h-1.5 bg-surface-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
                style={{ width: "72%" }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">72 / 100 credits used</p>
          </div>
        </div>
      </aside>
    </>
  );
}
