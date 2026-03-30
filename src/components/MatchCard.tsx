import Link from "next/link";
import { matchUrl, refereeUrl } from "@/lib/links";
import { Calendar, AlertTriangle, ChevronRight, UserRound } from "lucide-react";

interface RefereeInfo {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

interface MatchCardProps {
  id: string;
  slug?: string | null;
  homeTeam: string;
  awayTeam: string;
  week: number;
  date: string;
  homeScore?: number | null;
  awayScore?: number | null;
  incidentCount?: number;
  pendingCount?: number;
  linkPrefix?: string;
  referee?: RefereeInfo | null;
  varReferee?: RefereeInfo | null;
}

export default function MatchCard({
  id,
  slug,
  homeTeam,
  awayTeam,
  week,
  date,
  homeScore,
  awayScore,
  incidentCount = 0,
  pendingCount = 0,
  linkPrefix = "/matches",
  referee,
  varReferee,
}: MatchCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const href =
    linkPrefix === "/dashboard/matches"
      ? `/dashboard/matches/${id}`
      : matchUrl(slug ?? id);

  return (
    <article className="group block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900">
      <Link href={href} className="block">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
            Hafta {week}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="text-lg font-bold text-white">{homeTeam}</span>
          {homeScore != null && awayScore != null ? (
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm font-medium text-red-400">
              {homeScore} - {awayScore}
            </span>
          ) : (
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
              vs
            </span>
          )}
          <span className="text-lg font-bold text-white">{awayTeam}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {incidentCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {incidentCount} pozisyon
              </div>
            )}
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                {pendingCount} bekliyor
              </span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-red-400" />
        </div>
      </Link>

      {(referee || varReferee) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-3 text-xs text-zinc-500">
          {referee && (
            <Link
              href={refereeUrl(referee.slug)}
              className="flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-1 transition-colors hover:text-red-400"
            >
              <UserRound className="h-3 w-3 text-red-400" />
              {referee.name}
            </Link>
          )}
          {varReferee && (
            <Link
              href={refereeUrl(varReferee.slug)}
              className="flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-1 transition-colors hover:text-amber-400"
            >
              <UserRound className="h-3 w-3 text-amber-400" />
              VAR: {varReferee.name}
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
