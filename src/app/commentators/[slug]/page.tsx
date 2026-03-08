"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function CommentatorSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/yorumcular/${slug}`);
  }, [router, slug]);
  return null;
}
