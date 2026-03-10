import Link from "next/link";
import { Shield, Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-zinc-400">
            <Shield className="h-5 w-5 text-red-500" />
            <span className="text-sm">varodasi.com</span>
          </div>
          <Link
            href="/rehber"
            className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-amber-400"
          >
            <Scale className="h-3.5 w-3.5" />
            Puanlama Rehberi
          </Link>
        </div>
        <p className="text-center text-xs text-zinc-500 sm:text-left">
          Topluluk tartışmalarının AI analizi ile desteklenmektedir. Sonuçlar insan onayına tabidir.
        </p>
      </div>
    </footer>
  );
}
