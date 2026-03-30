import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth config — no PrismaAdapter, no Node.js-only imports.
 * Used by proxy.ts (middleware) and extended by auth.ts with DB adapter.
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nickname = (user as { nickname?: string }).nickname ?? user.name ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nickname = (token.nickname as string) ?? undefined;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
} satisfies NextAuthConfig;
