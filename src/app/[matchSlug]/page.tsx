"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { matchUrl } from "@/lib/links";

export default function MatchSlugRedirectPage({
  params,
}: {
  params: Promise<{ matchSlug: string }>;
}) {
  const { matchSlug } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(matchUrl(matchSlug));
  }, [matchSlug, router]);

  return null;
}
