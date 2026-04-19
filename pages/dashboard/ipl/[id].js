import { useSession, getSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FaCalendarCheck } from 'react-icons/fa';
import DashboardLayout from '../../../components/layouts/DashboardLayout';

/**
 * IplDetail Page - Admin only
 * 
 * CRITICAL: Only users with 'admin' role can access this page.
 */
const IplDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const goBack = () => {
    router.back();
  };

  const fetchHouses = useCallback(async () => {
    if (session) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${id.toUpperCase()}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
      }
    }
  }, [session, id]);

  useEffect(() => {
    if (session) fetchHouses();
  }, [session, fetchHouses]);

  return (
    <>
      <h1 className='text-xl mb-4 flex font-bold items-center gap-2'>
        <FaCalendarCheck className="h-6 w-6" />
        <span>Data IPL {id && id.toUpperCase()}</span>
      </h1>
      <button onClick={goBack} className="btn btn-ghost btn-sm">Go Back</button>
    </>
  );
};

/**
 * Server-side protection - Hanya admin yang boleh akses
 */
export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  
  // Check authentication
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  
  // Check authorization - HANYA admin yang boleh akses
  if (session.user?.role !== 'admin') {
    return {
      redirect: {
        destination: '/?access_denied=true',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
};

IplDetail.getLayout = (page) => (
  <DashboardLayout title="Detail IPL">{page}</DashboardLayout>
);

export default IplDetail;
