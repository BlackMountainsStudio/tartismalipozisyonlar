import Link from "next/link";
import { Shield, Scale } from "lucide-react";

const NAV_LINKS = [
  { href: "/pozisyonlar", label: "Tartışmalı Pozisyonlar" },
  { href: "/hakemler", label: "Hakemler" },
  { href: "/yorumcular", label: "Yorumcular" },
  { href: "/rehber", label: "Puanlama Rehberi", icon: Scale },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Shield className="h-5 w-5 text-red-500" aria-hidden="true" />
            <span className="text-sm font-medium">varodasi.com</span>
          </div>
          <nav aria-label="Footer navigasyonu">
            <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-amber-400"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-600">
          Topluluk tartışmalarının AI analizi ile desteklenmektedir. Sonuçlar insan onayına tabidir.
        </p>
      </div>
    </footer>
  );
}
