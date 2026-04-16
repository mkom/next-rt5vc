import Head from 'next/head';
import Link from 'next/link';
import { FaWpforms, FaRegNewspaper, FaTasks, FaHistory, FaInfoCircle } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import Report from '../components/Report';
import PublicLayout from '../components/layouts/PublicLayout';

export default function Home() {
  return (
    <>
      <Head>
        <title>RT5VC - Laporan Keuangan</title>
        <meta name="description" content="Laporan Keuangan RT05/RW11 Villa Citayam Susukan Bojong gede Bogor" />
      </Head>

      <section className="flex flex-col gap-6">
        {/* Header Greeting */}
        <div className="pt-2 px-1">
          <h2 className="text-sm font-semibold text-base-content/60 tracking-wider uppercase mb-1">Selamat Datang di</h2>
          <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
            RT 005 / RW 011
          </h1>
          <p className="text-sm text-base-content/70 mt-1">Villa Citayam, Susukan</p>
        </div>

        {/* Hero Card / Announcement - Solid, clean, functional */}
        <div className="rounded-[24px] bg-primary p-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary-content mb-2">
            <FaInfoCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Informasi</span>
          </div>
          <h3 className="text-xl font-bold text-primary-content mb-1">
            Transparansi Keuangan
          </h3>
          <p className="text-primary-content text-sm mb-4 max-w-[90%]">
            Pantau laporan kas, iuran warga, dan mutasi secara real-time.
          </p>
          <Link href="/history" className="inline-flex items-center gap-2 bg-white text-primary text-sm font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-transform">
            Lihat Riwayat
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* App-like Grid Menu */}
        <div>
          <h3 className="text-sm font-bold text-base-content mb-3 px-1">Akses Cepat</h3>
          <div className="grid grid-cols-4 gap-3 lg:gap-6">
            <Link href="/ipl" className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-base-100 shadow-sm border border-base-200 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-content transition-colors">
                <FaTasks className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-[11px] lg:text-xs font-bold text-base-content/80 text-center">Data IPL</span>
            </Link>
            
            <Link href="/confirmation" className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-base-100 shadow-sm border border-base-200 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-content transition-colors">
                <FaWpforms className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-[11px] lg:text-xs font-bold text-base-content/80 text-center">Setor</span>
            </Link>
            
            <Link href="/outstanding" className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-base-100 shadow-sm border border-base-200 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-warning-content transition-colors">
                <FaRegNewspaper className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-[11px] lg:text-xs font-bold text-base-content/80 text-center">Tunggakan</span>
            </Link>

            <Link href="/history" className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-base-100 shadow-sm border border-base-200 flex items-center justify-center text-info group-hover:bg-info group-hover:text-info-content transition-colors">
                <FaHistory className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <span className="text-[11px] lg:text-xs font-bold text-base-content/80 text-center">Riwayat</span>
            </Link>
          </div>
        </div>

        {/* Financial Report List Wrapper */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-base-content tracking-tight">Ringkasan Kas</h3>
          </div>
          <div className="app-card p-4 overflow-hidden relative">
            <div className="relative z-10">
              <Report />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Home.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;
