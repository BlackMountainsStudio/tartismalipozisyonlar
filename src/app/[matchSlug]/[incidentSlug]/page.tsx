"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { incidentUrl } from "@/lib/links";

export default function IncidentSlugRedirectPage({
  params,
}: {
  params: Promise<{ matchSlug: string; incidentSlug: string }>;
}) {
  const { matchSlug, incidentSlug } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(incidentUrl(matchSlug, incidentSlug));
  }, [matchSlug, incidentSlug, router]);

  return null;
}
