import { signIn } from 'next-auth/react';
import GoogleIcon from './ui/GoogleIcon';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaMoneyBillWave, FaHistory, FaCheckCircle, FaShieldAlt, FaExclamationTriangle, FaLock } from 'react-icons/fa';

/**
 * SplashPage with Session Expiry and Access Denied Handling
 * 
 * Features:
 * - Detects session expiry via query param ?expired=true
 * - Detects access denied via query param ?access_denied=true
 * - Shows different copytext for expired vs access denied vs new sessions
 * - Responsive: 2-column desktop, 1-column mobile
 * - Clean, minimal design focused on conversion
 */
const SplashPage = () => {
  const router = useRouter();
  const { expired, access_denied } = router.query;
  const isSessionExpired = expired === 'true';
  const isAccessDenied = access_denied === 'true';
  
  const currentPath = router.asPath;
  
  const handleLogin = () => {
    signIn('google', { 
      callbackUrl: `${window.location.origin}${currentPath}`,
    });
  };

  // Content variants based on state
  const getContent = () => {
    if (isAccessDenied) {
      return {
        headline: 'Akses Ditolak',
        subheadline: 'Anda tidak memiliki izin untuk mengakses halaman admin. Halaman ini hanya untuk administrator.',
        cta: 'Kembali ke Beranda',
        ctaAria: 'Kembali ke halaman utama',
        showAlert: true,
        alertIcon: FaLock,
        alertClass: 'border-error-200 bg-error-50 text-error-800',
        alertText: 'Akses ditolak • Hanya untuk admin',
        trustText: 'Keamanan terjaga',
        isError: true,
      };
    }
    
    if (isSessionExpired) {
      return {
        headline: 'Session Berakhir',
        subheadline: 'Session Anda telah habis. Silakan login ulang untuk melanjutkan mengakses sistem keuangan RT 005.',
        cta: 'Login Ulang',
        ctaAria: 'Login ulang dengan akun Google',
        showAlert: true,
        alertIcon: FaExclamationTriangle,
        alertClass: 'border-amber-200 bg-amber-50 text-amber-800',
        alertText: 'Session telah berakhir • Login ulang diperlukan',
        trustText: 'Keamanan terjaga',
        isError: false,
      };
    }
    
    return {
      headline: 'Sistem Keuangan Warga RT 005',
      subheadline: 'Pantau kas, konfirmasi IPL, dan riwayat transaksi dalam satu akses terpercaya.',
      cta: 'Mulai Sekarang',
      ctaAria: 'Masuk dengan akun Google untuk mengakses sistem RT 005',
      showAlert: false,
      alertIcon: null,
      alertClass: '',
      alertText: '',
      trustText: 'Aman & Terverifikasi',
      isError: false,
    };
  };

  const content = getContent();
  const AlertIcon = content.alertIcon;

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop: 2-column grid | Mobile: 1-column stack */}
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        
        {/* Left Column: Content */}
        <main className="flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-0">
          <div className="mx-auto w-full max-w-md">
            
            {/* Logo */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <div className="rounded-2xl border border-green-100 bg-white p-3 shadow-lg">
                <Image
                  src="/rt5vc.png"
                  alt="RT 005 Villa Citayam"
                  width={64}
                  height={64}
                  className="h-14 w-14 object-contain"
                  priority
                />
              </div>
            </div>

            {/* Access Denied / Session Expired Alert */}
            {content.showAlert && AlertIcon && (
              <div className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 ${content.alertClass}`}>
                <AlertIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium">{content.alertText}</span>
              </div>
            )}

            {/* Headline */}
            <h1 className={`mb-4 text-center text-3xl font-bold leading-tight tracking-tight lg:text-left lg:text-4xl ${
              content.isError ? 'text-error' : 'text-gray-900'
            }`}>
              {content.headline}
            </h1>

            {/* Subheadline */}
            <p className="mb-8 text-center text-base leading-relaxed text-gray-600 lg:text-left lg:text-lg">
              {content.subheadline}
            </p>

            {/* Feature Pills - Hide on access denied */}
            {!isAccessDenied && (
              <div className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-sm text-green-700">
                  <FaMoneyBillWave className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Kas Real-time</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-sm text-green-700">
                  <FaCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Konfirmasi IPL</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-sm text-green-700">
                  <FaHistory className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Riwayat</span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={isAccessDenied ? () => router.push('/') : handleLogin}
              className="group mb-4 flex w-full items-center justify-center gap-3 rounded-xl bg-green-700 px-6 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label={content.ctaAria}
            >
              {!isAccessDenied && <GoogleIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />}
              <span>{content.cta}</span>
            </button>

            {/* Trust Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 lg:justify-start">
              <FaShieldAlt className="h-4 w-4 text-green-600" aria-hidden="true" />
              <span>{content.trustText} untuk warga RT 005</span>
            </div>

            {/* Mobile: Show illustration below CTA - Hide on access denied */}
            {!isAccessDenied && (
              <div className="mt-10 flex justify-center lg:hidden">
                <div className="relative h-48 w-48">
                  <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
                    <circle cx="100" cy="100" r="80" fill="#E8F5E9" />
                    <rect x="60" y="80" width="80" height="60" rx="8" fill="#2E7D32" />
                    <rect x="70" y="90" width="60" height="8" rx="4" fill="white" />
                    <rect x="70" y="105" width="40" height="8" rx="4" fill="white" opacity="0.7" />
                    <rect x="70" y="120" width="50" height="8" rx="4" fill="white" opacity="0.5" />
                    <circle cx="150" cy="60" r="20" fill="#F9A825" opacity="0.8" />
                    <circle cx="40" cy="140" r="15" fill="#00838F" opacity="0.6" />
                  </svg>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-12 text-center text-xs text-gray-400 lg:text-left">
              <p>© {new Date().getFullYear()} RT 005 Villa Citayam</p>
            </footer>
          </div>
        </main>

        {/* Right Column: Illustration (Desktop only) - Hide on access denied */}
        {!isAccessDenied && (
          <div className="hidden items-center justify-center bg-green-50 lg:flex">
            <div className="relative p-12">
              {/* Abstract illustration */}
              <svg viewBox="0 0 400 400" className="h-80 w-80" aria-hidden="true">
                {/* Background circles */}
                <circle cx="200" cy="200" r="150" fill="#E8F5E9" />
                <circle cx="200" cy="200" r="120" fill="#C8E6C9" />
                
                {/* Dashboard card */}
                <rect x="100" y="120" width="200" height="160" rx="16" fill="#2E7D32" />
                <rect x="120" y="150" width="160" height="12" rx="6" fill="white" />
                <rect x="120" y="175" width="120" height="12" rx="6" fill="white" opacity="0.8" />
                <rect x="120" y="200" width="140" height="12" rx="6" fill="white" opacity="0.6" />
                <rect x="120" y="225" width="100" height="12" rx="6" fill="white" opacity="0.4" />
                
                {/* Decorative elements */}
                <circle cx="320" cy="100" r="30" fill="#F9A825" opacity="0.8" />
                <circle cx="80" cy="300" r="25" fill="#00838F" opacity="0.6" />
                <circle cx="340" cy="280" r="20" fill="#2E7D32" opacity="0.4" />
                
                {/* Check marks */}
                <circle cx="140" cy="280" r="15" fill="#4CAF50" />
                <path d="M133 280 L137 284 L145 276" stroke="white" strokeWidth="2" fill="none" />
                
                <circle cx="200" cy="300" r="15" fill="#4CAF50" />
                <path d="M193 300 L197 304 L205 296" stroke="white" strokeWidth="2" fill="none" />
                
                <circle cx="260" cy="280" r="15" fill="#4CAF50" />
                <path d="M253 280 L257 284 L265 276" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashPage;
