import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import "../styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import Spinner from "../components/Spinner";
import AuthGuard from "../components/AuthGuard";
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
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
        <meta name="description" content="Laporan Keuangan RT 05/RW 11 Villa Citayam Susukan Bojong gede Bogor" />
        <meta property="og:title" content="Rt 05 Villa Citayam" />
        <meta property="og:description" content="Laporan Keuangan RT 05/RW 11 Villa Citayam Susukan Bojong gede Bogor" />
        <meta property="og:image" content="" />
        <meta property="og:url" content="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      {loading && <Spinner />}
      <AuthGuard>
        {getLayout(<Component {...pageProps} />)}
      </AuthGuard>
    </SessionProvider>
  );
}
