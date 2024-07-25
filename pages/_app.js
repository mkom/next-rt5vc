import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import "@/styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import Spinner from "../components/Spinner";

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <SessionProvider session={pageProps.session}>
      {loading && <Spinner />}
      <Component {...pageProps} />
     </SessionProvider>
   
  );
}