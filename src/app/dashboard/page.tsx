"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  Trophy,
  Crosshair,
  Users,
  Mail,
  Video,
  Gavel,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Stats {
  totalMatches: number;
  totalIncidents: number;
  pendingIncidents: number;
  approvedIncidents: number;
  totalCommentators: number;
  totalOpinions: number;
  totalSuggestions: number;
  newSuggestions: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentIncidents, setRecentIncidents] = useState<
    { id: string; type: string; description: string; status: string; match?: { homeTeam: string; awayTeam: string } }[]
  >([]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [matchesRes, incidentsRes, commentatorsRes, suggestionsRes] =
        await Promise.all([
          fetch("/api/matches"),
          fetch("/api/incidents"),
          fetch("/api/commentators"),
          fetch("/api/suggestions"),
        ]);

      const matches = await matchesRes.json();
      const incidents = await incidentsRes.json();
      const commentators = await commentatorsRes.json();
      const suggestions = await suggestionsRes.json();

      const matchList = Array.isArray(matches) ? matches : [];
      const incidentList = Array.isArray(incidents) ? incidents : [];
      const commentatorList = Array.isArray(commentators) ? commentators : [];
      const suggestionList = Array.isArray(suggestions) ? suggestions : [];

      setStats({
        totalMatches: matchList.length,
        totalIncidents: incidentList.length,
        pendingIncidents: incidentList.filter((i: { status: string }) => i.status === "PENDING").length,
        approvedIncidents: incidentList.filter((i: { status: string }) => i.status === "APPROVED").length,
        totalCommentators: commentatorList.length,
        totalOpinions: commentatorList.reduce(
          (acc: number, c: { opinions?: unknown[] }) => acc + (c.opinions?.length ?? 0),
          0
        ),
        totalSuggestions: suggestionList.length,
        newSuggestions: suggestionList.filter((s: { status: string }) => s.status === "NEW").length,
      });

      setRecentIncidents(
        incidentList
          .filter(
            (i: unknown): i is { id: string; type: string; description: string; status: string; match?: { homeTeam: string; awayTeam: string } } =>
              i != null &&
              typeof i === "object" &&
              "id" in i &&
              "type" in i &&
              "description" in i &&
              "status" in i
          )
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  const statCards = [
    { label: "Toplam Maç", value: stats?.totalMatches ?? 0, icon: Trophy, color: "text-blue-400", bg: "bg-blue-500/10", href: "/dashboard/matches" },
    { label: "Toplam Pozisyon", value: stats?.totalIncidents ?? 0, icon: Crosshair, color: "text-red-400", bg: "bg-red-500/10", href: "/dashboard/incidents" },
    { label: "Bekleyen", value: stats?.pendingIncidents ?? 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", href: "/dashboard/incidents" },
    { label: "Onaylanan", value: stats?.approvedIncidents ?? 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", href: "/dashboard/incidents" },
    { label: "Yorumcular", value: stats?.totalCommentators ?? 0, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", href: "/dashboard/commentators" },
    { label: "Uzman Görüşleri", value: stats?.totalOpinions ?? 0, icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/10", href: "/dashboard/opinions" },
    { label: "Mesajlar", value: stats?.totalSuggestions ?? 0, icon: Mail, color: "text-pink-400", bg: "bg-pink-500/10", href: "/dashboard/suggestions" },
    { label: "Yeni Mesaj", value: stats?.newSuggestions ?? 0, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", href: "/dashboard/suggestions" },
  ];

  const quickActions = [
    { label: "Maç Ekle", icon: Trophy, href: "/dashboard/matches", color: "bg-blue-600 hover:bg-blue-500" },
    { label: "Pozisyon Ekle", icon: Crosshair, href: "/dashboard/incidents", color: "bg-red-600 hover:bg-red-500" },
    { label: "Video Ara", icon: Video, href: "/dashboard/videos", color: "bg-purple-600 hover:bg-purple-500" },
    { label: "Hakem Yorumu", icon: Gavel, href: "/dashboard/referee", color: "bg-amber-600 hover:bg-amber-500" },
    { label: "Yorumcu Ekle", icon: Users, href: "/dashboard/commentators", color: "bg-emerald-600 hover:bg-emerald-500" },
    { label: "AI Chat", icon: MessageSquare, href: "/dashboard/chat", color: "bg-cyan-600 hover:bg-cyan-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-zinc-500">{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <TrendingUp className="h-5 w-5 text-red-400" />
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-sm font-medium text-white transition-colors ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {recentIncidents.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Clock className="h-5 w-5 text-amber-400" />
            Son Pozisyonlar
          </h2>
          <div className="space-y-2">
            {recentIncidents
              .filter((inc) => inc != null && typeof inc === "object")
              .map((inc) => (
              <Link
                key={inc.id}
                href={`/dashboard/incidents`}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
              >
                <Crosshair className="h-4 w-4 shrink-0 text-red-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{inc.description}</p>
                  <p className="text-xs text-zinc-500">
                    {inc.match ? `${inc.match.homeTeam} vs ${inc.match.awayTeam}` : "—"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    inc.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : inc.status === "REJECTED"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {inc.status === "APPROVED" ? "Onaylı" : inc.status === "REJECTED" ? "Reddedildi" : "Beklemede"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
