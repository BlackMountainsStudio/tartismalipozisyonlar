"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Flag, Square, CircleDot, Play } from "lucide-react";
import AuthModal from "./AuthModal";

const DECISION_OPTIONS: { type: string; label: string; icon: React.ReactNode; style: string }[] = [
  { type: "PENALTY", label: "Penaltı", icon: <Flag className="h-4 w-4" />, style: "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400" },
  { type: "CONTINUE", label: "Devam", icon: <Play className="h-4 w-4" />, style: "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400" },
  { type: "YELLOW_CARD", label: "Sarı Kart", icon: <CircleDot className="h-4 w-4" />, style: "border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400" },
  { type: "RED_CARD", label: "Kırmızı Kart", icon: <Square className="h-4 w-4" />, style: "border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400" },
];

interface VoteData {
  total: number;
  byType: Record<string, number>;
  percentages: Record<string, number> | null;
  userVote: string | null;
}

interface VoteSectionProps {
  incidentId: string;
  refereeDecisionLabel?: string;
}

export default function VoteSection({ incidentId, refereeDecisionLabel }: VoteSectionProps) {
  const { status } = useSession();
  const [voteData, setVoteData] = useState<VoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/votes?positionId=${encodeURIComponent(incidentId)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setVoteData(data);
      }
    } catch {
      setVoteData(null);
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleVote = async (decisionType: string) => {
    if (status !== "authenticated") {
      setAuthModalOpen(true);
      return;
    }

    setVoting(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId: incidentId, decisionType }),
      });
      if (res.ok) {
        await fetchVotes();
      }
    } catch {
      // ignore
    } finally {
      setVoting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Flag className="h-5 w-5 text-red-400" />
          Kullanıcı Oyu
        </h2>

        {refereeDecisionLabel && (
          <p className="mb-4 text-sm text-zinc-400">
            Hakem kararı: <span className="font-medium text-zinc-300">{refereeDecisionLabel}</span>
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {DECISION_OPTIONS.map((opt) => {
            const pct = voteData?.percentages?.[opt.type] ?? 0;
            const isUserVote = voteData?.userVote === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleVote(opt.type)}
                disabled={voting}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  isUserVote ? `${opt.style} ring-2 ring-offset-2 ring-offset-zinc-900` : "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
                }`}
              >
                {opt.icon}
                {opt.label}
                {voteData && voteData.total > 0 && (
                  <span className="text-xs opacity-80">
                    {pct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {voteData && voteData.total > 0 && (
          <p className="text-xs text-zinc-500">
            {voteData.total} kullanıcı oy kullandı
            {status !== "authenticated" && (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                Oy vermek için giriş yapın
              </button>
            )}
          </p>
        )}

        {voteData && voteData.total === 0 && status !== "authenticated" && (
          <p className="text-sm text-zinc-500">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="text-red-400 hover:text-red-300"
            >
              İlk oyu siz verin — Giriş yapın
            </button>
          </p>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
