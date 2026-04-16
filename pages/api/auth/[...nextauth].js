// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 hari (1 minggu) — Remember Me
    updateAge: 24 * 60 * 60, // Update session setiap 24 jam
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = user.jwtToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = {
        name: token.name,
        email: token.email,
        image: token.picture,
        role: token.role,
      };
      return session;
    },
    async signIn({ user, account }) {
      const { id_token } = account;

      try {
        const response = await axios.post(`${process.env.API_URL}/auth/google`, {
          token: id_token,
        });

        user.jwtToken = response.data.jwtToken;
        user.role = response.data.user.role;
        return true;
      } catch (error) {
        console.error('Error signing in:', error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url === '/auth/signin' || url === '/auth/error') {
        return baseUrl;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/',
    error: '/auth/error',
  },
});
