import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import "@/styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import Spinner from "../components/Spinner";
import CustomThemeProvider from '../components/CustomTheme';

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
      <Head>
        <title>RT5VC - Rt 05 Villa Citayam</title>
        <meta name="description" content="Platform pusat informasi RT05/RW11 Villa Citayam Susukan Bogor" />
        <meta property="og:title" content="RT5VC" />
        <meta property="og:description" content="Platform pusat informasi RT05/RW11 Villa Citayam Susukan Bogor" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
      </Head>

      <CustomThemeProvider>
      {loading && <Spinner />}
      <Component {...pageProps} />
      </CustomThemeProvider>
      
     </SessionProvider>
   
  );
}