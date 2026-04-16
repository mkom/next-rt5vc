import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaTasks, FaWpforms, FaList, FaCalendarCheck } from 'react-icons/fa';
import { GrTransaction } from 'react-icons/gr';
import { HiHome, HiUser, HiDotsHorizontal } from 'react-icons/hi';
import BottomSheet from './BottomSheet';

const publicItems = [
  { href: '/', label: 'Beranda', icon: FaHome },
  { href: '/ipl', label: 'IPL', icon: FaTasks },
  { href: '/confirmation', label: 'Konfirmasi', icon: FaWpforms },
  { href: '/history', label: 'Riwayat', icon: FaList },
];

const dashboardMainItems = [
  { href: '/dashboard/transactions', label: 'Transaksi', icon: GrTransaction },
  { href: '/dashboard/ipl', label: 'IPL', icon: FaCalendarCheck },
  { href: '/dashboard/bills', label: 'Tagihan', icon: FaCalendarCheck },
  { href: '/dashboard/houses', label: 'Rumah', icon: HiHome },
];

const dashboardMoreItems = [
  { href: '/dashboard/setorrw', label: 'Setor RW', icon: FaCalendarCheck },
  { href: '/dashboard/users', label: 'Users', icon: HiUser },
  { href: '/', label: 'Beranda', icon: FaHome },
];

const BottomNav = ({ variant = 'public' }) => {
  const { pathname } = useRouter();
  const [showMore, setShowMore] = useState(false);

  const items = variant === 'dashboard' ? dashboardMainItems : publicItems;

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href);
  };

  const isMoreActive = dashboardMoreItems.some(item =>
    variant === 'dashboard' && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))
  );
  const isPublicMoreActive = publicItems.some(item =>
    variant === 'public' && item.href !== '/' && pathname.startsWith(item.href)
  );

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-base-200 lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-200 active:scale-90
                  ${active ? 'text-primary' : 'text-base-content/40'}`}
              >
                <div className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-300
                  ${active ? 'bg-primary/10' : 'bg-transparent'}`}>
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`} />
                </div>
                <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${active ? 'opacity-100' : 'opacity-80'}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setShowMore(true)}
            className={`relative flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-200 active:scale-90
              ${(variant === 'dashboard' ? isMoreActive : isPublicMoreActive) ? 'text-primary' : 'text-base-content/40'}`}
          >
            <div className={`flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-300
              ${(variant === 'dashboard' ? isMoreActive : isPublicMoreActive) ? 'bg-primary/10' : 'bg-transparent'}`}>
              <HiDotsHorizontal className={`w-5 h-5 transition-transform duration-300 ${(variant === 'dashboard' ? isMoreActive : isPublicMoreActive) ? 'scale-110' : 'scale-100'}`} />
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300`}>
              Lainnya
            </span>
          </button>
        </div>
      </nav>

      <BottomSheet
        isOpen={showMore}
        onClose={() => setShowMore(false)}
        title="Menu Navigasi"
      >
        <div className="grid grid-cols-3 gap-4 py-4 px-2">
          {(variant === 'dashboard' ? dashboardMoreItems : publicItems).map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setShowMore(false)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95
                  ${active ? 'bg-primary/5 text-primary' : 'text-base-content/70 hover:bg-base-100'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                  ${active ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/60'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-center leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
};

export default BottomNav;