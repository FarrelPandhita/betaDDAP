"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, LayoutDashboard, Settings, BookOpen, TrendingUp } from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import paths from "@/data/paths.json";

const navItems = [
  { href: "/paths", label: "Paths", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function TopNav() {
  const pathname = usePathname();
  const { progress } = useProgressStore();

  // Compute overall progress
  const totalNodes = paths.reduce((acc, p) => acc + p.nodes.length, 0);
  const doneNodes = paths.reduce((acc, p) => {
    const pathProgress = progress[p.path_id] || {};
    return acc + Object.values(pathProgress).filter((s) => s === "done").length;
  }, 0);
  const overallPercent = totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all duration-200">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-text-primary">
              Dev<span className="text-primary">Path</span>
            </span>
            <span className="text-xs font-medium text-text-muted bg-surface-tertiary px-2 py-0.5 rounded-full border border-border">
              FILKOM UB
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-50 text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-surface-tertiary px-3 py-1.5 rounded-xl border border-border">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-text-secondary">{overallPercent}% overall</span>
              <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
