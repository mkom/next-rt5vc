import { getSession, useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import { createAuthenticatedClient } from '../../lib/api/client';
import { FaRegEnvelope, FaWhatsapp } from 'react-icons/fa';

// Layout & Components
import DashboardLayout from '../../components/layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import BillsStats from '../../components/dashboard/BillsStats';
import BillsFilters from '../../components/dashboard/BillsFilters';
import BillsTable from '../../components/dashboard/BillsTable';
import Alert from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';
import Drawer from '../../components/ui/Drawer';
import LetterPreview from '@/components/LetterPreview.js';
import WhatsAppMessage from '@/components/WhatsAppMessage.js';

// Hooks
import { useBillsData } from '../../lib/hooks/useBillsData';

// Utils
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * Bills Page - Manage outstanding bills/tagihan
 *
 * Features:
 * - KPI stats summary (total tagihan, jumlah rumah, rata-rata)
 * - Search filtering
 * - Responsive table with mobile card view
 * - Letter preview drawer
 * - WhatsApp message drawer
 * - Accessible UI with keyboard navigation
 *
 * @param {Object} props
 * @param {Array} props.initialHouses - Initial data from SSR
 */
const Bills = ({ initialHouses }) => {
  const { data: session } = useSession();

  // Drawer state
  const [isLetterDrawerOpen, setIsLetterDrawerOpen] = useState(false);
  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  // Custom hook for bills data management
  const {
    filteredHouses,
    paginatedData,
    filters,
    setFilter,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useBillsData({
    initialHouses,
    accessToken: session?.accessToken,
  });

  // Check if search filter is active
  const hasActiveFilters = useMemo(() => {
    return !!filters.search;
  }, [filters.search]);

  // Show notification helper
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  // Handle letter preview click
  const handleLetterClick = (house) => {
    setSelectedHouse(house);
    setIsLetterDrawerOpen(true);
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = (house) => {
    setSelectedHouse(house);
    setIsWhatsAppDrawerOpen(true);
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
        title="Tagihan Berjalan"
        subtitle="Kelola dan monitor tagihan IPL yang belum lunas"
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
      <BillsStats stats={stats} loading={loading && filteredHouses.length === 0} />

      {/* Filters */}
      <BillsFilters
        filters={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Bills Table */}
      <BillsTable
        houses={paginatedData}
        offset={currentPage * ITEMS_PER_PAGE}
        onLetterClick={handleLetterClick}
        onWhatsAppClick={handleWhatsAppClick}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination
        pageCount={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Letter Preview Drawer */}
      <Drawer
        isOpen={isLetterDrawerOpen}
        onClose={() => setIsLetterDrawerOpen(false)}
        title="Preview Surat"
        icon={<FaRegEnvelope className="h-5 w-5 text-primary" />}
        width="lg"
      >
        {selectedHouse && <LetterPreview data={selectedHouse} />}
      </Drawer>

      {/* WhatsApp Message Drawer */}
      <Drawer
        isOpen={isWhatsAppDrawerOpen}
        onClose={() => setIsWhatsAppDrawerOpen(false)}
        title="Pesan WhatsApp"
        icon={<FaWhatsapp className="h-5 w-5 text-success" />}
        width="lg"
      >
        {selectedHouse && <WhatsAppMessage data={selectedHouse} />}
      </Drawer>
    </section>
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

  try {
    const client = createAuthenticatedClient(session.accessToken);
    const res = await client.get('/houses/outstanding');
    const sorted = res.data.data.sort((a, b) => b.total_fee - a.total_fee);
    return {
      props: {
        initialHouses: sorted,
      },
    };
  } catch (error) {
    console.error('Error fetching houses data:', error);
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

Bills.getLayout = (page) => (
  <DashboardLayout title="Tagihan Berjalan">{page}</DashboardLayout>
);

export default Bills;
