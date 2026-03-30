'use client';

import { useEffect } from 'react';
import { Shield, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

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
            Bir Hata Oluştu
          </h2>
          <p className="max-w-md text-zinc-400">
            Beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-400">
                Hata Detayları (Geliştirici)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-900 p-3 text-xs text-zinc-300">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </button>
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <Home className="h-4 w-4" />
            Ana Sayfa
          </a>
        </div>
      </div>
    </div>
  );
}