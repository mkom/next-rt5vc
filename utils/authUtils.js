import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';

export const useRequireAuth = (allowedRoles = ['admin', 'user', 'editor', 'superadmin']) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const checkAuthAndRole = async (token, userRole) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = response.data;

      if (!user) {
        router.push('/');
        return false;
      }

      if (!allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error fetching user data:', error);
      signOut();
      router.push('/');
      return false;
    }
  };

  const useAuthRedirect = () => {
    useEffect(() => {
      if (status === 'loading') return; // Wait for session to load
      if (!session) {
        router.push('/');
        return;
      }
      const token = session.accessToken;
      const userRole = session.user.role;
      checkAuthAndRole(token, userRole);
    }, [session, status, router]);
  };

  return { checkAuthAndRole, useAuthRedirect };
};
