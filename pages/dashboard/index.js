import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Report from '../../components/Report';
import { FaWallet, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <section className="flex flex-col gap-6">
      <div className="pt-2 px-1">
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">Dashboard Admin</h1>
        <p className="text-sm text-base-content/70 mt-1">Kelola data keuangan dan warga RT 005</p>
      </div>

      {/* Stats Cards in a mobile-friendly 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 lg:gap-6">
        <StatCard title="Total Saldo" value="Rp 0" icon={FaWallet} color="indigo" />
        <StatCard title="Pendapatan" value="Rp 0" icon={FaArrowUp} color="emerald" />
        <StatCard title="Pengeluaran" value="Rp 0" icon={FaArrowDown} color="rose" />
        <StatCard title="Outstanding" value="Rp 0" icon={FaExclamationTriangle} color="amber" />
      </div>

      {/* Report Section */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-base-content tracking-tight">Laporan Keuangan</h2>
        </div>
        <div className="app-card p-4">
          <Report />
        </div>
      </div>
    </section>
  );
};

Dashboard.getLayout = (page) => (
  <DashboardLayout title="Dashboard">{page}</DashboardLayout>
);

export default Dashboard;
