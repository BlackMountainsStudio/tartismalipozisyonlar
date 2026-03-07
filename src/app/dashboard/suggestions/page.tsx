"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Mail,
  Lightbulb,
  Bug,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Eye,
  Archive,
  X,
} from "lucide-react";

interface Suggestion {
  id: string;
  name: string;
  email: string | null;
  category: string;
  subject: string;
  message: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const CATEGORY_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  GENERAL: { label: "Genel", icon: <MessageSquare className="h-4 w-4" />, color: "text-zinc-400" },
  SUGGESTION: { label: "Öneri", icon: <Lightbulb className="h-4 w-4" />, color: "text-amber-400" },
  BUG: { label: "Hata", icon: <Bug className="h-4 w-4" />, color: "text-red-400" },
  MATCH_REQUEST: { label: "Maç/Pozisyon", icon: <AlertTriangle className="h-4 w-4" />, color: "text-blue-400" },
  QUESTION: { label: "Soru", icon: <HelpCircle className="h-4 w-4" />, color: "text-purple-400" },
};

const STATUS_INFO: Record<string, { label: string; style: string }> = {
  NEW: { label: "Yeni", style: "bg-blue-500/10 text-blue-400 ring-blue-500/30" },
  READ: { label: "Okundu", style: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/30" },
  RESOLVED: { label: "Çözüldü", style: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" },
  ARCHIVED: { label: "Arşiv", style: "bg-amber-500/10 text-amber-400 ring-amber-500/30" },
};

export default function DashboardSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    try {
      const res = await fetch("/api/suggestions", { cache: "no-store" });
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch {
      console.error("Status update failed");
    }
  }

  async function deleteSuggestion(id: string) {
    if (!confirm("Bu öneriyi silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      console.error("Delete failed");
    }
  }

  const filtered =
    filter === "ALL"
      ? suggestions
      : suggestions.filter((s) => s.status === filter);

  const newCount = suggestions.filter((s) => s.status === "NEW").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Gelen Mesajlar</h1>
          {newCount > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {newCount} yeni
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Kullanıcılardan gelen öneri, hata bildirimi ve talepleri yönetin
        </p>
      </div>

      {/* Filtreler */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: "ALL", label: `Tümü (${suggestions.length})` },
          { key: "NEW", label: `Yeni (${suggestions.filter((s) => s.status === "NEW").length})` },
          { key: "READ", label: `Okundu (${suggestions.filter((s) => s.status === "READ").length})` },
          { key: "RESOLVED", label: `Çözüldü (${suggestions.filter((s) => s.status === "RESOLVED").length})` },
          { key: "ARCHIVED", label: `Arşiv (${suggestions.filter((s) => s.status === "ARCHIVED").length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <Mail className="mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-zinc-400">Henüz mesaj yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const catInfo = CATEGORY_INFO[s.category] ?? CATEGORY_INFO.GENERAL;
            const statInfo = STATUS_INFO[s.status] ?? STATUS_INFO.NEW;
            const isExpanded = expanded === s.id;

            return (
              <div
                key={s.id}
                className={`rounded-xl border bg-zinc-900/50 transition-all ${
                  s.status === "NEW"
                    ? "border-red-500/30"
                    : "border-zinc-800"
                }`}
              >
                {/* Özet satırı */}
                <button
                  onClick={() => {
                    setExpanded(isExpanded ? null : s.id);
                    if (s.status === "NEW") updateStatus(s.id, "READ");
                  }}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span className={catInfo.color}>{catInfo.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-white">
                        {s.subject}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statInfo.style}`}
                      >
                        {statInfo.label}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                      <span>{s.name}</span>
                      <span>·</span>
                      <span>{catInfo.label}</span>
                      <span>·</span>
                      <span>
                        {new Date(s.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Detay */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-4 pb-4 pt-3">
                    {s.email && (
                      <p className="mb-3 text-xs text-zinc-500">
                        E-posta: <span className="text-zinc-300">{s.email}</span>
                      </p>
                    )}
                    <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                      {s.message}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(s.id, "READ")}
                        className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Okundu
                      </button>
                      <button
                        onClick={() => updateStatus(s.id, "RESOLVED")}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Çözüldü
                      </button>
                      <button
                        onClick={() => updateStatus(s.id, "ARCHIVED")}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Arşivle
                      </button>
                      <button
                        onClick={() => deleteSuggestion(s.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </button>
                      <button
                        onClick={() => setExpanded(null)}
                        className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
