import PublicLayout from '../components/layouts/PublicLayout';
import Tbd from '../components/IplTbd.js';

const DataTbd = () => {
  return (
    <section>
      <h1 className='text-xl mb-4 font-bold sm:text-2xl'>TBD IPL <span className='font-normal text-sm'>(data ipl masih di rek. Paguyuban)</span></h1>
      <Tbd />
    </section>
  );
};

DataTbd.getLayout = (page) => (
  <PublicLayout title="TBD IPL" description="Laporan IPL RT05/RW11 Villa Citayam Susukan Bojong gede Bogor">
    {page}
  </PublicLayout>
);

export default DataTbd;
