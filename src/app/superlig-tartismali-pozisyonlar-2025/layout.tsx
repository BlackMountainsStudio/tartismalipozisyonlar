import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Süper Lig Tartışmalı Pozisyonlar 2025 | Var Odası",
  description: "2024-25 ve 2025-26 Süper Lig sezonunun tartışmalı hakem kararları, penaltı pozisyonları ve VAR kararlarının kapsamlı analizi.",
  alternates: {
    canonical: "https://varodasi.com/superlig-tartismali-pozisyonlar-2025",
  },
  openGraph: {
    title: "Süper Lig Tartışmalı Pozisyonlar 2025 | Var Odası",
    description: "Süper Lig'in en tartışmalı hakem kararları ve VAR pozisyonlarının AI destekli analizi.",
    url: "https://varodasi.com/superlig-tartismali-pozisyonlar-2025",
  },
};

export default function SuperligLayout({ children }: { children: React.ReactNode }) {
  return children;
}
