import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import { FaCalendarCheck, FaHome, FaCheckCircle, FaTimesCircle, FaRegClock } from 'react-icons/fa';
import Select from 'react-select';
import { selectStyles } from '../../utils/selectStyles';
import YearOptions from '../../components/YearOptions.js';
import Image from "next/image";
import PublicLayout from '../../components/layouts/PublicLayout';
import { formatCurrency, formatDate } from '../../utils/format';
import moment from 'moment';

const IplDetail = () => {
  const { query } = useRouter();
  const id = query.id;
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY'));
  const [housesStatus, setHousesStatus] = useState([]);
  const [housesFee, setHousesFee] = useState([]);
  const [residentName, setResidentName] = useState('');
  const [outstandingCount, setOutstandingCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchHouses = useCallback(async () => {
    const ID = id.toUpperCase();
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${ID}`);
      setHousesStatus(res.data.data.monthly_status);
      setHousesFee(res.data.data.monthly_fees);
      setResidentName(res.data.data.resident_name);
      setOutstandingCount(res.data.data.outstanding_count);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching houses data:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchHouses();
  }, [id, fetchHouses]);

  const months = [
    { name: "Januari", number: "01" },
    { name: "Februari", number: "02" },
    { name: "Maret", number: "03" },
    { name: "April", number: "04" },
    { name: "Mei", number: "05" },
    { name: "Juni", number: "06" },
    { name: "Juli", number: "07" },
    { name: "Agustus", number: "08" },
    { name: "September", number: "09" },
    { name: "Oktober", number: "10" },
    { name: "November", number: "11" },
    { name: "Desember", number: "12" }
  ];

  const handleYearChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
  };

  function findFee(periodMonth) {
    return housesFee.find(item => item.month === periodMonth) || {};
  }

  function findFeeStatus(year, month) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const periodMonth = `${year}-${month.number}`;
    const feeData = findFee(periodMonth);

    if (!feeData.month) {
      return { status: "-", transactionDate: "-", proofOfTransfer: "-" };
    }
    if (periodMonth < "2024-07") {
      return { status: "-", transactionDate: "-", proofOfTransfer: "-", _id: "" };
    } else if (periodMonth > currentMonth && feeData.status === "Belum Bayar") {
      return { status: "-", transactionDate: "-", proofOfTransfer: "-", _id: "" };
    } else {
      const status = feeData.status;
      const period = moment(feeData.month, "YYYY-MM").format("MMMM YYYY");
      const transactionDate = feeData.transaction_id ? feeData.transaction_id.date : "-";
      const proofOfTransfer = feeData.transaction_id ? feeData.transaction_id.proof_of_transfer : "-";
      const paymentType = feeData.transaction_id ? feeData.transaction_id.payment_type : "-";
      const amount = feeData.transaction_id ? feeData.transaction_id.amount : feeData.fee;
      return { status, transactionDate, proofOfTransfer, paymentType, period, amount };
    }
  }

  function findStatus(selectedPeriod, month, dataStatus) {
    const periodMonth = `${selectedPeriod}-${month.number}`;
    const feeDataKosong = dataStatus.find(data => data.month === periodMonth);

    if (!feeDataKosong) {
      return { statusHouse: '-' };
    }
    if (feeDataKosong.status === "Kosong") {
      return { statusHouse: "Kosong" };
    }
    return { status: "Isi" };
  }

  const openModal = (selectedPeriod, month) => {
    const feeStatus = findFeeStatus(selectedPeriod, month);
    setSelectedDetail(feeStatus);
    setModalIsOpen(true);
    setLoadingImg(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDetail(null);
    setLoadingImg(false);
  };

  const handleImageLoad = () => {
    setLoadingImg(false);
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'Lunas': return { bg: 'bg-success/10', text: 'text-success', icon: <FaCheckCircle className="w-3 h-3"/>, label: 'Lunas' };
          case 'Belum Bayar': return { bg: 'bg-error/10', text: 'text-error', icon: <FaTimesCircle className="w-3 h-3"/>, label: 'Belum Bayar' };
          case 'TBD': return { bg: 'bg-warning/10', text: 'text-warning', icon: <FaRegClock className="w-3 h-3"/>, label: 'TBD' };
          default: return { bg: 'bg-base-200', text: 'text-base-content/50', icon: null, label: '-' };
      }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      {/* Header Identity */}
      <div className="app-card p-5 bg-primary text-primary-content relative overflow-hidden">
         <div className="relative z-10 flex items-start justify-between">
            <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-primary-content/70 mb-1">Detail Warga</p>
                <h1 className="text-2xl font-extrabold mb-0.5">{residentName || 'Warga'}</h1>
                <div className="flex items-center gap-1.5 text-primary-content/90 font-medium text-sm">
                    <FaHome className="w-4 h-4" />
                    <span>Blok {id && id.toUpperCase()}</span>
                </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold text-primary-content/80 mb-0.5">Tunggakan</p>
                <p className="text-lg font-extrabold leading-none">{outstandingCount}</p>
            </div>
         </div>
      </div>

      {/* Filter Year */}
      <div className="flex items-center gap-3 mt-2">
         <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 shrink-0">
             <FaCalendarCheck className="w-4 h-4" />
         </div>
         <div className="flex-1">
            {isClient && (
              <Select
                options={YearOptions()}
                value={YearOptions().find(option => option.label === selectedPeriod)}
                onChange={handleYearChange}
                isSearchable={false}
                placeholder="Pilih Tahun"
                className="w-full text-sm font-bold"
                styles={selectStyles}
              />
            )}
         </div>
      </div>

      {/* Monthly List */}
      <div className="flex flex-col gap-2 mt-2">
         {months.map((month, index) => {
            const feeStatusObj = findFeeStatus(selectedPeriod, month);
            const statusStr = feeStatusObj.status;
            const transactionDate = feeStatusObj.transactionDate;
            const { statusHouse } = findStatus(selectedPeriod, month, housesStatus);
            
            const isKosong = statusHouse === "Kosong";
            const badge = getStatusBadge(statusStr);

            return (
                <div 
                    key={index}
                    onClick={() => statusStr === "Lunas" && transactionDate !== '-' ? openModal(selectedPeriod, month) : null}
                    className={`app-card p-4 flex items-center justify-between transition-transform ${statusStr === "Lunas" && transactionDate !== '-' ? 'cursor-pointer active:scale-[0.98]' : ''} ${isKosong ? 'opacity-50' : ''}`}
                >
                   <div className="flex items-center gap-4">
                       <div className="w-12 text-center">
                           <p className="text-[10px] font-bold uppercase text-base-content/50 mb-0.5">Bulan</p>
                           <p className={`font-extrabold ${isKosong ? 'line-through text-base-content/40' : 'text-base-content'}`}>
                              {month.number}
                           </p>
                       </div>
                       <div className="w-px h-8 bg-base-200"></div>
                       <div>
                           <p className={`font-bold text-sm ${isKosong ? 'line-through text-base-content/40' : 'text-base-content'}`}>
                              {month.name} {selectedPeriod}
                           </p>
                           <p className="text-[11px] text-base-content/60 font-medium">
                               {transactionDate !== '-' ? formatDate(transactionDate) : (isKosong ? 'Rumah Kosong' : 'Belum Ada Transaksi')}
                           </p>
                       </div>
                   </div>

                   <div className="flex items-center gap-3">
                       {statusStr !== '-' && !isKosong && (
                           <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${badge.bg} ${badge.text}`}>
                               {badge.icon}
                               <span className="text-[10px] font-bold uppercase tracking-wider">{badge.label}</span>
                           </div>
                       )}
                       {statusStr === "Lunas" && transactionDate !== '-' && (
                           <div className="text-base-content/30">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                           </div>
                       )}
                   </div>
                </div>
            );
         })}
      </div>

      {/* Detail Modal Overlay */}
      {modalIsOpen && selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeModal}>
           <div 
                className="bg-base-100 w-full sm:w-[400px] max-h-[85vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] p-6 shadow-2xl transition-transform transform translate-y-0"
                onClick={e => e.stopPropagation()}
            >
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-200">
                  <div>
                    <h3 className="font-extrabold text-lg text-base-content">Detail Pembayaran</h3>
                    <p className="text-xs text-base-content/50 mt-0.5 capitalize">{selectedDetail.period}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/60 hover:text-base-content active:scale-90 transition-all" onClick={closeModal}>✕</button>
               </div>

               <div className="flex flex-col gap-4">
                  {/* Highlight Box */}
                  <div className="flex flex-col items-center justify-center py-4 bg-success/10 rounded-2xl mb-2 border border-success/20">
                      <p className="text-[10px] uppercase font-bold text-success/70 tracking-wider mb-1">Nominal Dibayar</p>
                      <p className="text-2xl font-extrabold text-success mb-2">{formatCurrency(selectedDetail.amount ?? 70000)}</p>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success text-success-content">
                          <FaCheckCircle className="w-3 h-3"/>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Lunas</span>
                      </div>
                  </div>

                  {/* Info Rows */}
                  <div className="grid grid-cols-3 gap-2 text-sm px-1">
                      <p className="text-base-content/60 font-medium">Tanggal</p>
                      <p className="col-span-2 text-base-content font-bold text-right">{formatDate(selectedDetail.transactionDate)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm px-1">
                      <p className="text-base-content/60 font-medium">Tipe</p>
                      <p className="col-span-2 text-base-content font-bold capitalize text-right">{selectedDetail.paymentType}</p>
                  </div>

                  {/* Proof Image */}
                  {selectedDetail.proofOfTransfer && selectedDetail.proofOfTransfer !== '-' && (
                      <div className="mt-4">
                          <p className="text-base-content/60 font-medium text-sm mb-2 px-1">Bukti Pembayaran</p>
                          <div className="relative w-full aspect-[3/4] sm:aspect-video rounded-xl overflow-hidden border border-base-200 bg-base-200/50">
                              {loadingImg && <div className="absolute inset-0 animate-pulse bg-base-300"></div>}
                              <Image
                                  className="object-contain"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 400px"
                                  onLoad={handleImageLoad}
                                  src={selectedDetail.proofOfTransfer}
                                  alt="Bukti Transfer"
                              />
                          </div>
                      </div>
                  )}
               </div>
           </div>
        </div>
      )}

      <p className='pt-6 pb-4 text-xs text-center text-base-content/50 font-medium'>
        IPL RT 005 tercatat dan terhitung mulai dari Juli 2024.
      </p>
    </div>
  );
};

IplDetail.getLayout = (page) => (
  <PublicLayout title="Detail IPL" description="Laporan IPL RT05/RW 11 Villa Citayam">
    {page}
  </PublicLayout>
);

export default IplDetail;
