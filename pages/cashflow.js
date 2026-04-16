import PublicLayout from '../components/layouts/PublicLayout';
import AllCashflow from '@/components/Cashflow';
import { HiHome } from "react-icons/hi";

const Transactions = () => {
  return (
    <>
      <div className="breadcrumbs text-sm mb-3">
        <ul>
          <li><a href="/"><HiHome className="h-4 w-4 inline mr-1" />Home</a></li>
          <li>Cashflow</li>
        </ul>
      </div>
      <h1 className='text-xl mb-4 font-bold'>Laporan Arus Kas</h1>
      <AllCashflow/>
    </>
  );
};

Transactions.getLayout = (page) => (
  <PublicLayout title="Laporan Arus Kas" description="Laporan Arus Kas RT05/RW11 Villa Citayam Susukan Bojong gede Bogor">
    {page}
  </PublicLayout>
);

export default Transactions;
