import { signIn } from 'next-auth/react';
import GoogleIcon from './ui/GoogleIcon';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaMoneyBillWave, FaHistory, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const SplashPage = () => {
  const router = useRouter();
  const currentPath = router.asPath;
  
  const handleLogin = () => {
    signIn('google', { 
      callbackUrl: `${window.location.origin}${currentPath}`,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#66bb6a_0%,#2e7d32_38%,#1b5e20_72%,#0d3b0e_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 right-[-6rem] h-60 w-60 rounded-full bg-white/10 blur-3xl md:h-80 md:w-80" />
        <div className="absolute left-[-7rem] top-[38%] h-72 w-72 rounded-full bg-teal-300/15 blur-3xl md:h-96 md:w-96" />
        <div className="absolute bottom-[-7rem] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-300/15 blur-3xl md:h-96 md:w-[32rem]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
      </div>

      <main className="relative z-10 min-h-screen px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-5 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-1.75rem)] max-w-5xl grid-cols-12 gap-y-4 md:min-h-[calc(100vh-2.25rem)] md:gap-y-5">
          <header className="animate-hero-enter col-span-12 flex flex-col items-center pt-2 text-center md:pt-4">
            <div className="rounded-[1.25rem] border border-white/35 bg-white/95 p-3 shadow-2xl shadow-black/10 backdrop-blur-sm md:p-4">
              <Image
                src="/rt5vc.png"
                alt="RT 005 Villa Citayam Logo"
                width={112}
                height={112}
                className="h-14 w-14 object-contain md:h-16 md:w-16 lg:h-20 lg:w-20"
                priority
              />
            </div>
            <div className="mt-3 space-y-1 md:mt-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-green-100/90 md:text-xs">
                RT 005 Villa Citayam
              </p>
              <h1 className="text-[clamp(2rem,6vw,3.6rem)] font-black leading-[0.95] tracking-[-0.04em] text-white text-balance">
                Akses Sistem
                <span className="block text-green-100">Keuangan Warga</span>
              </h1>
            </div>
          </header>

          <section className="col-span-12 flex flex-col justify-center md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
            <div className="space-y-4 text-center md:space-y-4">
              <div className="trust-pill mx-auto">
                <FaShieldAlt className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                <span className="text-[0.72rem] font-medium tracking-[0.02em] text-white/90 md:text-xs">
                  Akses aman untuk warga terverifikasi
                </span>
              </div>

              <p className="mx-auto max-w-lg text-[clamp(0.92rem,1.5vw,1.04rem)] leading-relaxed text-green-50/92 text-balance">
                Masuk untuk melihat laporan kas, konfirmasi pembayaran IPL, dan riwayat transaksi RT 005 dalam satu akses yang cepat dan terpercaya.
              </p>

              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3 md:gap-2.5">
                <div className="hero-feature-card px-3 py-2.5">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/20 text-amber-200">
                    <FaMoneyBillWave className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-white">Kas Real-time</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-green-100/80">Pantau ringkasan kas terbaru.</p>
                </div>

                <div className="hero-feature-card px-3 py-2.5">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/20 text-amber-200">
                    <FaCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-white">Konfirmasi IPL</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-green-100/80">Validasi pembayaran lebih cepat.</p>
                </div>

                <div className="hero-feature-card px-3 py-2.5">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/20 text-amber-200">
                    <FaHistory className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-white">Riwayat Warga</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-green-100/80">Lihat histori transaksi kapan saja.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="animate-card-enter col-span-12 self-end md:col-span-8 md:col-start-3 lg:col-span-4 lg:col-start-5">
            <div className="rounded-[1.5rem] border border-white/45 bg-white/96 p-4 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-5">
              <div className="mb-3 space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">
                  Masuk untuk melanjutkan
                </h2>
                <p className="text-sm leading-relaxed text-white">
                  Gunakan akun Google Anda untuk mengakses sistem keuangan RT 005 secara aman.
                </p>
              </div>

              <button
                onClick={handleLogin}
                className="w-full group flex min-h-[48px] items-center justify-center gap-3 rounded-2xl bg-green-700 px-5 py-3.5 text-[15px] font-semibold text-white shadow-green transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-green-lg active:translate-y-0 active:scale-[0.985] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Masuk dengan akun Google untuk mengakses sistem RT 005"
              >
                <GoogleIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span>Masuk dengan Google</span>
              </button>

              <div className="mt-3 grid grid-cols-1 gap-2 rounded-2xl bg-green-50 px-3 py-2.5 text-left sm:grid-cols-3 sm:text-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-700/75">Login</p>
                  <p className="mt-1 text-xs font-medium text-green-900">Google Sign-In</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-700/75">Status</p>
                  <p className="mt-1 text-xs font-medium text-green-900">Aman & Terverifikasi</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-700/75">Akses</p>
                  <p className="mt-1 text-xs font-medium text-green-900">Warga RT 005</p>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-white">
                Sistem tertutup untuk warga dan pengurus yang sudah terdaftar. Jika akses belum tersedia, hubungi pengurus RT.
              </p>
            </div>
          </section>

          <footer className="col-span-12 pt-0.5 text-center md:pt-1">
            <p className="text-xs text-green-100/80">
              © {new Date().getFullYear()} RT 005 Villa Citayam
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default SplashPage;
