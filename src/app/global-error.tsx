"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-white">
        <h1 className="text-3xl font-bold text-red-500">Beklenmedik Hata</h1>
        <p className="max-w-md text-zinc-400">
          Uygulamada kritik bir hata oluştu. Sayfa yenilenince sorun çözülebilir.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Tekrar Dene
        </button>
      </body>
    </html>
  );
}
