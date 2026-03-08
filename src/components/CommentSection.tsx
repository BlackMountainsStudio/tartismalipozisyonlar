"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Loader2, User, ThumbsUp, ThumbsDown, HelpCircle, Reply, Flag } from "lucide-react";
import AuthModal from "./AuthModal";
import ReportModal from "./ReportModal";

type Verdict = "CORRECT" | "INCORRECT" | "UNSURE";

interface ReplyType {
  id: string;
  author: string;
  content: string;
  image?: string | null;
  createdAt: string;
  parentId?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  verdict?: Verdict;
  image?: string | null;
  createdAt: string;
  replies?: ReplyType[];
}

const VERDICT_OPTIONS: { value: Verdict; label: string; icon: React.ReactNode }[] = [
  { value: "CORRECT", label: "Doğru karar", icon: <ThumbsUp className="h-4 w-4" /> },
  { value: "INCORRECT", label: "Yanlış karar", icon: <ThumbsDown className="h-4 w-4" /> },
  { value: "UNSURE", label: "Emin değilim", icon: <HelpCircle className="h-4 w-4" /> },
];

interface CommentSectionProps {
  matchId?: string;
  incidentId?: string;
}

export default function CommentSection({ matchId, incidentId }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [verdict, setVerdict] = useState<Verdict>("UNSURE");
  const [error, setError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportingComment, setReportingComment] = useState<{ id: string; author: string } | null>(null);

  const queryParam = incidentId
    ? `incidentId=${incidentId}`
    : `matchId=${matchId}`;
  const isMatchDiscussion = Boolean(matchId) && !incidentId;
  const sectionTitle = isMatchDiscussion ? "Maç Yorumları" : "Yorumlar";
  const textareaLabel = isMatchDiscussion ? "Maç Hakkındaki Yorumunuz" : "Yorumunuz";
  const textareaPlaceholder = isMatchDiscussion
    ? "Maç hakkında yorumlarınızı paylaşın. Gözden kaçırdığımız bir pozisyon varsa lütfen iletin."
    : "Bu pozisyon hakkında ne düşünüyorsunuz?";
  const emptyTitle = isMatchDiscussion
    ? "Bu maç için henüz yorum yapılmamış"
    : "Henüz yorum yapılmamış";
  const emptySubtitle = isMatchDiscussion
    ? "Maç hakkında yorum yapabilir, gözden kaçan bir pozisyon varsa bize iletebilirsiniz."
    : "İlk yorumu siz yapın!";

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?${queryParam}`, { cache: "no-store" });
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

    if (!content.trim()) {
      setError("Yorum alanı zorunludur");
      return;
    }

    if (content.trim().length > 1000) {
      setError("Yorum en fazla 1000 karakter olabilir");
      return;
    }

    if (status !== "authenticated" || !session?.user) {
      setAuthModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        content: content.trim(),
      };
      if (incidentId) {
        body.incidentId = incidentId;
        body.verdict = verdict;
      }
      if (matchId) body.matchId = matchId;

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
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

  async function handleReplySubmit(parentId: string) {
    if (!replyContent.trim()) return;
    if (status !== "authenticated" || !session?.user) {
      setAuthModalOpen(true);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ parentId, content: replyContent.trim() }),
      });
      if (res.ok) {
        setReplyContent("");
        setReplyingTo(null);
        fetchComments();
      } else {
        const data = await res.json();
        setError(data.error || "Yanıt eklenemedi");
      }
    } catch {
      setError("Yanıt eklenemedi, lütfen tekrar deneyin");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReport(commentId: string, reason: string) {
    const res = await fetch(`/api/comments/${commentId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error("Şikayet gönderilemedi");
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
        {session?.user && (
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 overflow-hidden rounded-full bg-zinc-800">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" width={32} height={32} className="h-8 w-8 object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-4 w-4 text-zinc-500" />
                </div>
              )}
            </div>
            <span className="text-sm text-zinc-400">
              {session.user.nickname || session.user.name} olarak yorum yapıyorsunuz
            </span>
            <a href="/profil" className="ml-auto text-xs text-red-400 hover:text-red-300">
              Profili düzenle
            </a>
          </div>
        )}
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

        {incidentId && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Kararınız
            </label>
            <div className="flex flex-wrap gap-2">
              {VERDICT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVerdict(opt.value)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    verdict === opt.value
                      ? opt.value === "CORRECT"
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : opt.value === "INCORRECT"
                          ? "border-red-500 bg-red-500/20 text-red-400"
                          : "border-amber-500 bg-amber-500/20 text-amber-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !content.trim()}
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
        <>
          {incidentId && comments.length > 0 && (() => {
            const total = comments.length;
            const correct = comments.filter((c) => c.verdict === "CORRECT").length;
            const incorrect = comments.filter((c) => c.verdict === "INCORRECT").length;
            const unsure = comments.filter((c) => !c.verdict || c.verdict === "UNSURE").length;
            const pCorrect = total ? Math.round((correct / total) * 100) : 0;
            const pIncorrect = total ? Math.round((incorrect / total) * 100) : 0;
            const pUnsure = total ? Math.round((unsure / total) * 100) : 0;
            return (
              <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Topluluk değerlendirmesi
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-zinc-400">Doğru karar</span>
                    <span className="text-sm font-semibold text-green-400">{pCorrect}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-zinc-400">Yanlış karar</span>
                    <span className="text-sm font-semibold text-red-400">{pIncorrect}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-zinc-400">Emin değilim</span>
                    <span className="text-sm font-semibold text-amber-400">{pUnsure}%</span>
                  </div>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${pCorrect}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${pIncorrect}%` }}
                  />
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ width: `${pUnsure}%` }}
                  />
                </div>
              </div>
            );
          })()}
          <div className="space-y-4">
            {comments.map((comment) => {
              const verdictOpt = VERDICT_OPTIONS.find((o) => o.value === comment.verdict);
              const replies = comment.replies ?? [];
              return (
                <div
                  key={comment.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 overflow-hidden rounded-full bg-zinc-800">
                        {comment.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={comment.image} alt="" width={28} height={28} className="h-7 w-7 object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-3.5 w-3.5 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white">{comment.author}</span>
                      {incidentId && verdictOpt && (
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            comment.verdict === "CORRECT"
                              ? "bg-green-500/20 text-green-400"
                              : comment.verdict === "INCORRECT"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {verdictOpt.icon}
                          {verdictOpt.label}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-600">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">{comment.content}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (status !== "authenticated") setAuthModalOpen(true);
                        else setReplyingTo(replyingTo === comment.id ? null : comment.id);
                      }}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Yanıtla
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportingComment({ id: comment.id, author: comment.author })}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Şikayet et
                    </button>
                  </div>
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`@${comment.author} yanıtla...`}
                        rows={2}
                        maxLength={1000}
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={submitting || !replyContent.trim()}
                        className="self-end rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gönder"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                        className="self-end rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
                      >
                        İptal
                      </button>
                    </div>
                  )}
                  {replies.length > 0 && (
                    <div className="mt-4 ml-6 space-y-3 border-l-2 border-zinc-800 pl-4">
                      {replies.map((r) => (
                        <div key={r.id} className="flex gap-2">
                          <div className="flex h-6 w-6 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                            {r.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={r.image} alt="" width={24} height={24} className="h-6 w-6 object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <User className="h-3 w-3 text-zinc-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{r.author}</span>
                              <span className="text-xs text-zinc-600">{timeAgo(r.createdAt)}</span>
                              <button
                                type="button"
                                onClick={() => setReportingComment({ id: r.id, author: r.author })}
                                className="ml-auto text-xs text-zinc-500 hover:text-red-400"
                              >
                                <Flag className="inline h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm text-zinc-400">{r.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        callbackUrl={typeof window !== "undefined" ? window.location.href : undefined}
      />

      <ReportModal
        isOpen={!!reportingComment}
        onClose={() => setReportingComment(null)}
        onSubmit={(reason) => handleReport(reportingComment!.id, reason)}
        commentAuthor={reportingComment?.author}
      />
    </div>
  );
}
