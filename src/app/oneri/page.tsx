"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Send,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Bug,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import AuthModal from "@/components/AuthModal";

const CATEGORIES = [
  { value: "GENERAL", label: "Genel", icon: <MessageSquare className="h-4 w-4" /> },
  { value: "SUGGESTION", label: "Öneri", icon: <Lightbulb className="h-4 w-4" /> },
  { value: "BUG", label: "Hata Bildirimi", icon: <Bug className="h-4 w-4" /> },
  { value: "MATCH_REQUEST", label: "Maç / Pozisyon Talebi", icon: <AlertTriangle className="h-4 w-4" /> },
  { value: "QUESTION", label: "Soru", icon: <HelpCircle className="h-4 w-4" /> },
];

export default function SuggestionPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setName((prev) => prev || (session.user?.name ?? ""));
      setEmail((prev) => prev || (session.user?.email ?? ""));
    }
  }, [status, session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !message.trim()) {
      setError("Konu ve mesaj alanları zorunludur");
      return;
    }

    if (status !== "authenticated" || !session?.user) {
      setAuthModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setCategory("GENERAL");
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json();
        setError(data.error || "Mesajınız gönderilemedi");
      }
    } catch {
      setError("Mesajınız gönderilemedi, lütfen tekrar deneyin");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-emerald-500/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-white">
          Mesajınız Alındı!
        </h1>
        <p className="mb-8 text-zinc-400">
          Geri bildiriminiz için teşekkür ederiz. En kısa sürede değerlendireceğiz.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
        >
          Yeni Mesaj Gönder
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-red-500/10 p-4">
            <Send className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-white">
          Bize Yazın
        </h1>
        <p className="text-zinc-400">
          Önerilerinizi, hata bildirimlerinizi veya eklemek istediğiniz maç/pozisyon taleplerini bize iletin.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
      >
        {/* Kategori */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  category === cat.value
                    ? "border-transparent bg-red-500/15 text-red-400 ring-2 ring-red-500/50 shadow-lg"
                    : "border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-400">
              İsim {status === "authenticated" && session ? <span className="text-zinc-600">(profil)</span> : <span className="text-red-400">*</span>}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={session ? (session.user?.nickname || session.user?.name) || "Adınız" : "Adınız"}
              maxLength={100}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-400">
              E-posta <span className="text-zinc-600">(opsiyonel)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              maxLength={200}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-zinc-400">
            Konu <span className="text-red-400">*</span>
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Mesajınızın konusu"
            maxLength={200}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-zinc-400">
            Mesajınız <span className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Detaylı olarak yazın..."
            rows={5}
            maxLength={3000}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
          <div className="mt-1 text-right text-xs text-zinc-600">
            {message.length}/3000
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !subject.trim() || !message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Gönderiliyor..." : "Gönder"}
        </button>
      </form>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        callbackUrl={typeof window !== "undefined" ? window.location.href : undefined}
        title="Öneri göndermek için giriş yapın"
        subtitle="Mesajınız kaybolmayacak. Giriş yaptıktan sonra otomatik olarak bu sayfaya döneceksiniz."
      />
    </div>
  );
}
