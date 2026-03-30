"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield, Send, Scale, ListFilter, Menu, X, UserRound, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
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
            Var <span className="text-red-500">Odası</span>
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
          <NavLink href="/hakemler" active={pathname.startsWith("/hakemler")}>
            <UserRound className="h-4 w-4" />
            Hakemler
          </NavLink>
          <NavLink href="/yorumcular" active={pathname.startsWith("/yorumcular")}>
            <Scale className="h-4 w-4" />
            Yorumcular
          </NavLink>
          <NavLink href="/oneri" active={pathname === "/oneri"}>
            <Send className="h-4 w-4" />
            Bize Yazın
          </NavLink>
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profil"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <div className="flex h-7 w-7 overflow-hidden rounded-full bg-zinc-800">
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name || "User"} width={28} height={28} className="h-7 w-7 object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-4 w-4 text-zinc-500" />
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline">{session.user.nickname || session.user.name}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
                title="Çıkış yap"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/giris"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <User className="h-4 w-4" />
              Giriş Yap
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors active:bg-zinc-800 active:text-white md:hidden"
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
              href="/hakemler"
              active={pathname.startsWith("/hakemler")}
              onClick={() => setMobileMenuOpen(false)}
            >
              <UserRound className="h-4 w-4" />
              Hakemler
            </MobileNavLink>
            <MobileNavLink
              href="/yorumcular"
              active={pathname.startsWith("/yorumcular")}
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
            {status === "authenticated" && session?.user ? (
              <>
                <MobileNavLink
                  href="/profil"
                  active={pathname === "/profil"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profil
                </MobileNavLink>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-zinc-400 active:bg-zinc-800 active:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <MobileNavLink
                href="/giris"
                active={pathname === "/giris"}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Giriş Yap
              </MobileNavLink>
            )}
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
