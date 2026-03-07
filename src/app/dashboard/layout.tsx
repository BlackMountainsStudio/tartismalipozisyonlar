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
} from "lucide-react";
import { useState } from "react";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Genel Bakış", exact: true },
  { href: "/dashboard/matches", icon: Trophy, label: "Maçlar" },
  { href: "/dashboard/incidents", icon: Crosshair, label: "Pozisyonlar" },
  { href: "/dashboard/videos", icon: Video, label: "Video Yönetimi" },
  { href: "/dashboard/referee", icon: Gavel, label: "Hakem Yorumları" },
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

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside
        className={`sticky top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-red-500/10 text-red-400"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
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

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center border-t border-zinc-800 py-3 text-zinc-500 transition-colors hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
