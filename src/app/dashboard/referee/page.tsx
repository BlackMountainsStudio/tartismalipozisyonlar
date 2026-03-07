"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gavel,
  Search,
  Loader2,
  ExternalLink,
  Plus,
  Check,
  Globe,
  Trash2,
  X,
} from "lucide-react";
import { getOpinionSourceLabel } from "@/lib/linkLabels";

interface Incident {
  id: string;
  type: string;
  description: string;
  refereeComments: { author: string; comment: string; source?: string }[];
  match?: { homeTeam: string; awayTeam: string; week: number };
}

interface SearchResult {
  source: string;
  author: string;
  comment: string;
  url: string;
}

export default function DashboardRefereePage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ author: "", comment: "", source: "" });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch("/api/incidents", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setIncidents(
        list.map((i: Incident & { refereeComments?: string | { author: string; comment: string; source?: string }[] }) => ({
          ...i,
          refereeComments: Array.isArray(i.refereeComments)
            ? i.refereeComments
            : typeof i.refereeComments === "string"
              ? (() => { try { return JSON.parse(i.refereeComments); } catch { return []; } })()
              : [],
        }))
      );
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search/referee?q=${encodeURIComponent(searchQuery)}`, { cache: "no-store" });
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function addRefereeComment(incidentId: string, comment: { author: string; comment: string; source?: string }) {
    setSaving(true);
    try {
      const incident = incidents.find((i) => i.id === incidentId);
      const existing = incident?.refereeComments ?? [];
      const updated = [...existing, comment];

      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refereeComments: JSON.stringify(updated) }),
      });

      if (res.ok) {
        setSuccessMessage("Hakem yorumu eklendi!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchIncidents();
      }
    } catch {
      console.error("Failed to add referee comment");
    } finally {
      setSaving(false);
    }
  }

  async function removeRefereeComment(incidentId: string, index: number) {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) return;
    const updated = incident.refereeComments.filter((_, idx) => idx !== index);
    try {
      await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refereeComments: JSON.stringify(updated) }),
      });
      fetchIncidents();
    } catch {
      console.error("Failed to remove comment");
    }
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedIncident || !formData.comment.trim()) return;
    await addRefereeComment(selectedIncident, {
      author: formData.author || "Bilinmeyen",
      comment: formData.comment,
      source: formData.source || undefined,
    });
    setFormData({ author: "", comment: "", source: "" });
    setShowAddForm(false);
  }

  const withComments = incidents.filter((i) => i.refereeComments.length > 0);
  const totalComments = incidents.reduce((acc, i) => acc + i.refereeComments.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Gavel className="h-6 w-6 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Hakem Yorumları</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Web&apos;den hakem yorumlarını arayın ve pozisyonlara ekleyin · {totalComments} yorum, {withComments.length} pozisyon
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
        >
          <Plus className="h-4 w-4" />
          Yorum Ekle
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Web Search */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Globe className="h-5 w-5 text-blue-400" />
          Web&apos;den Hakem Yorumu Ara
        </h2>
        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ör. Fenerbahçe Galatasaray penaltı hakem yorumu..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Ara
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{searchResults.length} kaynak bulundu</p>
            {searchResults.map((result, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                <Gavel className="h-5 w-5 shrink-0 text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{result.comment}</p>
                  <p className="text-xs text-zinc-500">{result.source}</p>
                </div>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Add */}
      {showAddForm && (
        <form onSubmit={handleManualAdd} className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Manuel Hakem Yorumu Ekle</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Pozisyon</label>
              <select
                value={selectedIncident}
                onChange={(e) => setSelectedIncident(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
              >
                <option value="">Pozisyon seçin</option>
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.match?.homeTeam} vs {inc.match?.awayTeam} - {inc.description.slice(0, 60)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Yazar / Hakem</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="ör. Cüneyt Çakır"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Kaynak URL (opsiyonel)</label>
              <input
                type="url"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Yorum</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                required
                rows={3}
                placeholder="Hakem yorumunu yazın..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={saving || !selectedIncident}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
              >
                İptal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Existing Comments */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Mevcut Hakem Yorumları</h2>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : withComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
            <Gavel className="mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-zinc-400">Henüz hakem yorumu eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withComments.map((inc) => (
              <div key={inc.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                    {inc.type}
                  </span>
                  <span className="text-sm text-white">{inc.description.slice(0, 80)}</span>
                </div>
                <p className="mb-3 text-xs text-zinc-500">
                  {inc.match?.homeTeam} vs {inc.match?.awayTeam}
                </p>
                <div className="space-y-2">
                  {inc.refereeComments.map((rc, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
                      <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">{rc.comment}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {rc.author}
                          {rc.source && (
                            <a href={rc.source} target="_blank" rel="noopener noreferrer" className="ml-2 text-amber-400 hover:text-amber-300" title={rc.source}>
                              {getOpinionSourceLabel(rc.source)} ↗
                            </a>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => removeRefereeComment(inc.id, idx)}
                        className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
