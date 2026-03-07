"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Scale,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  ExternalLink,
  Award,
} from "lucide-react";
import { getOpinionSourceLabel } from "@/lib/linkLabels";

interface Opinion {
  id: string;
  comment: string;
  stance: string;
  sourceUrl: string | null;
  incident: {
    id: string;
    type: string;
    minute: number | null;
    description: string;
    match: {
      id: string;
      homeTeam: string;
      awayTeam: string;
      league: string;
      week: number;
      date: string;
    };
  };
}

interface Commentator {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  birthDate: string | null;
  birthPlace: string | null;
  education: string | null;
  career: string[];
  expertise: string[];
  opinions: Opinion[];
}

const STANCE_INFO: Record<string, { label: string; icon: React.ReactNode; style: string; bg: string }> = {
  AGREE: {
    label: "Karar Doğru",
    icon: <CheckCircle2 className="h-4 w-4" />,
    style: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  DISAGREE: {
    label: "Karara İtiraz",
    icon: <XCircle className="h-4 w-4" />,
    style: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
  NEUTRAL: {
    label: "Kararsız",
    icon: <MinusCircle className="h-4 w-4" />,
    style: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/30",
  },
};

const TYPE_LABELS: Record<string, string> = {
  POSSIBLE_PENALTY: "Penaltı Pozisyonu",
  PENALTY: "Penaltı Kararı",
  OFFSIDE: "Ofsayt Kararı",
  POSSIBLE_OFFSIDE_GOAL: "Ofsayt Tartışması",
  MISSED_RED_CARD: "Verilmeyen Kırmızı Kart",
  RED_CARD: "Kırmızı Kart",
  YELLOW_CARD: "Sarı Kart",
  VAR_CONTROVERSY: "VAR Tartışması",
  GOAL_DISALLOWED: "İptal Edilen Gol",
  FOUL: "Faul Kararı",
  HANDBALL: "El ile Temas",
};

export default function CommentatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [commentator, setCommentator] = useState<Commentator | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/commentators/${slug}`, { cache: "no-store" });
      if (!res.ok) { setCommentator(null); return; }
      const data = await res.json();
      setCommentator(data);
    } catch {
      setCommentator(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!commentator) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Yorumcu bulunamadı</p>
      </div>
    );
  }

  const agreeCount = commentator.opinions.filter((o) => o.stance === "AGREE").length;
  const disagreeCount = commentator.opinions.filter((o) => o.stance === "DISAGREE").length;
  const neutralCount = commentator.opinions.filter((o) => o.stance === "NEUTRAL").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.push("/commentators")}
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Tüm Yorumcular
      </button>

      {/* Profil Kartı */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
            <Scale className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{commentator.name}</h1>
            <p className="text-sm text-red-400">{commentator.role}</p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-7 text-zinc-300">{commentator.bio}</p>

        {/* Kişisel bilgiler */}
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          {commentator.birthDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {commentator.birthDate}
            </span>
          )}
          {commentator.birthPlace && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {commentator.birthPlace}
            </span>
          )}
          {commentator.education && (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> {commentator.education}
            </span>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Toplam Yorum" value={commentator.opinions.length} color="text-white" />
        <StatBox label="Karar Doğru" value={agreeCount} color="text-emerald-400" />
        <StatBox label="İtiraz Etti" value={disagreeCount} color="text-red-400" />
        <StatBox label="Kararsız" value={neutralCount} color="text-zinc-400" />
      </div>

      {/* Kariyer */}
      {commentator.career.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Briefcase className="h-5 w-5 text-red-400" />
            Kariyer
          </h2>
          <div className="space-y-2">
            {commentator.career.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <p className="text-sm text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uzmanlık Alanları */}
      {commentator.expertise.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Award className="h-5 w-5 text-red-400" />
            Uzmanlık Alanları
          </h2>
          <div className="flex flex-wrap gap-2">
            {commentator.expertise.map((item, i) => (
              <span
                key={i}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pozisyon Yorumları */}
      {commentator.opinions.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-5 text-lg font-bold text-white">Pozisyon Değerlendirmeleri</h2>
          <div className="space-y-4">
            {commentator.opinions.map((op) => {
              const stanceInfo = STANCE_INFO[op.stance] ?? STANCE_INFO.NEUTRAL;
              return (
                <div
                  key={op.id}
                  className={`rounded-xl border p-5 ${stanceInfo.bg}`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/incidents/${op.incident.id}`}
                      className="text-sm font-medium text-white hover:text-red-400"
                    >
                      {op.incident?.match
                        ? `${op.incident.match.homeTeam} vs ${op.incident.match.awayTeam}`
                        : `Pozisyon #${op.incident?.id?.slice(0, 8) ?? "?"}`}
                      {op.incident?.minute && ` — ${op.incident.minute}'`}
                      {" · "}
                      {TYPE_LABELS[op.incident.type] ?? op.incident.type}
                    </Link>
                    <span className={`flex items-center gap-1.5 text-sm font-medium ${stanceInfo.style}`}>
                      {stanceInfo.icon}
                      {stanceInfo.label}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-300 italic">
                    &ldquo;{op.comment}&rdquo;
                  </p>

                  {op.sourceUrl && (
                    <a
                      href={op.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                      title={op.sourceUrl}
                    >
                      {getOpinionSourceLabel(op.sourceUrl)} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
