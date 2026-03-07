"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, MessageSquare, Send, Mail, Scale, ListFilter } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-red-500" />
          <span className="text-lg font-bold text-white">
            Tartışmalı<span className="text-red-500">Pozisyonlar</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink href="/" active={pathname === "/"}>
            Maçlar
          </NavLink>
          <NavLink href="/pozisyonlar" active={pathname.startsWith("/pozisyonlar")}>
            <ListFilter className="h-4 w-4" />
            Pozisyonlar
          </NavLink>
          <NavLink href="/commentators" active={pathname.startsWith("/commentators")}>
            <Scale className="h-4 w-4" />
            Yorumcular
          </NavLink>
          <NavLink href="/oneri" active={pathname === "/oneri"}>
            <Send className="h-4 w-4" />
            Bize Yazın
          </NavLink>
          <NavLink href="/dashboard" active={pathname === "/dashboard"}>
            <LayoutDashboard className="h-4 w-4" />
            Yönetim
          </NavLink>
          {isDashboard && (
            <>
              <NavLink
                href="/dashboard/suggestions"
                active={pathname === "/dashboard/suggestions"}
              >
                <Mail className="h-4 w-4" />
                Mesajlar
              </NavLink>
              <NavLink
                href="/dashboard/chat"
                active={pathname === "/dashboard/chat"}
              >
                <MessageSquare className="h-4 w-4" />
                AI Chat
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-red-500/10 text-red-400"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
