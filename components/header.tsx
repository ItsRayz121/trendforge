"use client";
import { Menu, Bell, Search, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onMenuToggle, title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-surface-900/80 backdrop-blur-md border-b border-surface-700 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Clickable TrendForge Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105 group"
            aria-label="Go to Home Dashboard"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-200 group-hover:text-violet-400 transition-colors">TrendForge</span>
          </Link>

          {title && !title.includes("Dashboard") && (
            <div className="border-l border-surface-600 pl-3">
              <h1 className="text-sm font-semibold text-slate-200 leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-2">
          {/* Search (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2 bg-surface-700 border border-surface-500 rounded-lg px-3 py-1.5 w-48 lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search topics..."
              className="bg-transparent text-xs text-slate-300 placeholder-slate-600 w-full focus:outline-none"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-700 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
          </button>

          {/* User avatar */}
          <button className="flex items-center gap-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-700 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="hidden md:block text-xs font-medium text-slate-300">Creator</span>
          </button>
        </div>
      </div>
    </header>
  );
}
