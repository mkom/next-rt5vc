import { getSession, useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import { createAuthenticatedClient } from '../../../lib/api/client';
import moment from 'moment';

// Layout & Components
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import PageHeader from '../../../components/dashboard/PageHeader';
import IplStats from '../../../components/dashboard/IplStats';
import IplFilters from '../../../components/dashboard/IplFilters';
import IplTable from '../../../components/dashboard/IplTable';
import Alert from '../../../components/ui/Alert';
import Pagination from '../../../components/ui/Pagination';

// Hooks
import { useIplData } from '../../../lib/hooks/useIplData';

// Utils
import { ITEMS_PER_PAGE } from '../../../utils/constants';

// Icons
import { FaCalendarCheck } from 'react-icons/fa';

/**
 * Ipl Page - Manage IPL (Iuran Pemeliharaan Lingkungan) data
 *
 * Features:
 * - KPI stats summary (total collected, lunas, belum bayar, PGYB, sebagian)
 * - Period-based filtering
 * - Advanced filtering (search, zone, status)
 * - Responsive table with mobile card view
 * - Accessible UI with keyboard navigation
 *
 * @param {Object} props
 * @param {Array} props.initialHouses - Initial data from SSR
 */
const Ipl = ({ initialHouses }) => {
  const { data: session } = useSession();

  // Local UI state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  // Custom hook for IPL data management
  const {
    filteredHouses,
    paginatedData,
    filters,
    setFilter,
    setPeriod,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useIplData({
    initialHouses,
    accessToken: session?.accessToken,
  });

  // Check if any filter (except period) is active
  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.group || filters.status;
  }, [filters]);

  // Show notification helper
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      {/* Alert Notification */}
      <Alert
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />

      {/* Page Header */}
      <PageHeader
        title="Data IPL"
        subtitle="Kelola dan monitor data iuran pemeliharaan lingkungan"
        onRefresh={refresh}
        refreshing={loading}
        lastUpdated={lastUpdated}
      />

      {/* Error State */}
      {error && (
        <div className="alert alert-error shadow-lg animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Gagal memuat data: {error}</span>
        </div>
      )}

      {/* Stats Summary */}
      <IplStats stats={stats} loading={loading && filteredHouses.length === 0} />

      {/* Filters */}
      <IplFilters
        filters={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* IPL Table */}
      <IplTable
        houses={paginatedData}
        selectedPeriod={filters.period}
        offset={currentPage * ITEMS_PER_PAGE}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination
        pageCount={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};

Ipl.getLayout = (page) => (
  <DashboardLayout title="Data IPL">{page}</DashboardLayout>
);

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

  try {
    const client = createAuthenticatedClient(session.accessToken);
    const res = await client.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl`);
    return {
      props: {
        initialHouses: res.data.data,
      },
    };
  } catch (error) {
    console.error('Error fetching IPL data:', error);
    if (error.response?.status === 401) {
      return {
        redirect: {
          destination: '/?expired=true',
          permanent: false,
        },
      };
    }
    return {
      props: {
        initialHouses: [],
      },
    };
  }
};

export default Ipl;
