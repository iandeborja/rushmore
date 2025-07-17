import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        
        // Get username from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        session.user.username = dbUser?.username || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After successful sign-in, check if user needs to set up username
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/setup-username`;
      }
      return url;
    }
  }
});

export { handler as GET, handler as POST };
