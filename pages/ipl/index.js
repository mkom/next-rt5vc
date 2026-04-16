import PublicLayout from '../../components/layouts/PublicLayout';
import IplReport from '../../components/IplReport.js';

const Ipl = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">Data Rekap IPL</h1>
        <p className="text-sm text-base-content/70 mt-1">Pantau status pembayaran iuran bulanan warga RT 005</p>
      </div>
      <IplReport/>
    </div>
  );
};

Ipl.getLayout = (page) => (
  <PublicLayout title="Laporan IPL" description="Laporan IPL RT05/RW 11 Villa Citayam Susukan Bojong gede Bogor">
    {page}
  </PublicLayout>
);

export default Ipl;
