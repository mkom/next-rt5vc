import { getSession, useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import axios from 'axios';
import moment from 'moment';

// Layout & Components
import DashboardLayout from '../../components/layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import HousesStats from '../../components/dashboard/HousesStats';
import HousesFilters from '../../components/dashboard/HousesFilters';
import HousesTable from '../../components/dashboard/HousesTable';
import HouseEditDrawer from '../../components/dashboard/HouseEditDrawer';
import Alert from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';

// Hooks
import { useHousesData } from '../../lib/hooks/useHousesData';

// Utils
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * Houses Page - Manage houses data
 *
 * Features:
 * - KPI stats summary (Total, Isi, Weekend, Kosong)
 * - Period-based filtering
 * - Advanced filtering (search, zone, status)
 * - Responsive table with mobile card view
 * - Edit drawer with consistent field styling
 * - Accessible UI with keyboard navigation
 *
 * @param {Object} props
 * @param {Array} props.initialHouses - Initial data from SSR
 */
const Houses = ({ initialHouses }) => {
  const { data: session } = useSession();

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  // Custom hook for houses data management
  const {
    houses,
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
  } = useHousesData({
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

  // Handle edit click
  const handleEditClick = (house) => {
    setSelectedHouse(house);
    setIsDrawerOpen(true);
  };

  // Handle save changes
  const handleSaveChanges = async (editData) => {
    console.log('=== handleSaveChanges ===');
    console.log('editData to save:', editData);
    console.log('monthly_status:', editData.monthly_status?.find(s => s.month === filters.period));
    
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/houses/update/${editData._id}`,
      editData,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          period: filters.period,
          zona: filters.group,
        },
      }
    );
    
    console.log('API response:', res.data);
    
    // Refresh data after save
    await refresh();
    showNotification('success', 'Data rumah berhasil diupdate');
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
        title="Data Rumah"
        subtitle="Kelola dan monitor data rumah warga"
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
      <HousesStats stats={stats} loading={loading && filteredHouses.length === 0} />

      {/* Filters */}
      <HousesFilters
        filters={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Houses Table */}
      <HousesTable
        houses={paginatedData}
        selectedPeriod={filters.period}
        offset={currentPage * ITEMS_PER_PAGE}
        onEditClick={handleEditClick}
        loading={loading}
      />

      {/* Pagination */}
      <Pagination
        pageCount={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* House Edit Drawer */}
      <HouseEditDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        house={selectedHouse}
        selectedPeriod={filters.period}
        onSave={handleSaveChanges}
      />
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
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return {
      props: {
        initialHouses: res.data.data,
      },
    };
  } catch (error) {
    console.error('Error fetching houses data:', error);
    return {
      props: {
        initialHouses: [],
      },
    };
  }
};

Houses.getLayout = (page) => (
  <DashboardLayout title="Data Rumah">{page}</DashboardLayout>
);

export default Houses;
