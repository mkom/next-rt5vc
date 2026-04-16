import PublicLayout from '@/components/layouts/PublicLayout';

export default function SetorRw() {
  return (
    <section>
      <div className='flex items-start md:items-center flex-col md:flex-row content-start md:content-center mb-4 justify-between gap-2'>
        <h1 className='text-xl font-bold sm:text-2xl'>Laporan Setor RW Semester 2 2025, RT 005 Villa Citayam</h1>
      </div>
    </section>
  );
}

SetorRw.getLayout = (page) => (
  <PublicLayout title="Setor RW" description="Laporan Setor RW RT05/RW11 Villa Citayam">
    {page}
  </PublicLayout>
);
