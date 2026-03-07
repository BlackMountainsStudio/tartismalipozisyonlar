"use client";

import { useState, useEffect } from "react";
import MatchCard from "@/components/MatchCard";
import { Plus, Loader2, Search } from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  incidents: { id: string; type: string; status: string; confidenceScore: number }[];
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    week: "",
    date: "",
    league: "Süper Lig",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMatch(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({
          homeTeam: "",
          awayTeam: "",
          week: "",
          date: "",
          league: "Süper Lig",
        });
        fetchMatches();
      }
    } catch (err) {
      console.error("Failed to add match:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredMatches = matches.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.homeTeam.toLowerCase().includes(q) ||
      m.awayTeam.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Maçları yönetin ve AI tarafından tespit edilen olayları inceleyin
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          Maç Ekle
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddMatch}
          className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-white">
            Yeni Maç Ekle
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Ev Sahibi
              </label>
              <input
                type="text"
                value={formData.homeTeam}
                onChange={(e) =>
                  setFormData({ ...formData, homeTeam: e.target.value })
                }
                required
                placeholder="ör. Fenerbahçe"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Deplasman
              </label>
              <input
                type="text"
                value={formData.awayTeam}
                onChange={(e) =>
                  setFormData({ ...formData, awayTeam: e.target.value })
                }
                required
                placeholder="ör. Trabzonspor"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Lig
              </label>
              <input
                type="text"
                value={formData.league}
                onChange={(e) =>
                  setFormData({ ...formData, league: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Hafta
              </label>
              <input
                type="number"
                value={formData.week}
                onChange={(e) =>
                  setFormData({ ...formData, week: e.target.value })
                }
                required
                min="1"
                placeholder="ör. 12"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Tarih
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Oluştur
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Maç ara..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-zinc-400">Maç bulunamadı</p>
          <p className="mt-1 text-sm text-zinc-500">
            Tartışmalı pozisyonları tespit etmek için maç ekleyin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              id={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              week={match.week}
              date={match.date}
              incidentCount={match.incidents.length}
              pendingCount={
                match.incidents.filter((i) => i.status === "PENDING").length
              }
              linkPrefix="/dashboard/matches"
            />
          ))}
        </div>
      )}
    </div>
  );
}
