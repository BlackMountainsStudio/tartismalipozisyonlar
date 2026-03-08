"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
  Video,
  Gavel,
  Users,
  MessageSquare,
  Mail,
  Tags,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { useState, useEffect } from "react";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Genel Bakış", exact: true },
  { href: "/dashboard/matches", icon: Trophy, label: "Maçlar" },
  { href: "/dashboard/incidents", icon: Crosshair, label: "Pozisyonlar" },
  { href: "/dashboard/videos", icon: Video, label: "Video Yönetimi" },
  { href: "/dashboard/referee", icon: Gavel, label: "Hakem Yorumları" },
  { href: "/dashboard/referees", icon: UserRound, label: "Hakemler" },
  { href: "/dashboard/commentators", icon: Users, label: "Yorumcular" },
  { href: "/dashboard/opinions", icon: MessageSquare, label: "Uzman Görüşleri" },
  { href: "/dashboard/categories", icon: Tags, label: "Kategoriler" },
  { href: "/dashboard/suggestions", icon: Mail, label: "Mesajlar" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Chat" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile menü açıkken body scroll'unu engelle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition-colors active:bg-zinc-800 active:text-white md:hidden"
        aria-label="Menü"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-200 md:sticky md:translate-x-0 ${
          collapsed ? "w-16" : "w-60"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {SIDEBAR_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors touch-manipulation ${
                    active
                      ? "bg-red-500/10 text-red-400"
                      : "text-zinc-400 active:bg-zinc-800/50 active:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collapse Button - Desktop Only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden items-center justify-center border-t border-zinc-800 py-3 text-zinc-500 transition-colors active:bg-zinc-800 active:text-white md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
