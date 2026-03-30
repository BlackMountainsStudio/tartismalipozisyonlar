"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-bold text-red-500">Bir hata oluştu</h2>
      <p className="max-w-md text-zinc-400">
        Sayfa yüklenirken beklenmedik bir hata meydana geldi. Lütfen tekrar deneyin.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
