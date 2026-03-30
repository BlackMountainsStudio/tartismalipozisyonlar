"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { X, Shield } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  callbackUrl,
            title = "Giriş yapın veya kayıt olun",
  subtitle = "Yorumunuz kaybolmayacak. Giriş/kayıt sonrası otomatik olarak bu sayfaya döneceksiniz.",
}: AuthModalProps) {
  const [providers, setProviders] = useState({ google: false });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("");
      fetch("/api/auth/providers")
        .then((r) => r.json())
        .then(setProviders)
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = (provider: string) => {
    if (provider === "google" && !providers.google) {
      setError("Google OAuth yapılandırılmamış. .env dosyasına AUTH_GOOGLE_ID ve AUTH_GOOGLE_SECRET ekleyin.");
      return;
    }
    setError("");
    signIn(provider, {
      callbackUrl: callbackUrl ?? (typeof window !== "undefined" ? window.location.href : "/"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-500" />
          <Link href="/" className="text-lg font-bold text-white">
            Var Odası
          </Link>
        </div>

        <h2 id="auth-modal-title" className="mb-2 text-xl font-bold text-white">
          {title}
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          {subtitle}
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6 space-y-3">
          <button
            type="button"
            onClick={() => handleSignIn("google")}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google ile giriş yap veya kayıt ol
          </button>
          {!providers.google && (
            <p className="text-center text-xs text-zinc-500">
              Google için .env dosyasına AUTH_GOOGLE_ID ve AUTH_GOOGLE_SECRET ekleyin
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-zinc-500">
          <Link
            href={callbackUrl ? `/giris?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/giris"}
            className="text-zinc-400 hover:text-white"
          >
            E-posta ve şifre ile giriş yap veya kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
