import { z } from "zod";

export const CommentPostSchema = z.object({
  content: z.string().trim().min(1, "Yorum alanı zorunludur").max(1000, "Yorum en fazla 1000 karakter olabilir"),
  incidentId: z.string().optional(),
  matchId: z.string().optional(),
  parentId: z.string().optional(),
  verdict: z.enum(["CORRECT", "INCORRECT", "UNSURE"]).optional().default("UNSURE"),
}).refine(
  (data) => data.incidentId || data.matchId || data.parentId,
  { message: "incidentId, matchId veya parentId gerekli" }
);

export const VotePostSchema = z.object({
  positionId: z.string().min(1, "positionId gerekli"),
  decisionType: z.enum(["PENALTY", "CONTINUE", "YELLOW_CARD", "RED_CARD"]),
});

export const SuggestionPostSchema = z.object({
  category: z.string().optional().default("general"),
  subject: z.string().trim().min(1, "Konu alanı zorunludur").max(200, "Konu en fazla 200 karakter olabilir"),
  message: z.string().trim().min(1, "Mesaj alanı zorunludur").max(3000, "Mesaj en fazla 3000 karakter olabilir"),
});

export const UserProfilePatchSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  nickname: z.string().trim().min(1).max(50).optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): { data: T } | { error: string; status: number } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors[0]?.message ?? "Geçersiz istek";
    return { error: message, status: 400 };
  }
  return { data: result.data };
}
