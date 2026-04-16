import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import moment from 'moment';
import Link from 'next/link';
import { HiHome, HiExclamationCircle, HiSearch, HiSortDescending, HiSortAscending, HiRefresh } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { GrMoney } from "react-icons/gr";
import { formatCurrency } from '../utils/format';
import Pagination from './ui/Pagination';
import { ITEMS_PER_PAGE } from '../utils/constants';

/**
 * Error State Component
 * Menampilkan pesan error dengan tombol retry
 */
const ErrorState = ({ message, onRetry, retryCount }) => (
  <div className="app-card p-8 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
      <HiExclamationCircle className="w-8 h-8" />
    </div>
    <p className="text-base-content font-extrabold text-lg mb-2">Gagal Memuat Data</p>
    <p className="text-sm text-base-content/60 mb-6 max-w-[280px] mx-auto">{message || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}</p>
    <button 
      onClick={onRetry}
      disabled={retryCount >= 3}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all
        ${retryCount >= 3 
          ? 'bg-base-300 text-base-content/40 cursor-not-allowed' 
          : 'bg-primary text-primary-content hover:bg-primary/90 active:scale-95'}`}
    >
      <HiRefresh className="w-4 h-4" />
      {retryCount >= 3 ? 'Silakan refresh halaman' : 'Coba Lagi'}
    </button>
    {retryCount > 0 && retryCount < 3 && (
      <p className="text-[10px] text-base-content/40 mt-3">Percobaan ke-{retryCount} dari 3</p>
    )}
  </div>
);

/**
 * Empty State Component
 * Menampilkan ketika tidak ada data tunggakan
 */
const EmptyState = () => (
  <div className="app-card p-12 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-4">
      <HiHome className="w-8 h-8" />
    </div>
    <p className="text-base-content font-extrabold text-lg">Tidak Ada Tunggakan</p>
    <p className="text-sm text-base-content/50 mt-1 max-w-[200px] mx-auto">Semua warga telah menyelesaikan iuran IPL dengan tepat waktu.</p>
  </div>
);

/**
 * Outstanding Component
 * Menampilkan daftar rumah dengan tunggakan IPL
 * 
 * @param {Object} props
 * @param {Array} props.initialData - Data awal dari SSR
 * @param {number} props.totalHouses - Total rumah dari SSR
 * @param {number} props.totalAmount - Total amount dari SSR
 * @param {string|null} props.serverError - Error dari SSR
 */
const Outstanding = ({ 
  initialData = [], 
  totalHouses: initialTotalHouses = 0, 
  totalAmount: initialTotalAmount = 0,
  serverError = null 
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [dataOutStanding, setDataOutStanding] = useState(initialData);
  const [totalHouses, setTotalHouses] = useState(initialTotalHouses);
  const [totalAmount, setTotalAmount] = useState(initialTotalAmount);
  const [error, setError] = useState(serverError);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount_desc'); // amount_desc, amount_asc, months_desc
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Fetch outstanding data from API
   * Handle multiple response formats for backward compatibility
   */
  const fetchOutstanding = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('Konfigurasi API tidak ditemukan');
      }

      const res = await axios.get(`${apiUrl}/houses/outstanding`, {
        timeout: 10000, // 10 seconds timeout
      });
      
      // Debug logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[fetchOutstanding] Response:', res.data);
      }
      
      // Handle multiple response formats
      let items = [];
      let total = 0;
      let calculatedTotalAmount = 0;
      
      if (Array.isArray(res.data)) {
        // Format: Array langsung
        items = res.data;
        total = items.length;
        calculatedTotalAmount = items.reduce((sum, item) => sum + (item.total_fee || 0), 0);
      } else if (res.data && Array.isArray(res.data.data)) {
        // Format: { data: [...], total, total_amount }
        items = res.data.data;
        total = res.data.total ?? items.length;
        calculatedTotalAmount = res.data.total_amount ?? items.reduce((sum, item) => sum + (item.total_fee || 0), 0);
      } else {
        console.error('[fetchOutstanding] Invalid response structure:', res.data);
        throw new Error('Struktur data tidak valid dari server');
      }
      
      // Validate required fields
      const validItems = items.filter(item => item && item.house_id);
      if (validItems.length !== items.length) {
        console.warn(`[fetchOutstanding] Filtered out ${items.length - validItems.length} items without house_id`);
      }
      
      setDataOutStanding(validItems);
      setTotalHouses(total);
      setTotalAmount(calculatedTotalAmount);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      console.error('[fetchOutstanding] Error:', err);
      setError(err.message || 'Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial data fetch - only if SSR failed or returned empty
   */
  useEffect(() => {
    // Only fetch client-side if SSR didn't provide data or there was an error
    if (initialData.length === 0 || serverError) {
      fetchOutstanding();
    }
  }, [fetchOutstanding, initialData.length, serverError]);

  /**
   * Handle retry button click
   */
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchOutstanding();
  }, [fetchOutstanding]);

  /**
   * Handle WhatsApp reminder
   * @param {string} houseId - House ID
   * @param {string} residentName - Resident name
   * @param {string} whatsappNumber - WhatsApp number
   * @param {number} amount - Total fee
   * @param {Array} periods - Array of period strings (YYYY-MM)
   */
  const handleWhatsAppReminder = useCallback((houseId, residentName, whatsappNumber, amount, periods) => {
    const periodLabels = periods.map(p => moment(p, 'YYYY-MM').format('MMM YYYY')).join(', ');
    const greeting = residentName ? `Halo Bapak/Ibu ${residentName}` : `Halo Bapak/Ibu Warga Blok ${houseId}`;
    const message = `${greeting}, sekadar mengingatkan untuk pembayaran IPL periode [${periodLabels}] sebesar ${formatCurrency(amount)}. Terima kasih.`;
    
    // Use specific WhatsApp number if available, otherwise use generic wa.me
    const phoneParam = whatsappNumber ? `/${whatsappNumber.replace(/^0/, '62')}` : '';
    window.open(`https://wa.me${phoneParam}?text=${encodeURIComponent(message)}`, '_blank');
  }, []);

  /**
   * Filter and sort data
   * CRITICAL FIX: Use house_id instead of house
   */
  const filteredAndSortedData = Array.isArray(dataOutStanding)
    ? dataOutStanding
        .filter(item => {
          if (!item) return false;
          // Search by house_id or resident_name
          const searchLower = searchTerm.toLowerCase();
          const matchHouseId = item.house_id && item.house_id.toLowerCase().includes(searchLower);
          const matchResidentName = item.resident_name && item.resident_name.toLowerCase().includes(searchLower);
          return matchHouseId || matchResidentName;
        })
        .sort((a, b) => {
          if (sortBy === 'amount_desc') return (b.total_fee || 0) - (a.total_fee || 0);
          if (sortBy === 'amount_asc') return (a.total_fee || 0) - (b.total_fee || 0);
          if (sortBy === 'months_desc') return (b.periods?.length || 0) - (a.periods?.length || 0);
          return 0;
        })
    : [];

  // Pagination logic
  const pageCount = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredAndSortedData.slice(offset, offset + ITEMS_PER_PAGE);

  /**
   * Handle page change
   * @param {number} selected - Selected page index (0-based)
   */
  const handlePageClick = useCallback((selected) => {
    setCurrentPage(selected);
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, sortBy]);

  // Show loading spinner only during client-side fetch (not SSR)
  if (loading && dataOutStanding.length === 0) {
    return <Spinner />;
  }

  // Show error state if there's an error and no data
  if (error && dataOutStanding.length === 0) {
    return <ErrorState message={error} onRetry={handleRetry} retryCount={retryCount} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='app-card p-4 bg-warning/5 border border-warning/20 flex flex-col justify-center items-center text-center'>
          <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-2">
             <HiHome className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-base-content/60 font-bold uppercase mb-0.5">Rumah Menunggak</p>
          <span className='font-extrabold text-lg text-warning'>{totalHouses} Unit</span>
        </div>
        <div className='app-card p-4 bg-error/5 border border-error/20 flex flex-col justify-center items-center text-center'>
          <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center mb-2">
             <GrMoney className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-base-content/60 font-bold uppercase mb-0.5">Total Tunggakan</p>
          <span className='font-extrabold text-lg text-error'>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col gap-3 mt-1">
          <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40">
                  <HiSearch className="w-5 h-5" />
              </div>
              <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nomor blok atau nama..." 
                  className="app-input pl-11 w-full"
              />
          </div>
          
          <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-[10px] font-bold text-base-content/40 uppercase whitespace-nowrap mr-1">Urutkan:</span>
              <button 
                  onClick={() => setSortBy('amount_desc')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap flex items-center gap-1
                    ${sortBy === 'amount_desc' ? 'bg-primary border-primary text-primary-content' : 'bg-base-100 border-base-200 text-base-content/60'}`}
              >
                  Nominal Tertinggi <HiSortDescending className="w-3 h-3" />
              </button>
              <button 
                  onClick={() => setSortBy('months_desc')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap flex items-center gap-1
                    ${sortBy === 'months_desc' ? 'bg-primary border-primary text-primary-content' : 'bg-base-100 border-base-200 text-base-content/60'}`}
              >
                  Bulan Terlama <HiSortDescending className="w-3 h-3" />
              </button>
              <button 
                  onClick={() => setSortBy('amount_asc')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap flex items-center gap-1
                    ${sortBy === 'amount_asc' ? 'bg-primary border-primary text-primary-content' : 'bg-base-100 border-base-200 text-base-content/60'}`}
              >
                  Nominal Terendah <HiSortAscending className="w-3 h-3" />
              </button>
          </div>
      </div>

      {/* List Layout */}
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between px-1 mb-1">
          <h3 className="text-sm font-bold text-base-content uppercase tracking-wider">Rincian Per Rumah</h3>
          <span className="text-[10px] font-bold bg-base-200 text-base-content/50 px-2 py-1 rounded-full">
            {filteredAndSortedData.length} Hasil
          </span>
        </div>

        {currentPageData.length > 0 ? (
          currentPageData.map((data, index) => (
            <div key={data._id || index} className="app-card p-4 flex flex-col gap-4 border-l-4 border-l-error">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-base-200 flex items-center justify-center font-bold text-sm shrink-0 text-primary">
                    {data.house_id}
                  </div>
                  <div>
                    <Link 
                      href={`/ipl/${data.house_id.toLowerCase()}`} 
                      className="text-base font-extrabold text-base-content hover:text-primary transition-colors block"
                    >
                      Blok {data.house_id}
                    </Link>
                    {/* Tampilkan nama penghuni jika tersedia */}
                    {data.resident_name && (
                      <p className="text-[11px] text-base-content/60 font-medium">{data.resident_name}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-error px-1.5 py-0.5 bg-error/10 rounded">
                           {data.periods?.length || 0} BULAN
                        </span>
                        <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-tight">Menunggak</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-base-content/40 tracking-wider mb-0.5">Tagihan</p>
                  <p className="text-base font-extrabold text-error">{formatCurrency(data.total_fee)}</p>
                </div>
              </div>
              
              {/* Period List */}
              <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(data.periods) && data.periods.map((period, subindex) => (
                      <span key={subindex} className="px-2 py-1 rounded-lg bg-base-200 text-base-content/70 text-[10px] font-bold">
                        {moment(period, 'YYYY-MM').format('MMM YY')}
                      </span>
                    ))}
                  </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-base-100 flex gap-2">
                  <Link 
                    href={`/ipl/${data.house_id.toLowerCase()}`} 
                    className="flex-1 py-2 rounded-xl bg-base-200 text-base-content font-bold text-[11px] text-center active:scale-95 transition-transform"
                  >
                      Lihat Detail
                  </Link>
                  <button 
                    onClick={() => handleWhatsAppReminder(
                      data.house_id, 
                      data.resident_name, 
                      data.whatsapp_number,
                      data.total_fee, 
                      data.periods
                    )}
                    className="flex-1 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                      <FaWhatsapp className="w-3.5 h-3.5" /> Ingatkan
                  </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        pageCount={pageCount}
        currentPage={currentPage}
        onPageChange={handlePageClick}
      />

      <div className="bg-base-200/50 rounded-2xl p-4 flex gap-3 text-sm mt-4 border border-base-300">
        <HiExclamationCircle className="w-6 h-6 text-base-content/30 shrink-0" />
        <div>
          <p className="font-bold text-base-content/80 mb-1 uppercase text-[10px] tracking-widest">Informasi Penting</p>
          <p className="text-base-content/60 text-[11px] leading-relaxed">
            Data tunggakan ditarik secara real-time dari sistem iuran RT 005. Perhitungan dimulai sejak periode Juli 2024.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Outstanding;
