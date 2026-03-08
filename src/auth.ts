import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/database/db";
import { compare } from "bcryptjs";

const hasGoogle = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const hasFacebook = !!(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(hasGoogle
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    ...(hasFacebook
      ? [
          Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID!,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const ok = await compare(password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.nickname ?? user.name,
        };
      },
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
