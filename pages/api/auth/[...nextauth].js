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
  callbacks: {
    async jwt({ token, account,user}) {
      if (account) {
        token.accessToken = user.jwtToken;
        token.user = user;
      }
      return token;
    },
    async session({session, token  }) {
      // Adding accessToken and user to session
      session.accessToken = token.accessToken;
      session.user = token.user;

      // Handle session expiration or invalid token
      if (!session.accessToken) {
        // Redirect to home if session expired
        return null;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      const { email } = user;
      const { id_token } = account;

      try {
        const response = await axios.post(`${process.env.API_URL}/auth/google`, {
          token: id_token,
        });

        const { token } = response.data.jwtToken;
        user.jwtToken = response.data.jwtToken;
        user.role=response.data.user.role;
        //console.log(response.data.user.role)
        return true;
        //return `/home`; // Redirect URL after successful login
      } catch (error) {
        console.error('Error signing in:', error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url === '/auth/signin' || url === '/auth/error') {
        return baseUrl;  // Redirect to the homepage
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/',  // Customize the login page
    //signIn: '/auth/signin',  // Customize the login page
    error: '/auth/error',    // Custom error page
    // Optionally, you can create a custom redirect page
    // after a successful login:
    // dashboard: '/dashboard',
  },
});
