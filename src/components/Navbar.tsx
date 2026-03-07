"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Send, Scale, ListFilter, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
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

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-500 sm:h-7 sm:w-7" />
          <span className="text-base font-bold text-white sm:text-lg">
            <span className="hidden sm:inline">Tartışmalı</span>
            <span className="text-red-500">Pozisyonlar</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
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
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white md:hidden"
          aria-label="Menü"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 md:hidden">
          <div className="flex flex-col py-2">
            <MobileNavLink
              href="/"
              active={pathname === "/"}
              onClick={() => setMobileMenuOpen(false)}
            >
              Maçlar
            </MobileNavLink>
            <MobileNavLink
              href="/pozisyonlar"
              active={pathname.startsWith("/pozisyonlar")}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ListFilter className="h-4 w-4" />
              Pozisyonlar
            </MobileNavLink>
            <MobileNavLink
              href="/commentators"
              active={pathname.startsWith("/commentators")}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Scale className="h-4 w-4" />
              Yorumcular
            </MobileNavLink>
            <MobileNavLink
              href="/oneri"
              active={pathname === "/oneri"}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Send className="h-4 w-4" />
              Bize Yazın
            </MobileNavLink>
          </div>
        </div>
      )}
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

function MobileNavLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
        active
          ? "bg-red-500/10 text-red-400"
          : "text-zinc-400 active:bg-zinc-800 active:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
