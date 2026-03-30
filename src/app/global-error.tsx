'use client'

import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Beklenmedik Bir Hata Oluştu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Üzgünüz, uygulama beklenmedik bir hata ile karşılaştı.
                Lütfen sayfayı yenilemeyi deneyin.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Tekrar Dene
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Hata Detayları (Geliştirici Modu)
                </summary>
                <pre className="mt-2 overflow-auto rounded-md bg-gray-100 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200">
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\nStack Trace:\n'}
                      {error.stack}
                    </>
                  )}
                  {error.digest && (
                    <>
                      {'\n\nError Digest: '}
                      {error.digest}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}