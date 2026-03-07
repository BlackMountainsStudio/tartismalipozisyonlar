"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Plus,
  Loader2,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  User,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";
import { getOpinionSourceLabel } from "@/lib/linkLabels";

interface ExpertOpinion {
  id: string;
  comment: string;
  stance: string;
  sourceUrl: string | null;
  commentator: { id: string; name: string; slug: string };
  incident: {
    id: string;
    type: string;
    description: string;
    match: { homeTeam: string; awayTeam: string; week: number };
  };
}

interface Commentator {
  id: string;
  name: string;
  slug: string;
}

interface Incident {
  id: string;
  type: string;
  description: string;
  match?: { homeTeam: string; awayTeam: string; week: number };
}

const STANCE_INFO: Record<string, { label: string; color: string; icon: typeof ThumbsUp }> = {
  CORRECT: { label: "Doğru Karar", color: "text-emerald-400 bg-emerald-500/10", icon: ThumbsUp },
  INCORRECT: { label: "Yanlış Karar", color: "text-red-400 bg-red-500/10", icon: ThumbsDown },
  NEUTRAL: { label: "Nötr", color: "text-zinc-400 bg-zinc-500/10", icon: Minus },
};

export default function DashboardOpinionsPage() {
  const [opinions, setOpinions] = useState<ExpertOpinion[]>([]);
  const [commentators, setCommentators] = useState<Commentator[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stanceFilter, setStanceFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    commentatorId: "",
    incidentId: "",
    comment: "",
    stance: "NEUTRAL",
    sourceUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [opRes, comRes, incRes] = await Promise.all([
        fetch("/api/opinions"),
        fetch("/api/commentators"),
        fetch("/api/incidents"),
      ]);
      const opData = await opRes.json();
      const comData = await comRes.json();
      const incData = await incRes.json();
      setOpinions(Array.isArray(opData) ? opData : []);
      setCommentators(Array.isArray(comData) ? comData : []);
      setIncidents(Array.isArray(incData) ? incData : []);
    } catch {
      setOpinions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function resetForm() {
    setFormData({ commentatorId: "", incidentId: "", comment: "", stance: "NEUTRAL", sourceUrl: "" });
    setShowAddForm(false);
    setEditingId(null);
  }

  function startEdit(op: ExpertOpinion) {
    setEditingId(op.id);
    setShowAddForm(true);
    setFormData({
      commentatorId: op.commentator.id,
      incidentId: op.incident.id,
      comment: op.comment,
      stance: op.stance,
      sourceUrl: op.sourceUrl ?? "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/opinions/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: formData.comment,
            stance: formData.stance,
            sourceUrl: formData.sourceUrl,
          }),
        });
        if (res.ok) { resetForm(); fetchData(); }
      } else {
        const res = await fetch("/api/opinions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) { resetForm(); fetchData(); }
      }
    } catch {
      console.error("Failed to save opinion");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu görüşü silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/opinions/${id}`, { method: "DELETE" });
      setOpinions((prev) => prev.filter((o) => o.id !== id));
    } catch {
      console.error("Delete failed");
    }
  }

  const filtered = opinions.filter((op) => {
    if (stanceFilter !== "all" && op.stance !== stanceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        op.comment.toLowerCase().includes(q) ||
        op.commentator.name.toLowerCase().includes(q) ||
        op.incident.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Uzman Görüşleri</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Uzman görüşlerini ekleyin ve yönetin · {opinions.length} görüş
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
        >
          <Plus className="h-4 w-4" />
          Görüş Ekle
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingId ? "Görüş Düzenle" : "Yeni Uzman Görüşü Ekle"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Yorumcu</label>
              <select
                value={formData.commentatorId}
                onChange={(e) => setFormData({ ...formData, commentatorId: e.target.value })}
                required
                disabled={!!editingId}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
              >
                <option value="">Yorumcu seçin</option>
                {commentators.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Pozisyon</label>
              <select
                value={formData.incidentId}
                onChange={(e) => setFormData({ ...formData, incidentId: e.target.value })}
                required
                disabled={!!editingId}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
              >
                <option value="">Pozisyon seçin</option>
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.match?.homeTeam} vs {inc.match?.awayTeam} - {inc.description.slice(0, 50)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Görüş</label>
              <select
                value={formData.stance}
                onChange={(e) => setFormData({ ...formData, stance: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
              >
                <option value="CORRECT">Doğru Karar</option>
                <option value="INCORRECT">Yanlış Karar</option>
                <option value="NEUTRAL">Nötr</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Kaynak URL (opsiyonel)</label>
              <input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Yorum</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                required
                rows={3}
                placeholder="Uzman görüşünü yazın..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editingId ? "Güncelle" : "Ekle"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">
                İptal
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Görüş, yorumcu veya pozisyon ara..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2">
          {["all", "CORRECT", "INCORRECT", "NEUTRAL"].map((s) => {
            const info = STANCE_INFO[s];
            const label = s === "all" ? "Tümü" : info?.label ?? s;
            return (
              <button
                key={s}
                onClick={() => setStanceFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  stanceFilter === s ? "bg-cyan-500/10 text-cyan-400" : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {label}
                {s !== "all" && (
                  <span className="ml-1 text-zinc-600">
                    ({opinions.filter((o) => o.stance === s).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <MessageSquare className="mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-zinc-400">Görüş bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((op) => {
            const stanceInfo = STANCE_INFO[op.stance] ?? STANCE_INFO.NEUTRAL;
            const StanceIcon = stanceInfo.icon;
            return (
              <div key={op.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                    <User className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{op.commentator.name}</span>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${stanceInfo.color}`}>
                        <StanceIcon className="h-3 w-3" />
                        {stanceInfo.label}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-zinc-300">{op.comment}</p>
                    <p className="text-xs text-zinc-500">
                      {op.incident.match.homeTeam} vs {op.incident.match.awayTeam} · {op.incident.description.slice(0, 60)}
                      {op.sourceUrl && (
                        <a href={op.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-cyan-400 hover:text-cyan-300" title={op.sourceUrl}>
                          {getOpinionSourceLabel(op.sourceUrl)} ↗
                        </a>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEdit(op)}
                      className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(op.id)}
                      className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
