import Link from 'next/link';
import { useRouter } from 'next/router';
import { GrTransaction } from "react-icons/gr";
import { FaCalendarCheck, FaHome } from "react-icons/fa";
import { HiChartPie, HiUser, HiHome, HiArrowLeft } from "react-icons/hi";
import { MdOutlinePayments, MdOutlineHouse } from "react-icons/md";

const mainMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiChartPie },
  { href: '/dashboard/transactions', label: 'Transaksi', icon: GrTransaction },
  { href: '/dashboard/ipl', label: 'IPL', icon: FaCalendarCheck },
  { href: '/dashboard/bills', label: 'Tagihan', icon: MdOutlinePayments },
  { href: '/dashboard/setorrw', label: 'Setor RW', icon: FaCalendarCheck },
  { href: '/dashboard/houses', label: 'Rumah', icon: MdOutlineHouse },
  { href: '/dashboard/users', label: 'Users', icon: HiUser },
];

const Sidebar = () => {
  const { pathname } = useRouter();

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:block fixed top-0 left-0 z-40 w-72 h-screen bg-white border-r border-green-100 shadow-sm">
      {/* Logo Section */}
      <div className="h-14 flex items-center px-6 border-b border-green-100">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">RT</span>
          </div>
          <div className="flex flex-col">
            <span className="text-green-900 font-bold text-sm leading-tight">RT5VC Admin</span>
            <span className="text-green-600 text-xs">Dashboard</span>
          </div>
        </Link>
      </div>

      <div className="h-[calc(100vh-3.5rem)] overflow-y-auto py-4">
        {/* Main Menu */}
        <div className="px-4 mb-6">
          <p className="text-xs font-semibold text-green-600/70 uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </p>
          <ul className="space-y-1">
            {mainMenuItems.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                      ${active 
                        ? 'bg-green-50 text-green-700 border-l-3 border-green-600' 
                        : 'text-gray-600 hover:bg-green-50/50 hover:text-green-700'
                      }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>{label}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Back to Home */}
        <div className="px-4 mt-auto">
          <div className="border-t border-green-100 pt-4 mx-3 mb-4" />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-gray-600 hover:bg-green-50/50 hover:text-green-700"
          >
            <FaHome className="w-5 h-5 shrink-0 text-gray-400" />
            <span>Kembali ke Beranda</span>
            <HiArrowLeft className="w-4 h-4 ml-auto text-gray-400" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
