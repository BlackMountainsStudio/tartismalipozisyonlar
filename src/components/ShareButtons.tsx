"use client";

import { Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  function getUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`${title}\n${getUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function shareX() {
    const text = encodeURIComponent(`${title} via @varodasi`);
    const url = encodeURIComponent(getUrl());
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  }

  function shareTelegram() {
    const text = encodeURIComponent(title);
    const url = encodeURIComponent(getUrl());
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getUrl());
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Share2 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
      <button
        onClick={shareWhatsApp}
        aria-label="WhatsApp'ta paylaş"
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-green-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      >
        WhatsApp
      </button>
      <button
        onClick={shareX}
        aria-label="X'te paylaş"
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      >
        𝕏
      </button>
      <button
        onClick={shareTelegram}
        aria-label="Telegram'da paylaş"
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-blue-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Telegram
      </button>
      <button
        onClick={copyLink}
        aria-label="Bağlantıyı kopyala"
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      >
        Kopyala
      </button>
    </div>
  );
}
