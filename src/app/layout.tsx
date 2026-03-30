import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://varodasi.com";

export const metadata: Metadata = {
  title: "Var Odası - Hakem Kararları Analiz Platformu",
  description:
    "Tartışmalı hakem kararlarını topluluk tartışmalarını analiz ederek otomatik tespit eden AI destekli platform. varodasi.com",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Var Odası",
    title: "Var Odası - Hakem Kararları Analiz Platformu",
    description:
      "Tartışmalı hakem kararlarını topluluk tartışmalarını analiz ederek otomatik tespit eden AI destekli platform.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Var Odası - Hakem Kararları Analiz Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Var Odası - Hakem Kararları Analiz Platformu",
    description:
      "Tartışmalı hakem kararlarını topluluk tartışmalarını analiz ederek otomatik tespit eden AI destekli platform.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        <SessionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-red-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
          >
            İçeriğe atla
          </a>
          <Navbar />
          <main id="main-content" className="min-h-[calc(100vh-4rem-6rem)]">{children}</main>
          <Footer />
          <SpeedInsights />
          <Analytics />
          {CLARITY_ID && (
            <Script
              id="microsoft-clarity"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`,
              }}
            />
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
