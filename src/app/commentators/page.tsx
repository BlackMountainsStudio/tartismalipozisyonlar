"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function CommentatorsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/yorumcular");
  }, [router]);
  return null;
}
