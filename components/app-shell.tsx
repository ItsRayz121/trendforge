"use client";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-950 text-slate-200 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 max-w-screen-2xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
