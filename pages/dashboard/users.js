import { getSession, useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import { createAuthenticatedClient } from '../../lib/api/client';

// Layout & Components
import DashboardLayout from '../../components/layouts/DashboardLayout';
import PageHeader from '../../components/dashboard/PageHeader';
import UsersStats from '../../components/dashboard/UsersStats';
import UsersFilters from '../../components/dashboard/UsersFilters';
import UsersTable from '../../components/dashboard/UsersTable';
import UserEditDrawer from '../../components/dashboard/UserEditDrawer';
import Alert from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';

// Hooks
import { useUsersData } from '../../lib/hooks/useUsersData';

// Utils
import { ITEMS_PER_PAGE } from '../../utils/constants';

/**
 * Users Page - Manage users data
 *
 * Features:
 * - KPI stats summary (Total Users)
 * - Search filtering
 * - Responsive table with mobile card view
 * - Edit drawer with consistent field styling
 * - Accessible UI with keyboard navigation
 *
 * @param {Object} props
 * @param {Array} props.initialUsers - Initial data from SSR
 */
const Users = ({ initialUsers }) => {
  const { data: session } = useSession();

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  // Custom hook for users data management
  const {
    users,
    filteredUsers,
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
  } = useUsersData({
    initialUsers,
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

  // Handle edit click
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  // Handle save changes
  const handleSaveChanges = async (editData) => {
    try {
      const client = createAuthenticatedClient(session.accessToken);
      await client.put(
        `/users/update/${editData._id}`,
        editData
      );
      // Refresh data after save
      await refresh();
      showNotification('success', 'Data user berhasil diupdate');
    } catch (error) {
      console.error('Error updating user data:', error);
      showNotification('error', 'Gagal mengupdate data user');
      throw error;
    }
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
        title="Data User"
        subtitle="Kelola dan monitor data pengguna sistem"
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
      <UsersStats stats={stats} loading={loading && filteredUsers.length === 0} />

      {/* Filters */}
      <UsersFilters
        filters={filters}
        onChange={setFilter}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Users Table */}
      <UsersTable
        users={paginatedData}
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

      {/* User Edit Drawer */}
      <UserEditDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={selectedUser}
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
    const client = createAuthenticatedClient(session.accessToken);
    const res = await client.get('/users/list');
    return {
      props: {
        initialUsers: res.data.data,
      },
    };
  } catch (error) {
    console.error('Error fetching users data:', error);
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
        initialUsers: [],
      },
    };
  }
};

Users.getLayout = (page) => (
  <DashboardLayout title="Data User">{page}</DashboardLayout>
);

export default Users;
