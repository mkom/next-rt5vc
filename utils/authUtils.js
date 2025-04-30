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
      console.error('Error fetching data:', error);
      signOut();
      router.push('/');
      return false;
    }
  };

  // const useAuthRedirect = () => {
  //   useEffect(() => {
  //     if (status === 'loading') return; // Wait for session to load
  //     if (!session) {

  //       // Redirect to login popup
  //       //const redirectUrl = encodeURIComponent(router.asPath); // Store current path
  //       //signIn('google', { callbackUrl: redirectUrl }); // Open Google login popup
  //       router.push('/');
  //       return;
  //     }
  //     const token = session.accessToken;
  //     const userRole = session.user.role;
  //     checkAuthAndRole(token, userRole);
  //   }, [session, status, router]);
  // };

  const useAuthRedirect = () => {
    useEffect(() => {
      if (status === 'loading') return; // Tunggu hingga session selesai dimuat
  
      if (!session && status !== 'authenticated') {
        // Jika belum login, tetap di halaman dan tampilkan LoginCard
        //signOut();
        //router.push('/');
        return;
      }
      
  
      // Jika sudah login, tidak ada tindakan tambahan
    }, [session, status]);

    // useEffect(() => {
    //   if (status === 'loading') return; // Wait until the session is fully loaded
  
    //   // If there is no session and the status is not authenticated, redirect to the homepage
    //   if (!session && status !== 'authenticated') {
    //     router.push('/');  // Redirect to the homepage
    //   }
    // }, [session, status, router]);


  };

  const useAuthRedirectDashboard = () => {
    useEffect(() => {
      if (status === 'loading') return; // Tunggu hingga session selesai dimuat
  
      if (!session && status !== 'authenticated') {
        // Jika belum login, tetap di halaman dan tampilkan LoginCard
        //signOut();
        router.push('/');
        return;
      }
      
  
      // Jika sudah login, tidak ada tindakan tambahan
    }, [session, status]);

  };
  

  return { checkAuthAndRole, useAuthRedirect, useAuthRedirectDashboard };
};
