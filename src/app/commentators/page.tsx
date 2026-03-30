"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommentatorsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/yorumcular");
  }, [router]);
  return null;
}
