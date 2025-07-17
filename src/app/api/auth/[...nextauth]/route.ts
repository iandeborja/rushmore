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
      // Handle different redirect scenarios
      if (url === baseUrl || url === `${baseUrl}/`) {
        // Default redirect after sign-in
        return `${baseUrl}/setup-username`;
      }
      
      // If coming from sign-in page, go to setup-username
      if (url.includes('/auth/signin')) {
        return `${baseUrl}/setup-username`;
      }
      
      // For all other cases, use the provided URL
      return url;
    }
  }
});

export { handler as GET, handler as POST };
