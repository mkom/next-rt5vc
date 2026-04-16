import PublicLayout from '../components/layouts/PublicLayout';
import History from '@/components/History.js';

const HistoryPage = () => {
  return (
    <>
      <h1 className='text-xl mb-4 font-bold'>Riwayat Transfer</h1>
      <History/>
    </>
  );
};

HistoryPage.getLayout = (page) => (
  <PublicLayout title="Riwayat Transfer IPL" description="Riwayat Transfer IPL RT05/RW11 Villa Citayam Susukan Bojong gede Bogor">
    {page}
  </PublicLayout>
);

export default HistoryPage;
