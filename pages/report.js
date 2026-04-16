import PublicLayout from '../components/layouts/PublicLayout';
import Report from '../components/Report';
import { FaWpforms, FaRegNewspaper, FaTasks } from "react-icons/fa";
import Link from 'next/link';

export default function Home() {
  return (
    <section>
      <div className='flex items-start md:items-center flex-col md:flex-row content-start md:content-center mb-4 justify-between gap-2'>
        <h1 className='text-xl font-bold sm:text-2xl text-base-content'>LAPORAN KEUANGAN RT 05 VILLA CITAYAM</h1>
      </div>

      <Report />

      <div className='flex flex-row justify-between md:justify-start gap-2 mb-14'>
        <Link href="/confirmation" className='btn btn-sm btn-outline btn-primary'>
          <FaWpforms className='w-4 h-4' />
          <span>Konfirmasi</span>
        </Link>
        <Link href="/ipl" className='btn btn-sm btn-outline btn-success'>
          <FaTasks className='w-4 h-4' />
          <span>IPL</span>
        </Link>
        <Link href="/outstanding" className='btn btn-sm btn-outline btn-error'>
          <FaRegNewspaper className='w-4 h-4' />
          <span>Outstanding</span>
        </Link>
      </div>
    </section>
  );
}

Home.getLayout = (page) => (
  <PublicLayout title="Laporan Keuangan" description="Laporan Keuangan RT05/RW11 Villa Citayam Susukan Bojong gede Bogor">
    {page}
  </PublicLayout>
);
