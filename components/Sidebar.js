import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FaHome, FaRegFileAlt, FaWpforms, FaList, FaTasks } from "react-icons/fa";
import { HiChartPie } from "react-icons/hi";

const menuItems = [
  { href: '/', label: 'Beranda', icon: FaHome },
  { href: '/cashflow', label: 'Cashflow', icon: FaRegFileAlt },
  { href: '/ipl', label: 'IPL', icon: FaTasks },
  { href: '/outstanding', label: 'Outstanding', icon: FaList },
  { href: '/confirmation', label: 'Konfirmasi Transfer', icon: FaWpforms },
  { href: '/history', label: 'Riwayat Pembayaran', icon: FaList },
];

const SideMenu = () => {
  const { data: session } = useSession();
  const { pathname } = useRouter();

  const hasRole = (roles) =>
    session?.user?.role ? roles.includes(session.user.role) : false;

  return (
    <aside className="hidden lg:block fixed top-0 z-40 w-72 h-screen pt-14 bg-base-200">
      <div className="h-full overflow-y-auto py-4 flex flex-col gap-2">
        {session && (
          <div className="px-3">
            <div className="bg-base-100 rounded-lg p-3 border border-base-300 flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-neutral/10 flex items-center justify-center text-neutral font-bold text-sm shrink-0">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-base-content truncate">{session.user?.name}</p>
                <p className="text-xs text-base-content/60 capitalize truncate">{session.user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest px-4 mb-1">Menu</p>
          <ul className="menu gap-0.5 w-full px-2">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`rounded-lg transition-all duration-150 font-medium text-sm
                    ${pathname === href
                      ? 'bg-base-100 text-primary border-l-2 border-primary pl-3'
                      : 'text-base-content/70 hover:bg-base-300 hover:text-base-content border-l-2 border-transparent pl-3'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {hasRole(['admin', 'editor', 'superadmin']) && (
          <div>
            <div className="divider my-0 px-3"></div>
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest px-4 mb-1">Admin</p>
            <ul className="menu gap-0.5 w-full px-2">
              <li>
                <Link
                  href="/dashboard/transactions"
                  className={`rounded-lg transition-all duration-150 font-medium text-sm
                    ${pathname.startsWith('/dashboard')
                      ? 'bg-base-100 text-primary border-l-2 border-primary pl-3'
                      : 'text-base-content/70 hover:bg-base-300 hover:text-base-content border-l-2 border-transparent pl-3'
                    }`}
                >
                  <HiChartPie className="h-4 w-4 shrink-0" />
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideMenu;
