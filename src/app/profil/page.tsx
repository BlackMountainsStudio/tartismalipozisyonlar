"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader2, User, Camera, Save, MessageSquare, Send } from "lucide-react";
import Link from "next/link";

type Tab = "ayarlar" | "yorumlar" | "oneriler";

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("ayarlar");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    email: "",
  });
  const [comments, setComments] = useState<
    Array<{
      id: string;
      content: string;
      verdict: string;
      createdAt: string;
      matchTitle: string | null;
      incidentDesc: string | null;
      url: string | null;
      replyCount: number;
      replies: Array<{ id: string; author: string; content: string; createdAt: string }>;
    }>
  >([]);
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string;
      category: string;
      categoryLabel: string;
      subject: string;
      message: string;
      status: string;
      statusLabel: string;
      createdAt: string;
    }>
  >([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/giris?callbackUrl=/profil");
      return;
    }
    if (status === "authenticated" && session?.user) {
      setForm({
        name: session.user.name ?? "",
        nickname: session.user.nickname ?? session.user.name ?? "",
        email: session.user.email ?? "",
      });
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.name !== undefined) setForm((f) => ({ ...f, name: data.name ?? "" }));
          if (data.nickname !== undefined) setForm((f) => ({ ...f, nickname: data.nickname ?? "" }));
          if (data.email !== undefined) setForm((f) => ({ ...f, email: data.email ?? "" }));
        })
        .catch(() => {});
    }
  }, [status, session, router]);

  useEffect(() => {
    if (tab === "yorumlar" && status === "authenticated") {
      setLoadingComments(true);
      fetch("/api/user/comments", { credentials: "same-origin" })
        .then((r) => r.json())
        .then(setComments)
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    }
  }, [tab, status]);

  useEffect(() => {
    if (tab === "oneriler" && status === "authenticated") {
      setLoadingSuggestions(true);
      fetch("/api/user/suggestions", { credentials: "same-origin" })
        .then((r) => r.json())
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }
  }, [tab, status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profil güncellendi");
      } else {
        setMessage(data.error ?? "Güncelleme başarısız");
      }
    } catch {
      setMessage("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profil resmi güncellendi");
        window.location.reload();
      } else {
        setMessage(data.error ?? "Yükleme başarısız");
      }
    } catch {
      setMessage("Yükleme başarısız");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} gün önce`;
    return new Date(dateStr).toLocaleDateString("tr-TR");
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "ayarlar", label: "Ayarlar", icon: <User className="h-4 w-4" /> },
    { id: "yorumlar", label: "Yorumlarım", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "oneriler", label: "Önerilerim", icon: <Send className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">Profil</h1>

      <div className="mb-8 flex gap-2 border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-red-500 text-red-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ayarlar" && (
        <>
          <div className="mb-8 flex items-center gap-6">
            <div className="relative">
              <div className="flex h-24 w-24 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="Profil"
                    width={96}
                    height={96}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-10 w-10 text-zinc-500" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{session?.user?.nickname || session?.user?.name}</p>
              <p className="text-xs text-zinc-500">Profil resmi (max 2MB)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">Ad Soyad</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Adınız Soyadınız"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">Görünen ad (Nickname)</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                placeholder="Yorumlarda görünecek isim"
                maxLength={50}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-400">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="ornek@email.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes("başarı") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Kaydet
            </button>
          </form>
        </>
      )}

      {tab === "yorumlar" && (
        <div className="space-y-4">
          {loadingComments ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-zinc-400">Henüz yorumunuz yok</p>
              <Link href="/" className="mt-2 inline-block text-sm text-red-400 hover:text-red-300">
                Maçlara göz atın →
              </Link>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    {c.url ? (
                      <Link href={c.url} className="text-sm font-medium text-red-400 hover:text-red-300">
                        {c.matchTitle ?? "Maç"}
                        {c.incidentDesc && ` — ${c.incidentDesc.slice(0, 40)}...`}
                      </Link>
                    ) : (
                      <span className="text-sm text-zinc-400">{c.matchTitle ?? "Maç"}</span>
                    )}
                    <span className="ml-2 text-xs text-zinc-600">{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
                <p className="mb-3 text-sm text-zinc-300">{c.content}</p>
                {c.replies.length > 0 && (
                  <div className="ml-4 border-l-2 border-zinc-700 pl-4">
                    <p className="mb-2 text-xs font-medium text-zinc-500">
                      {c.replyCount} yanıt
                    </p>
                    {c.replies.map((r) => (
                      <div key={r.id} className="mb-2">
                        <span className="text-xs font-medium text-zinc-400">{r.author}</span>
                        <span className="mx-1 text-zinc-600">·</span>
                        <span className="text-xs text-zinc-600">{timeAgo(r.createdAt)}</span>
                        <p className="mt-0.5 text-sm text-zinc-400">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "oneriler" && (
        <div className="space-y-4">
          {loadingSuggestions ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 py-12 text-center">
              <Send className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
              <p className="text-zinc-400">Henüz öneriniz yok</p>
              <Link href="/oneri" className="mt-2 inline-block text-sm text-red-400 hover:text-red-300">
                Bize yazın →
              </Link>
            </div>
          ) : (
            suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                    {s.categoryLabel}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      s.status === "NEW"
                        ? "bg-blue-500/20 text-blue-400"
                        : s.status === "RESOLVED"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-zinc-600/50 text-zinc-400"
                    }`}
                  >
                    {s.statusLabel}
                  </span>
                </div>
                <h3 className="font-medium text-white">{s.subject}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{s.message}</p>
                <p className="mt-2 text-xs text-zinc-600">{timeAgo(s.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-zinc-500">
        <Link href="/" className="text-zinc-400 hover:text-white">
          ← Ana sayfaya dön
        </Link>
      </p>
    </div>
  );
}
