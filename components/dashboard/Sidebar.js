import Link from 'next/link';
import { useRouter } from 'next/router';
import { GrTransaction } from "react-icons/gr";
import { FaCalendarCheck } from "react-icons/fa";
import { HiChartPie, HiUser, HiHome } from "react-icons/hi";

const menuItems = [
  { href: '/', label: 'Beranda', icon: HiChartPie },
  { href: '/dashboard/transactions', label: 'Transaksi', icon: GrTransaction },
  { href: '/dashboard/ipl', label: 'IPL', icon: FaCalendarCheck },
  { href: '/dashboard/bills', label: 'Tagihan', icon: FaCalendarCheck },
  { href: '/dashboard/setorrw', label: 'Setor RW', icon: FaCalendarCheck },
  { href: '/dashboard/houses', label: 'Rumah', icon: HiHome },
  { href: '/dashboard/users', label: 'Users', icon: HiUser },
];

const SideMenu = () => {
  const { pathname } = useRouter();

  return (
    <aside className="hidden lg:block fixed top-0 z-40 w-72 h-screen pt-14 bg-base-200">
      <div className="h-full overflow-y-auto py-4">
        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest px-4 mb-1">Menu</p>
        <ul className="menu gap-0.5 w-full px-2">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`rounded-lg transition-all duration-150 font-medium text-sm
                  ${pathname === href || (href !== '/' && pathname.startsWith(href))
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
    </aside>
  );
};

export default SideMenu;
