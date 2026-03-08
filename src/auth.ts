import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/database/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID ?? "",
      clientSecret: process.env.AUTH_FACEBOOK_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email && account?.provider !== "credentials") return false;
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.nickname = (user as { nickname?: string }).nickname ?? user.name ?? undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // OAuth ile gelen kullanıcı: nickname = name (kullanıcı panelden değiştirebilir)
      if (user.name) {
        await prisma.user.update({
          where: { id: user.id },
          data: { nickname: user.name },
        });
      }
    },
  },
  pages: {
    signIn: "/giris",
  },
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
});
