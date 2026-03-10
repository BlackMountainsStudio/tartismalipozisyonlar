import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Sayfa Bulunamadı - Var Odası",
  description: "Aradığınız sayfa bulunamadı.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem-6rem)] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <Shield className="h-16 w-16 text-red-500 sm:h-20 sm:w-20" />
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Var <span className="text-red-500">Odası</span>
          </h1>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            404 - Sayfa Bulunamadı
          </h2>
          <p className="max-w-md text-zinc-400">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
