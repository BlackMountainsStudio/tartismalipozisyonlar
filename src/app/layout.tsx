import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tartışmalı Pozisyonlar - Hakem Kararları Analiz Platformu",
  description:
    "Tartışmalı hakem kararlarını topluluk tartışmalarını analiz ederek otomatik tespit eden AI destekli platform. tartismalipozisyonlar.com",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-4rem-6rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
