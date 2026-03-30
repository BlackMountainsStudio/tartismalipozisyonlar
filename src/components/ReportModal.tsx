"use client";

import { useState } from "react";
import { X, Flag } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  commentAuthor?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  commentAuthor,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason("");
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <Flag className="h-5 w-5 text-red-500" />
          <h2 id="report-modal-title" className="text-lg font-bold text-white">
            Yorumu şikayet et
          </h2>
        </div>

        {commentAuthor && (
          <p className="mb-4 text-sm text-zinc-400">
            <span className="text-zinc-500">Yorum sahibi:</span> {commentAuthor}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Neden şikayet ediyorsunuz? <span className="text-zinc-400">(opsiyonel)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Şikayet nedeninizi yazabilirsiniz..."
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
          />
          <div className="mt-1 text-right text-xs text-zinc-500">{reason.length}/500</div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
            >
              {submitting ? "Gönderiliyor..." : "Şikayet et"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
