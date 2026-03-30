import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tartışmalı Pozisyonlar | Var Odası",
  description: "Süper Lig'deki tartışmalı hakem kararları, penaltı pozisyonları, kırmızı kart ve VAR müdahalelerinin AI destekli analizi.",
  alternates: {
    canonical: "https://varodasi.com/pozisyonlar",
  },
  openGraph: {
    title: "Tartışmalı Pozisyonlar — VAR & Hakem Kararları | Var Odası",
    description: "Süper Lig penaltı, kırmızı kart, ofsayt ve VAR pozisyonlarının kapsamlı analizi.",
    url: "https://varodasi.com/pozisyonlar",
  },
};

export default function PozisyonlarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
