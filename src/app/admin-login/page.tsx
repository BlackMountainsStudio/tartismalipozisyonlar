"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Geçersiz token");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
      >
        <div className="flex flex-col items-center gap-2">
          <Shield className="h-10 w-10 text-red-500" />
          <h1 className="text-xl font-bold text-white">Yönetici Girişi</h1>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">
            Erişim Anahtarı
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              autoComplete="off"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Kontrol ediliyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
