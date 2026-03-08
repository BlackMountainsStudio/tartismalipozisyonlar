"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function GirisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const errorParam = searchParams.get("error");

  const [providers, setProviders] = useState({ google: false, facebook: false });
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then(setProviders)
      .catch(() => {});
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayError = error || (errorParam === "OAuthAccountNotLinked"
    ? "Bu e-posta adresi başka bir giriş yöntemiyle kayıtlı. Aynı yöntemi kullanın."
    : errorParam === "CredentialsSignin"
      ? "E-posta veya şifre hatalı"
      : "");

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("E-posta ve şifre zorunludur");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            name: name.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Kayıt oluşturulamadı");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("E-posta veya şifre hatalı");
        setLoading(false);
        return;
      }
      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold text-white">Var Odası</span>
          </Link>
        </div>
        <h1 className="mb-2 text-center text-xl font-bold text-white">
          {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-400">
          Yorum yapmak için giriş yapın
        </p>

        {displayError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {displayError}
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="mb-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-400">
                Ad Soyad <span className="text-zinc-600">(opsiyonel)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız"
                maxLength={100}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-400">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-400">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "En az 6 karakter" : "••••••••"}
              required
              minLength={mode === "signup" ? 6 : 1}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              mode === "login" ? "Giriş Yap" : "Kayıt Ol"
            )}
          </button>
        </form>

        {(providers.google || providers.facebook) && (
          <>
            <div className="mb-6 flex items-center gap-2">
              <div className="h-px flex-1 bg-zinc-700" />
              <span className="text-xs text-zinc-500">veya</span>
              <div className="h-px flex-1 bg-zinc-700" />
            </div>

            <div className="space-y-3">
              {providers.google && (
                <button
                  onClick={() => signIn("google", { callbackUrl })}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google ile devam et
                </button>
              )}
              {providers.facebook && (
                <button
                  onClick={() => signIn("facebook", { callbackUrl })}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook ile devam et
                </button>
              )}
            </div>
          </>
        )}

        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            {mode === "login" ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Giriş yaparak{" "}
          <Link href="/oneri" className="text-zinc-400 hover:text-white">
            kullanım koşullarını
          </Link>{" "}
          kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}

export default function GirisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      }
    >
      <GirisContent />
    </Suspense>
  );
}
