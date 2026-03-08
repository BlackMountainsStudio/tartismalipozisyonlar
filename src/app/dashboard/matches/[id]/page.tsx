"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import IncidentCard from "@/components/IncidentCard";
import ApprovalButtons from "@/components/ApprovalButtons";
import {
  ArrowLeft,
  Loader2,
  Play,
  Calendar,
  Filter,
  UserRound,
} from "lucide-react";

interface Incident {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  status: string;
  inFavorOf?: string | null;
  against?: string | null;
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  referee?: { id: string; name: string; slug: string } | null;
  varReferee?: { id: string; name: string; slug: string } | null;
}

export default function DashboardMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: matchId } = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editInFavorOf, setEditInFavorOf] = useState("");
  const [editAgainst, setEditAgainst] = useState("");
  const [referees, setReferees] = useState<{ id: string; name: string; slug: string; role: string }[]>([]);
  const [editingMatch, setEditingMatch] = useState(false);
  const [matchRefereeId, setMatchRefereeId] = useState("");
  const [matchVarRefereeId, setMatchVarRefereeId] = useState("");
  const [savingMatch, setSavingMatch] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [matchRes, incidentsRes, refereesRes] = await Promise.all([
        fetch(`/api/matches`, { cache: "no-store" }),
        fetch(`/api/incidents?matchId=${matchId}`, { cache: "no-store" }),
        fetch("/api/referees", { cache: "no-store" }),
      ]);
      const matchData = await matchRes.json();
      const matchList = Array.isArray(matchData) ? matchData : [];
      const matchItem = matchList.find((m: Match) => m.id === matchId);
      setMatch(matchItem ?? null);
      if (matchItem) {
        setMatchRefereeId(matchItem.referee?.id ?? "");
        setMatchVarRefereeId(matchItem.varReferee?.id ?? "");
      }

      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);

      const refereeData = await refereesRes.json();
      setReferees(Array.isArray(refereeData) ? refereeData : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCrawl() {
    setCrawling(true);
    try {
      const res = await fetch("/api/crawler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      const data = await res.json();
      alert(
        `Tarama tamamlandı.\n${data.commentsAnalyzed ?? 0} yorum incelendi, ${data.incidentsDetected ?? 0} tartışmalı pozisyon tespit edildi.`
      );
      fetchData();
    } catch (err) {
      console.error("Crawl failed:", err);
      alert("Tarama başarısız. Konsolu kontrol edin.");
    } finally {
      setCrawling(false);
    }
  }

  function handleStatusChange(id: string, newStatus: string) {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
  }

  function handleEdit(id: string) {
    const incident = incidents.find((i) => i.id === id);
    if (incident) {
      setEditingId(id);
      setEditDescription(incident.description);
      setEditInFavorOf(incident.inFavorOf ?? "");
      setEditAgainst(incident.against ?? "");
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/incidents/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editDescription,
          inFavorOf: editInFavorOf.trim() || null,
          against: editAgainst.trim() || null,
        }),
      });
      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === editingId
              ? {
                  ...inc,
                  description: editDescription,
                  inFavorOf: editInFavorOf.trim() || null,
                  against: editAgainst.trim() || null,
                }
              : inc
          )
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  }

  async function handleMerge(targetId: string) {
    const sourceId = prompt("Enter the incident ID to merge into this one:");
    if (!sourceId) return;

    try {
      const res = await fetch(`/api/incidents/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mergeWithId: sourceId }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Merge failed:", err);
    }
  }

  async function saveMatchReferees() {
    setSavingMatch(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refereeId: matchRefereeId || null,
          varRefereeId: matchVarRefereeId || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMatch((prev) => prev ? { ...prev, referee: updated.referee, varReferee: updated.varReferee } : null);
        setEditingMatch(false);
      }
    } catch (err) {
      console.error("Failed to update match:", err);
    } finally {
      setSavingMatch(false);
    }
  }

  const filteredIncidents =
    statusFilter === "all"
      ? incidents
      : incidents.filter((i) => i.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Maç bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Panele Dön
      </button>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                Hafta {match.week}
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(match.date).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {match.homeTeam} vs {match.awayTeam}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">{match.league}</p>
            {(match.referee || match.varReferee || editingMatch) && (
              <div className="mt-3 space-y-2">
                {!editingMatch ? (
                  <div className="flex flex-wrap gap-3">
                    {match.referee && (
                      <a
                        href={`/hakemler/${match.referee.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400"
                      >
                        <UserRound className="h-3.5 w-3.5" />
                        Hakem: {match.referee.name}
                      </a>
                    )}
                    {match.varReferee && (
                      <a
                        href={`/hakemler/${match.varReferee.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400"
                      >
                        <UserRound className="h-3.5 w-3.5" />
                        VAR: {match.varReferee.name}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingMatch(true)}
                      className="text-xs text-zinc-500 underline hover:text-white"
                    >
                      Düzenle
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Hakem</label>
                      <select
                        value={matchRefereeId}
                        onChange={(e) => setMatchRefereeId(e.target.value)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500"
                      >
                        <option value="">Seçiniz</option>
                        {referees.filter((r) => r.role === "REFEREE").map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                        {referees.filter((r) => r.role !== "REFEREE").map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">VAR Hakemi</label>
                      <select
                        value={matchVarRefereeId}
                        onChange={(e) => setMatchVarRefereeId(e.target.value)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500"
                      >
                        <option value="">Seçiniz</option>
                        {referees.filter((r) => r.role === "VAR").map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                        {referees.filter((r) => r.role !== "VAR").map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={saveMatchReferees}
                      disabled={savingMatch}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {savingMatch ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMatch(false);
                        setMatchRefereeId(match.referee?.id ?? "");
                        setMatchVarRefereeId(match.varReferee?.id ?? "");
                      }}
                      className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                    >
                      İptal
                    </button>
                  </div>
                )}
              </div>
            )}
            {!match.referee && !match.varReferee && !editingMatch && (
              <button
                type="button"
                onClick={() => setEditingMatch(true)}
                className="mt-3 text-xs text-zinc-500 underline hover:text-white"
              >
                Hakem ve VAR ekle
              </button>
            )}
          </div>

          <button
            onClick={handleCrawl}
            disabled={crawling}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {crawling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {crawling ? "Taranıyor..." : "Tartışmalı daha fazla pozisyon ara"}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <span className="text-sm text-zinc-400">Filtre:</span>
        {["all", "PENDING", "APPROVED", "REJECTED"].map((status) => {
          const filterLabels: Record<string, string> = { all: "Tümü", PENDING: "Beklemede", APPROVED: "Onaylı", REJECTED: "Reddedildi" };
          return (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {filterLabels[status] ?? status}
            {status !== "all" && (
              <span className="ml-1 text-zinc-600">
                ({incidents.filter((i) => i.status === status).length})
              </span>
            )}
          </button>
          );
        })}
      </div>

      {editingId && match && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-zinc-900 p-4">
          <h3 className="mb-2 text-sm font-medium text-white">
            Pozisyonu Düzenle
          </h3>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            rows={3}
          />
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Lehine</label>
              <select
                value={editInFavorOf}
                onChange={(e) => setEditInFavorOf(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="">—</option>
                <option value={match.homeTeam}>{match.homeTeam}</option>
                <option value={match.awayTeam}>{match.awayTeam}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Aleyhine</label>
              <select
                value={editAgainst}
                onChange={(e) => setEditAgainst(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="">—</option>
                <option value={match.homeTeam}>{match.homeTeam}</option>
                <option value={match.awayTeam}>{match.awayTeam}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Kaydet
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {filteredIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-zinc-400">Pozisyon bulunamadı</p>
          <p className="mt-1 text-sm text-zinc-500">
            Tartışmalı kararları tespit etmek için yukarıdaki &quot;Tartışmalı daha fazla pozisyon ara&quot; butonunu kullanın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              id={incident.id}
              type={incident.type}
              minute={incident.minute}
              description={incident.description}
              confidenceScore={incident.confidenceScore}
              sources={incident.sources}
              status={incident.status}
              inFavorOf={incident.inFavorOf}
              against={incident.against}
              matchInfo={match ? `${match.homeTeam} vs ${match.awayTeam}` : undefined}
              actions={
                <ApprovalButtons
                  incidentId={incident.id}
                  currentStatus={incident.status}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onMerge={handleMerge}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
