import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: "common",
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read Calendars.ReadWrite",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 初回サインイン時にトークン情報を保存
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        error: token.error as string | undefined,
      };
    },
  },
  pages: {
    signIn: "/login", // /auth/signin から /login に変更
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };