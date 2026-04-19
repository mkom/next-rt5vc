import { useState } from 'react';
import { getSession } from 'next-auth/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import KpiGrid from '../../components/dashboard/KpiGrid';
import MonthlyTrendChart from '../../components/dashboard/charts/MonthlyTrendChart';
import IplCollectionChart from '../../components/dashboard/charts/IplCollectionChart';
import OccupancyChart from '../../components/dashboard/charts/OccupancyChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import TopOutstanding from '../../components/dashboard/TopOutstanding';

import { useDashboardData } from '../../lib/hooks/useDashboardData';
import { formatCurrency } from '../../utils/format';
import moment from 'moment';

// Icons
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaHome,
  FaUsers,
  FaPercentage,
  FaCalendarWeek,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaBuilding,
  FaReceipt,
} from 'react-icons/fa';

/**
 * Dashboard Admin - Main admin dashboard page
 *
 * CRITICAL: Only users with 'admin' role can access this page.
 * Protected by both client-side (AdminGuard) and server-side (getServerSideProps).
 *
 * Features:
 * - Real-time KPI cards with financial, citizen, and IPL metrics
 * - Data visualization with charts (trends, collections, occupancy)
 * - Recent activity feed
 * - Top outstanding houses
 * - Period-based filtering
 */
const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));

  // Fetch dashboard data
  const {
    financialMetrics,
    citizenMetrics,
    iplMetrics,
    recentTransactions,
    topOutstanding,
    monthlyTrends,
    outstandingData,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useDashboardData({ period: selectedPeriod });

  // Prepare KPI stats by category
  const financialStats = [
    {
      title: 'Total Saldo',
      value: formatCurrency(financialMetrics.totalBalance),
      icon: FaWallet,
      color: 'primary',
      subtitle: 'Saldo kas saat ini',
    },
    {
      title: 'Total Pemasukan',
      value: formatCurrency(financialMetrics.totalIncome),
      icon: FaArrowUp,
      color: 'success',
      subtitle: 'Kumulatif semua waktu',
    },
    {
      title: 'Total Pengeluaran',
      value: formatCurrency(financialMetrics.totalExpense),
      icon: FaArrowDown,
      color: 'error',
      subtitle: 'Kumulatif semua waktu',
    },
    {
      title: 'Total Tagihan',
      value: formatCurrency(financialMetrics.totalOutstanding),
      icon: FaExclamationTriangle,
      color: 'warning',
      subtitle: `${outstandingData.total} rumah menunggak`,
    },
  ];

  const citizenStats = [
    {
      title: 'Total Rumah',
      value: citizenMetrics.totalHouses,
      icon: FaHome,
      color: 'info',
      subtitle: 'Rumah terdaftar',
    },
    {
      title: 'Tingkat Hunian',
      value: `${citizenMetrics.occupancyRate}%`,
      icon: FaPercentage,
      color: 'success',
      progress: { current: citizenMetrics.occupancyRate, max: 100 },
      subtitle: `${citizenMetrics.occupiedCount} rumah dihuni`,
    },
    {
      title: 'Warga Aktif',
      value: citizenMetrics.activeResidents,
      icon: FaUsers,
      color: 'primary',
      subtitle: `Isi + Weekend`,
    },
    {
      title: 'Rumah Weekend',
      value: citizenMetrics.weekendCount,
      icon: FaCalendarWeek,
      color: 'info',
      subtitle: 'Status weekend',
    },
  ];

  const iplStats = [
    {
      title: 'Tingkat Koleksi',
      value: `${iplMetrics.collectionRate}%`,
      icon: FaChartLine,
      color: iplMetrics.collectionRate >= 80 ? 'success' : iplMetrics.collectionRate >= 50 ? 'warning' : 'error',
      progress: { current: iplMetrics.collectionRate, max: 100 },
      subtitle: `Target: ${formatCurrency(iplMetrics.totalExpected)}`,
    },
    {
      title: 'IPL Terkumpul',
      value: formatCurrency(iplMetrics.totalCollected),
      icon: FaMoneyBillWave,
      color: 'success',
      subtitle: moment(selectedPeriod, 'YYYY-MM').format('MMMM YYYY'),
    },
    {
      title: 'Sudah Bayar',
      value: iplMetrics.paidCount,
      icon: FaCheckCircle,
      color: 'success',
      subtitle: `${iplMetrics.partialCount} bayar sebagian`,
    },
    {
      title: 'Belum Bayar',
      value: iplMetrics.unpaidCount,
      icon: FaTimesCircle,
      color: 'error',
      subtitle: `${iplMetrics.tbdCount} PGYB`,
    },
  ];

  return (
    <section className="flex flex-col gap-8 animate-fade-in">
      {/* Header with Period Selector */}
      <DashboardHeader
        title="Dashboard Admin"
        subtitle="Kelola data keuangan dan warga RT 005"
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onRefresh={refresh}
        refreshing={loading}
        lastUpdated={lastUpdated}
      />

      {/* Error State */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Gagal memuat data: {error}</span>
        </div>
      )}

      {/* Section 1: Financial Overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <FaWallet className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-base-content uppercase tracking-wider">Ikhtisar Keuangan</h2>
        </div>
        <KpiGrid stats={financialStats} loading={loading} />
      </div>

      {/* Section 2: Trend Chart (Full Width) - Independent of period filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <FaChartLine className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-base-content uppercase tracking-wider">Trend Pemasukan & Pengeluaran (6 Bulan Terakhir)</h2>
        </div>
        <MonthlyTrendChart data={monthlyTrends} loading={loading} />
      </div>

      {/* Section 3: Two Column Layout - IPL & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: IPL Stats & Collection Chart */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <FaReceipt className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-base-content uppercase tracking-wider">
              IPL {moment(selectedPeriod, 'YYYY-MM').format('MMMM YYYY')}
            </h2>
          </div>
          <KpiGrid stats={iplStats} loading={loading} />
          <IplCollectionChart data={iplMetrics} loading={loading} />
        </div>

        {/* Right: Citizen Stats & Occupancy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <FaBuilding className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-base-content uppercase tracking-wider">
              Demografi Warga {moment(selectedPeriod, 'YYYY-MM').format('MMMM YYYY')}
            </h2>
          </div>
          <KpiGrid stats={citizenStats} loading={loading} />
          <OccupancyChart data={citizenMetrics} loading={loading} />
        </div>
      </div>

      {/* Section 4: Activity & Outstanding Widgets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <FaChartLine className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-base-content uppercase tracking-wider">Aktivitas & Tagihan</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity transactions={recentTransactions} loading={loading} />
          <TopOutstanding houses={topOutstanding} loading={loading} />
        </div>
      </div>
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

  return {
    props: {},
  };
};

Dashboard.getLayout = (page) => (
  <DashboardLayout title="Dashboard">{page}</DashboardLayout>
);

export default Dashboard;
