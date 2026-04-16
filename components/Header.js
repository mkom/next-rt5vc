import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { HiChevronLeft } from 'react-icons/hi';
import Image from 'next/image';
import GoogleIcon from './ui/GoogleIcon';

/**
 * Header Component - Green Theme
 * Uses RT5VC logo and green color palette
 */
const Header = ({ title, showBack }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentPath = router.asPath;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14 lg:max-w-4xl lg:mx-auto lg:px-6">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-green-50 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              aria-label="Kembali ke halaman sebelumnya"
            >
              <HiChevronLeft className="w-6 h-6 text-green-800" />
            </button>
          ) : (
            <a 
              href="/" 
              className="flex items-center gap-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded-lg"
              aria-label="Beranda RT 005"
            >
              {/* Logo Container */}
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-green-100 flex items-center justify-center overflow-hidden">
                <Image
                  src="/rt5vc.png"
                  alt="RT 005"
                  width={40}
                  height={40}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-lg font-bold text-green-800 tracking-tight hidden xs:block">
                RT 005
              </span>
            </a>
          )}

          {title && (
            <h1 className="text-base font-bold text-green-900 truncate pr-4">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {session ? (
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost btn-circle avatar hover:bg-green-50 transition-colors w-9 h-9 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label={`Menu pengguna ${session.user?.name || ''}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-200 shadow-sm">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      referrerPolicy="no-referrer" 
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <div className="bg-green-100 text-green-700 flex items-center justify-center w-full h-full text-sm font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-white rounded-2xl w-64 p-2 shadow-xl border border-green-100 mt-2">
                <li className="px-4 py-3 pointer-events-none border-b border-green-50 mb-1">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-green-900 leading-tight">{session.user?.name}</p>
                    <p className="text-xs text-green-600/70 truncate">{session.user?.email}</p>
                  </div>
                </li>
                <li>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })} 
                    className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-medium text-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Keluar
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}${currentPath}` })}
              className="btn bg-white border border-green-200 text-green-800 hover:bg-green-50 btn-sm gap-2 h-9 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              aria-label="Masuk dengan Google"
            >
              <GoogleIcon />
              <span className="hidden xs:inline text-xs font-semibold">Masuk</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
