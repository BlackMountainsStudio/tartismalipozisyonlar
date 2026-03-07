"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Crosshair,
  Plus,
  Loader2,
  Search,
  Filter,
  Pencil,
  Trash2,
  Check,
  X,
  Video,
  ExternalLink,
} from "lucide-react";
import { INCIDENT_TYPE_LABELS } from "@/lib/incidentCategories";

interface Incident {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  status: string;
  videoUrl: string | null;
  match?: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    week: number;
    date: string;
  };
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  week: number;
}

export default function DashboardIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ description: "", type: "", minute: "", videoUrl: "" });
  const [formData, setFormData] = useState({
    matchId: "",
    type: "PENALTY",
    minute: "",
    description: "",
    confidenceScore: "0.8",
    videoUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [incRes, matchRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/matches"),
      ]);
      const incData = await incRes.json();
      const matchData = await matchRes.json();
      setIncidents(Array.isArray(incData) ? incData : []);
      setMatches(Array.isArray(matchData) ? matchData : []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ matchId: "", type: "PENALTY", minute: "", description: "", confidenceScore: "0.8", videoUrl: "" });
        fetchData();
      }
    } catch {
      console.error("Failed to add incident");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      console.error("Status update failed");
    }
  }

  function startEdit(inc: Incident) {
    setEditingId(inc.id);
    setEditData({
      description: inc.description,
      type: inc.type,
      minute: inc.minute?.toString() ?? "",
      videoUrl: inc.videoUrl ?? "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      const body: Record<string, unknown> = { description: editData.description, type: editData.type };
      if (editData.minute) body.minute = editData.minute;
      if (editData.videoUrl) body.videoUrl = editData.videoUrl;
      const res = await fetch(`/api/incidents/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditingId(null);
        fetchData();
      }
    } catch {
      console.error("Edit failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu pozisyonu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/incidents/${id}`, { method: "DELETE" });
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    } catch {
      console.error("Delete failed");
    }
  }

  const filtered = incidents.filter((i) => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.description.toLowerCase().includes(q) ||
        i.match?.homeTeam.toLowerCase().includes(q) ||
        i.match?.awayTeam.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = {
    PENDING: incidents.filter((i) => i.status === "PENDING").length,
    APPROVED: incidents.filter((i) => i.status === "APPROVED").length,
    REJECTED: incidents.filter((i) => i.status === "REJECTED").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Crosshair className="h-6 w-6 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Pozisyon Yönetimi</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Tüm pozisyonları arayın, düzenleyin ve yönetin
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          Pozisyon Ekle
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Yeni Pozisyon Ekle</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Maç</label>
              <select
                value={formData.matchId}
                onChange={(e) => setFormData({ ...formData, matchId: e.target.value })}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
              >
                <option value="">Maç seçin</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam} vs {m.awayTeam} (Hafta {m.week})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tür</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
              >
                {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Dakika</label>
              <input
                type="number"
                value={formData.minute}
                onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                placeholder="ör. 45"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={2}
                placeholder="Pozisyonun detaylı açıklaması..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Güven Skoru</label>
              <input
                type="number"
                value={formData.confidenceScore}
                onChange={(e) => setFormData({ ...formData, confidenceScore: e.target.value })}
                min="0"
                max="1"
                step="0.1"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Video URL (opsiyonel)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ekle
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
            placeholder="Pozisyon veya takım ara..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          {["all", "PENDING", "APPROVED", "REJECTED"].map((s) => {
            const labels: Record<string, string> = { all: "Tümü", PENDING: "Beklemede", APPROVED: "Onaylı", REJECTED: "Reddedildi" };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {labels[s]}
                {s !== "all" && <span className="ml-1 text-zinc-600">({statusCounts[s as keyof typeof statusCounts]})</span>}
              </button>
            );
          })}
          <span className="mx-2 h-4 w-px bg-zinc-800" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-400 outline-none focus:border-red-500"
          >
            <option value="all">Tüm Türler</option>
            {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Crosshair className="mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-lg text-zinc-400">Pozisyon bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inc) => (
            <div
              key={inc.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
            >
              {editingId === inc.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <select
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
                    >
                      {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editData.minute}
                      onChange={(e) => setEditData({ ...editData, minute: e.target.value })}
                      placeholder="Dakika"
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
                    />
                    <input
                      type="url"
                      value={editData.videoUrl}
                      onChange={(e) => setEditData({ ...editData, videoUrl: e.target.value })}
                      placeholder="Video URL"
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500">
                      <Check className="h-3.5 w-3.5" /> Kaydet
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700">
                      <X className="h-3.5 w-3.5" /> İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                        {INCIDENT_TYPE_LABELS[inc.type] ?? inc.type}
                      </span>
                      {inc.minute && (
                        <span className="text-xs text-zinc-500">{inc.minute}&apos;</span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          inc.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : inc.status === "REJECTED"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {inc.status === "APPROVED" ? "Onaylı" : inc.status === "REJECTED" ? "Reddedildi" : "Beklemede"}
                      </span>
                      {inc.videoUrl && (
                        <a href={inc.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          <Video className="h-3 w-3" /> Video
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                    <p className="mb-1 text-sm text-white">{inc.description}</p>
                    {inc.match && (
                      <p className="text-xs text-zinc-500">
                        {inc.match.homeTeam} vs {inc.match.awayTeam} · Hafta {inc.match.week}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {inc.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(inc.id, "APPROVED")}
                          className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                          title="Onayla"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(inc.id, "REJECTED")}
                          className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                          title="Reddet"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => startEdit(inc)}
                      className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                      title="Düzenle"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(inc.id)}
                      className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
