import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Spinner from './Spinner';
import { IoCloseCircle, IoCheckmarkDoneCircleSharp, IoBookmark } from "react-icons/io5";
import { HiInformationCircle, HiHome } from "react-icons/hi";
import { GrFormNextLink } from "react-icons/gr";
import { TbCirclePercentage } from "react-icons/tb";
import { MdOutlineDownload } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import Link from 'next/link';
import Select from 'react-select';
import moment from 'moment';

import MonthOptions from './MonthOptions';
import Pagination from './ui/Pagination';
import { formatDate } from '../utils/format';
import { getPaymentStatusIcon } from '../utils/statusIcons';
import { ZONE_OPTIONS, STATUS_IPL_OPTIONS, ITEMS_PER_PAGE } from '../utils/constants';
import { selectStyles } from '../utils/selectStyles';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const zoneOptions = ZONE_OPTIONS.map((o, i) => i === 0 ? { ...o, label: 'Semua' } : o);
const statusOptions = STATUS_IPL_OPTIONS.map((o, i) => i === 0 ? { ...o, label: 'Semua' } : o);

const IplReport = ({ initialHouses }) =>  {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));
  const [houses, setHouses] = useState(initialHouses ?? []);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [skeleton, setSkeleton] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const { period } = router.query;
    if (period) {
        setSelectedPeriod(period);
    }
  }, [router.query]);

  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    const query = selectedOption?.value || '';
    const queryObj = { ...router.query };

    router.push({
        pathname: '/ipl',
        query: { ...queryObj, period: query},
    });
    setCurrentPage(0);
  };

  const handleSearchChange = (event) => {
    setCurrentPage(0);
    setSearchTerm(event.target.value);
  };

  const fetchHouses = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl`);
      setHouses(res.data.data);
      setLoading(false);
      setSkeleton(false);
    } catch (error) {
      console.error('Error fetching houses data:', error);
      setLoading(false);
      setSkeleton(false);
    }
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [selectedPeriod, selectedGroup, fetchHouses]);

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption.value);
    setCurrentPage(0);
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption.value);
    setCurrentPage(0);
  };

  const filteredHouses = Array.isArray(houses)
  ? houses.filter(house => {
      const searchTermLower = searchTerm.toLowerCase();
      const selectedGroupLower = selectedGroup.toLowerCase();
      const monthlyStatus =  house && house.monthly_status && house.monthly_status.find(status => status.month === selectedPeriod);

      return (
        (searchTermLower === '' || (
          house?.resident_name?.toLowerCase().includes(searchTermLower) ||
          house?.house_id?.toLowerCase().includes(searchTermLower)
        )) &&
        (selectedGroupLower === '' || house?.group?.toLowerCase() === selectedGroupLower) &&
        (selectedStatus === '' || house.monthly_fees.find(status => status.month === selectedPeriod)?.status === selectedStatus) &&
        ( house && house.monthly_fees?.length > 0 && house.monthly_status?.length > 0) &&
        monthlyStatus && (monthlyStatus.status === 'Isi' || monthlyStatus.status === 'Weekend' )
      );
    })
  : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);

  const CountHouses = Array.isArray(houses)
  ? houses.filter(house => {
      const searchTermLower = searchTerm.toLowerCase();
      const selectedGroupLower = selectedGroup.toLowerCase();
      const monthlyStatus =  house && house.monthly_status && house.monthly_status.find(status => status.month === selectedPeriod);

      return (
        (searchTermLower === '' || (
          house?.resident_name?.toLowerCase().includes(searchTermLower) ||
          house?.house_id?.toLowerCase().includes(searchTermLower)
        )) &&
        (selectedGroupLower === '' || house?.group?.toLowerCase() === selectedGroupLower) &&
        ( house && house.monthly_fees?.length > 0 && house.monthly_status?.length > 0) &&
        monthlyStatus && (monthlyStatus.status === 'Isi' || monthlyStatus.status === 'Weekend' )
      );
    })
  : [];

  const monthlyStatusCount = CountHouses.reduce((acc, house) => {
    if (!house || !house.monthly_fees) return acc;
    const month = house.monthly_fees?.find((status) => status.month === selectedPeriod)?.month;
    if (month) {
      acc[month] = acc[month] || { Lunas: 0, BelumBayar: 0, Tbd: 0, Isi:0, Weekend: 0 };
      const status = house.monthly_fees.find((status) => status.month === selectedPeriod)?.status;
      if (status === 'Lunas') acc[month].Lunas++;
      else if (status === 'Belum Bayar') acc[month].BelumBayar++;
      else if (status === 'TBD') acc[month].Tbd++;

      const Mstatus = house.monthly_status.find((status) => status.month === selectedPeriod)?.status;
      if (Mstatus === 'Isi') acc[month].Isi++;
      else if (Mstatus === 'Weekend') acc[month].Weekend++;
    }
    acc.total = acc.total || 0;
    acc.regular =  acc[month]?.Isi || 0;
    acc.weekend =  acc[month]?.Weekend || 0;
    acc.total++;
    acc.Tertib = (acc[month]?.Lunas || 0) + (acc[month]?.Tbd || 0);
    acc.TertibPercentage = acc.total > 0 ? (acc.Tertib / acc.total) * 100 : 0;
    return acc;
  }, {});

  const formatPercentage = (value) => (isNaN(value) ? '0.00%' : (value || 0).toFixed(2) + '%');


  const generatePDF = () => {
    // PDF generation logic remains unchanged
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const today = new Date();
    const currentDay = today.getDate();

    const docDefinition = {
      content: [
      { text: `Laporan IPL RT 005 RW 011 Periode ${moment(selectedPeriod, 'YYYY-MM').format('MMMM YYYY')}`, style: 'header' },
      { text: `Tanggal: ${formattedDate} ${formattedTime} WIB`, style: 'content' },
      {
        columns: [
        { text: `Lunas: ${monthlyStatusCount?.Tertib || 0}`, style: 'subheader' },
        { text: `Belum Bayar: ${monthlyStatusCount[selectedPeriod]?.BelumBayar || 0}`, style: 'subheader' },
        { text: `Persentase: ${formatPercentage(monthlyStatusCount?.TertibPercentage)}`, style: 'subheader' }
        ]
      },
      {
        table: {
        widths: ['auto', 'auto', '*', 'auto', 'auto'],
        body: [
          ['No', 'No Rumah', 'Nama', 'Status', 'Tanggal'],
          ...filteredHouses.map((data, index) => {
            let status = data.monthly_fees.find((status) => status.month === selectedPeriod)?.status;
            const statusStyle = status === 'Belum Bayar' ? { color: 'red' } : status === 'Bayar Sebagian' ? { color: 'orange' } : {};
            return [
            offset + index + 1,
            { text: data.house_id },
            data.resident_name,
            { text: status || '-', style: statusStyle },
            data.monthly_fees.find((status) => status.month === selectedPeriod)?.transaction_id?.date ? formatDate(data.monthly_fees.find((status) => status.month === selectedPeriod)?.transaction_id?.date) : '-',
            ];
          }),
        ]
        },
        layout: 'lightHorizontalLines'
      }
      ],
      styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
      content: { fontSize: 12, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, italics: true, margin: [0, 0, 0, 10] }
      }
    };
    const timestamp = moment().format('YYYYMMDD_HHmmss');
    pdfMake.createPdf(docDefinition).download(`IPL_Report_RT005_RW011_Period_${moment(selectedPeriod, 'YYYY-MM').format('MMMM_YYYY')}_${timestamp}.pdf`);
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">

      {/* Progress & Summary Dashboard */}
      {!skeleton && (
          <div className="app-card p-5 bg-primary/5 border border-primary/20">
             <div className="flex justify-between items-end mb-3">
                <div>
                   <p className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider mb-1">Progress Penagihan</p>
                   <div className="flex items-baseline gap-2">
                       <h3 className="text-3xl font-extrabold text-primary leading-none tracking-tight">{formatPercentage(monthlyStatusCount?.TertibPercentage)}</h3>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider mb-1">Terkumpul</p>
                   <p className="text-sm font-extrabold text-base-content">{monthlyStatusCount?.Tertib || 0} <span className="text-base-content/40">/ {monthlyStatusCount?.total || 0}</span></p>
                </div>
             </div>
             
             {/* Progress Bar */}
             <div className="w-full bg-base-300/60 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: formatPercentage(monthlyStatusCount?.TertibPercentage) }}
                ></div>
             </div>
             
             {/* Mini Stats Grid */}
             <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-primary/10">
                 <div className="text-center">
                     <p className="text-lg font-extrabold text-success">{monthlyStatusCount?.Tertib || 0}</p>
                     <p className="text-[9px] font-bold text-base-content/60 uppercase tracking-wider">Lunas</p>
                 </div>
                 <div className="text-center border-l border-primary/10">
                     <p className="text-lg font-extrabold text-error">{monthlyStatusCount[selectedPeriod]?.BelumBayar || 0}</p>
                     <p className="text-[9px] font-bold text-base-content/60 uppercase tracking-wider">Belum</p>
                 </div>
                 <div className="text-center border-l border-primary/10">
                     <p className="text-lg font-extrabold text-base-content/80">{monthlyStatusCount?.regular || 0}</p>
                     <p className="text-[9px] font-bold text-base-content/60 uppercase tracking-wider">Reguler</p>
                 </div>
                 <div className="text-center border-l border-primary/10">
                     <p className="text-lg font-extrabold text-base-content/80">{monthlyStatusCount?.weekend || 0}</p>
                     <p className="text-[9px] font-bold text-base-content/60 uppercase tracking-wider">Weekend</p>
                 </div>
             </div>
          </div>
      )}

      {/* Controls: Search & Filters */}
      <div className="flex flex-col gap-3 mt-1">
          <div className="flex gap-2">
              <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40">
                      <FaSearch className="w-4 h-4" />
                  </div>
                  <input 
                      type="text" 
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Cari nama blok atau nama warga..." 
                      className="app-input pl-10 py-3 w-full"
                  />
              </div>
              <button onClick={generatePDF} className="app-btn w-auto px-4 bg-error text-error-content shadow-md hover:bg-error/90 flex items-center gap-2" title="Unduh Laporan PDF">
                  <MdOutlineDownload className="w-5 h-5" />
                  <span className="font-bold text-sm">PDF</span>
              </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
              <Select
                id="relatedMonths"
                options={MonthOptions()}
                value={MonthOptions().find(option => option.value === selectedPeriod)}
                onChange={handleMonthChange}
                isSearchable={false}
                placeholder="Bulan"
                className="rounded-xl text-sm font-medium"
                styles={selectStyles}
              />
              <Select
                id="group"
                options={zoneOptions}
                value={zoneOptions.find(option => option.value === selectedGroup)}
                onChange={handleGroupChange}
                isSearchable={false}
                placeholder="Zona"
                className="rounded-xl text-sm"
                styles={selectStyles}
              />
              <Select
                id="status"
                options={statusOptions}
                value={statusOptions.find(option => option.value === selectedStatus)}
                onChange={handleStatusChange}
                isSearchable={false}
                placeholder="Status"
                className="rounded-xl text-sm"
                styles={selectStyles}
              />
          </div>
      </div>

      {/* Mobile App List Style instead of Table */}
      {skeleton ? (
        <div className="animate-pulse flex flex-col gap-3 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="app-card p-4 flex gap-3">
               <div className="w-10 h-10 bg-base-300 rounded-full"></div>
               <div className="flex-1">
                 <div className="h-4 w-24 bg-base-300 rounded mb-2"></div>
                 <div className="h-3 w-32 bg-base-300 rounded"></div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          {currentPageData && currentPageData.length > 0 ? (
            currentPageData.map((house, index) => {
              const monthStatus = house.monthly_fees.find((s) => s.month === selectedPeriod);
              const statusStr = monthStatus?.status;
              const isWeekend = house.monthly_status.find((status) => status.month === selectedPeriod)?.status === 'Weekend';

              // Use outstanding_count and future_count from backend
              const outstanding_count = house.outstanding_count || 0;
              const future_count = house.future_count || 0;

              // Status Styling
              let statusBadge = "bg-base-200 text-base-content/60";
              let statusText = "-";

              if (statusStr === 'Lunas') {
                statusBadge = "bg-success/10 text-success";
                statusText = "Lunas";
              } else if (statusStr === 'Belum Bayar') {
                statusBadge = "bg-error/10 text-error";
                statusText = "Belum Bayar";
              } else if (statusStr === 'TBD') {
                statusBadge = "bg-warning/10 text-warning";
                statusText = "TBD";
              }

              return (
                <Link
                  href={`/ipl/${house.house_id.toLowerCase()}`}
                  key={index}
                  className={`app-card p-4 flex items-center justify-between active:bg-base-200/50 transition-colors ${isWeekend ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                      ${isWeekend ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                      {house.house_id.split('-')[1] || house.house_id}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-bold text-base-content line-clamp-1">{house.resident_name}</p>
                        {isWeekend && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-md">W</span>}
                      </div>
                      <p className="text-[11px] text-base-content/60">
                        Blok {house.house_id}
                        {outstanding_count != 0 && (
                          <sup className='ml-1 text-red-400 font-bold'>-{outstanding_count}</sup>
                        )}
                        {future_count != 0 && (
                          <sup className='ml-1 text-blue-400 font-bold'>+{future_count}</sup>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                     <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}`}>
                        {statusText}
                     </div>
                     {statusStr === 'Lunas' && monthStatus?.transaction_id?.date && (
                       <p className="text-[9px] text-base-content/40 font-medium">
                         {formatDate(monthStatus.transaction_id.date)}
                       </p>
                     )}
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="app-card p-8 flex flex-col items-center justify-center text-center">
               <p className="text-base-content/50 font-medium">Data tidak ditemukan.</p>
               <p className="text-sm text-base-content/40 mt-1">Coba ganti filter periode atau kata kunci pencarian.</p>
            </div>
          )}
        </div>
      )}

      {!skeleton && (
        <>
          <div className="mt-2">
            <Pagination
              pageCount={Math.ceil(filteredHouses.length / ITEMS_PER_PAGE)}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Link href="/outstanding" className="flex items-center justify-center gap-2 w-full py-3.5 bg-error/10 text-error font-bold text-sm rounded-xl active:scale-95 transition-transform">
              Lihat Data Tunggakan Warga
              <GrFormNextLink className="w-5 h-5" />
            </Link>

            <div className="bg-base-200/50 rounded-xl p-4 flex gap-3 text-sm">
              <HiInformationCircle className="w-5 h-5 text-base-content/50 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-base-content/80 mb-1">Catatan Penting</p>
                <p className="text-base-content/60 text-xs leading-relaxed">
                  IPL RT 005 tercatat dan terhitung mulai dari Juli 2024. Apabila terdapat kekeliruan data, mohon hubungi pengurus RT.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const getServerSideProps = async (context) => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl`);
        return { props: { initialHouses: res.data.data } };
    } catch (error) {
        return { props: { initialHouses: [] } };
    }
  };

export default IplReport;
