"use client";

import { useEffect, use, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { incidentUrl } from "@/lib/links";
import { buildMatchSlug, buildIncidentSlug } from "@/lib/slug";

export default function LegacyIncidentRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: incidentId } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/incidents/${incidentId}`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setStatus("notfound");
          return;
        }
        const incident = await res.json();
        if (cancelled) return;
        const match = incident?.match;
        if (!match) {
          setStatus("notfound");
          return;
        }
        const matchSlug =
          match.slug ??
          buildMatchSlug({
            league: match.league,
            week: match.week,
            date: match.date,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
          });
        const incidentSlug =
          incident.slug ??
          buildIncidentSlug({
            id: incident.id,
            minute: incident.minute ?? null,
            description: incident.description ?? "",
          });
        setStatus("found");
        router.replace(incidentUrl(matchSlug, incidentSlug));
      } catch {
        if (!cancelled) setStatus("notfound");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [incidentId, router]);

  if (status === "notfound") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Pozisyon bulunamadı</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-red-400 hover:text-red-300"
        >
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
    </div>
  );
}
