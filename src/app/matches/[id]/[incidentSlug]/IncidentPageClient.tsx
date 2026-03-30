"use client";

import { useRouter } from "next/navigation";
import IncidentDetailTemplate, { type IncidentDetailData } from "@/components/IncidentDetailTemplate";
import CommentSection from "@/components/CommentSection";
import { matchUrl } from "@/lib/links";

interface IncidentPageClientProps {
  incident: IncidentDetailData;
  matchSlug: string;
}

export default function IncidentPageClient({ incident, matchSlug }: IncidentPageClientProps) {
  const router = useRouter();
  return (
    <IncidentDetailTemplate
      incident={incident}
      activeVideo={incident.videoUrl}
      onBack={() => router.push(matchUrl(matchSlug))}
    >
      <CommentSection incidentId={incident.id} />
    </IncidentDetailTemplate>
  );
}
