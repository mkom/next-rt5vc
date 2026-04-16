import axios from 'axios';
import PublicLayout from '../components/layouts/PublicLayout';
import Outstanding from '../components/IplOutstanding.js';

const DataOutstanding = ({ initialData, totalHouses, totalAmount, error }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">Data Tunggakan</h1>
        <p className="text-sm text-base-content/70 mt-1">Daftar warga yang belum menyelesaikan pembayaran IPL</p>
      </div>

      <Outstanding 
        initialData={initialData}
        totalHouses={totalHouses}
        totalAmount={totalAmount}
        serverError={error}
      />
    </div>
  );
};

DataOutstanding.getLayout = (page) => (
  <PublicLayout title="Tunggakan IPL" description="Outstanding IPL RT05/RW11 Villa Citayam Susukan Bojong gede Bogor">
    {page}
  </PublicLayout>
);

export const getServerSideProps = async (context) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  
  if (!apiUrl) {
    console.error('[getServerSideProps] ERROR: API_URL not configured');
    return {
      props: {
        initialData: [],
        totalHouses: 0,
        totalAmount: 0,
        error: 'Konfigurasi API tidak ditemukan',
      },
    };
  }

  try {
    const res = await axios.get(`${apiUrl}/houses/outstanding`, {
      timeout: 10000, // 10 seconds timeout
    });
    
    // Handle multiple response formats
    let items = [];
    let total = 0;
    let totalAmount = 0;
    
    if (Array.isArray(res.data)) {
      // Format: Array langsung
      items = res.data;
      total = items.length;
      totalAmount = items.reduce((sum, item) => sum + (item.total_fee || 0), 0);
    } else if (res.data && Array.isArray(res.data.data)) {
      // Format: { data: [...], total, total_amount }
      items = res.data.data;
      total = res.data.total ?? items.length;
      totalAmount = res.data.total_amount ?? items.reduce((sum, item) => sum + (item.total_fee || 0), 0);
    } else {
      throw new Error('Invalid response structure: expected array or { data: [...] }');
    }
    
    return {
      props: {
        initialData: items,
        totalHouses: total,
        totalAmount: totalAmount,
        error: null,
      },
    };
  } catch (error) {
    console.error('[getServerSideProps] Error fetching outstanding data:', error.message);
    return {
      props: {
        initialData: [],
        totalHouses: 0,
        totalAmount: 0,
        error: error.message || 'Gagal mengambil data dari server',
      },
    };
  }
};

export default DataOutstanding;
