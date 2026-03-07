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
} from "lucide-react";

interface Incident {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  status: string;
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
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

  const fetchData = useCallback(async () => {
    try {
      const [matchRes, incidentsRes] = await Promise.all([
        fetch(`/api/matches`),
        fetch(`/api/incidents?matchId=${matchId}`),
      ]);
      const matchData = await matchRes.json();
      const matchList = Array.isArray(matchData) ? matchData : [];
      const matchItem = matchList.find((m: Match) => m.id === matchId);
      setMatch(matchItem ?? null);

      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
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
        `Crawl complete!\n${data.commentsAnalyzed ?? 0} comments analyzed\n${data.incidentsDetected ?? 0} incidents detected`
      );
      fetchData();
    } catch (err) {
      console.error("Crawl failed:", err);
      alert("Crawl failed. Check console for details.");
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
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/incidents/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editDescription }),
      });
      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === editingId
              ? { ...inc, description: editDescription }
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
        <p className="text-lg text-zinc-400">Match not found</p>
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
        Back to Dashboard
      </button>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                Week {match.week}
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
            {crawling ? "Crawling..." : "Run Crawler & AI"}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <span className="text-sm text-zinc-400">Filter:</span>
        {["all", "PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {status === "all" ? "All" : status}
            {status !== "all" && (
              <span className="ml-1 text-zinc-600">
                ({incidents.filter((i) => i.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {editingId && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-zinc-900 p-4">
          <h3 className="mb-2 text-sm font-medium text-white">
            Edit Incident
          </h3>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {filteredIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-zinc-400">No incidents found</p>
          <p className="mt-1 text-sm text-zinc-500">
            Run the crawler to detect controversial decisions
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
