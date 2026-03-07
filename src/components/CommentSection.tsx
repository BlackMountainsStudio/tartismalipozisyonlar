"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, Loader2, User } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  matchId?: string;
  incidentId?: string;
}

export default function CommentSection({ matchId, incidentId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const queryParam = incidentId
    ? `incidentId=${incidentId}`
    : `matchId=${matchId}`;
  const isMatchDiscussion = Boolean(matchId) && !incidentId;
  const sectionTitle = isMatchDiscussion ? "Maç Yorumları" : "Yorumlar";
  const textareaLabel = isMatchDiscussion ? "Maçla İlgili Yorumunuz" : "Yorumunuz";
  const textareaPlaceholder = isMatchDiscussion
    ? "Maçla ilgili genel yorumunuzu veya gözden kaçan pozisyonları yazın..."
    : "Bu pozisyon hakkında ne düşünüyorsunuz?";
  const emptyTitle = isMatchDiscussion
    ? "Bu maç için henüz yorum yapılmamış"
    : "Henüz yorum yapılmamış";
  const emptySubtitle = isMatchDiscussion
    ? "Maçla ilgili ilk yorumu siz bırakın!"
    : "İlk yorumu siz yapın!";

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?${queryParam}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [queryParam]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!author.trim() || !content.trim()) {
      setError("İsim ve yorum alanları zorunludur");
      return;
    }

    if (content.trim().length > 1000) {
      setError("Yorum en fazla 1000 karakter olabilir");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        author: author.trim(),
        content: content.trim(),
      };
      if (incidentId) body.incidentId = incidentId;
      if (matchId) body.matchId = matchId;

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setContent("");
        fetchComments();
      } else {
        const data = await res.json();
        setError(data.error || "Yorum eklenemedi");
      }
    } catch {
      setError("Yorum eklenemedi, lütfen tekrar deneyin");
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} gün önce`;
    return new Date(dateStr).toLocaleDateString("tr-TR");
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-red-400" />
        <h2 className="text-xl font-bold text-white">
          {sectionTitle} {comments.length > 0 && <span className="text-zinc-500">({comments.length})</span>}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="mb-4">
          <label htmlFor="author" className="mb-1.5 block text-sm font-medium text-zinc-400">
            İsim
          </label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Adınızı girin..."
            maxLength={50}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="mb-1.5 block text-sm font-medium text-zinc-400">
            {textareaLabel}
          </label>
          <textarea
            id="comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={textareaPlaceholder}
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
          />
          <div className="mt-1 text-right text-xs text-zinc-600">{content.length}/1000</div>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !author.trim() || !content.trim()}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Gönderiliyor..." : "Yorum Yap"}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-12 text-center">
          <MessageSquare className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-400">{emptyTitle}</p>
          <p className="mt-1 text-xs text-zinc-600">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <span className="text-sm font-medium text-white">{comment.author}</span>
                </div>
                <span className="text-xs text-zinc-600">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
