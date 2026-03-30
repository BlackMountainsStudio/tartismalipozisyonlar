import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/database/db";
import { compare } from "bcryptjs";
import { authConfig } from "./auth.config";

const hasGoogle = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    ...(hasGoogle
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const email = String(credentials.email).trim().toLowerCase();
          const password = String(credentials.password);
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.password) return null;
          const ok = await compare(password, user.password);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.nickname ?? user.name ?? undefined,
            nickname: user.nickname ?? user.name ?? undefined,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!user.email && account?.provider !== "credentials") return false;
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.name) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { nickname: user.name },
          });
        } catch {
          // OAuth user might not exist yet in DB
        }
      }
    },
  },
});
