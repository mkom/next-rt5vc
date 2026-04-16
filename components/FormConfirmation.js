import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRequireAuth } from '../utils/authUtils.js';
import { useRouter } from 'next/router';
import Spinner from './Spinner';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
import { FaCalendarAlt, FaCamera, FaWhatsapp, FaHome, FaCheckCircle, FaMoneyBillWave, FaPlus, FaTrash } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import { GrFormNextLink } from "react-icons/gr";
import { AiOutlineLoading } from "react-icons/ai";
import axios from 'axios';
import Autocomplete from './Autocomplete';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import id from "date-fns/locale/id";
import Link from 'next/link';
import { formatCurrency } from '../utils/format';

const Confirmation = () => {
    const router = useRouter();
    const { useAuthRedirect } = useRequireAuth(['user','admin', 'editor', 'superadmin']);
    useAuthRedirect();

    const [houseId, setHouseId] = useState('');
    const [houseName, setHouseName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [attachmentTitle, setAttachmentTitle] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [additional_note_mutasi_bca, setAdditional_note_mutasi_bca] = useState('');
    
    // Multiple Files Support
    const [proofOfTransferFiles, setProofOfTransferFiles] = useState([]); // Array of File objects
    
    const [relatedMonths, setRelatedMonths] = useState([]);
    const [status, setStatus] = useState('sedang dicek');
    const [houses, setHouses] = useState([]);
    const [paymentDate, setPaymentDate] = useState(new Date());
    const { data: session } = useSession();
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feeIpl, setFeeIpl] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification]= useState(false);
    const [showForm, setShowForm] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [user, setUser] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [whatsappError, setWhatsappError] = useState("");
    const [monthOptionsList, setMonthOptionsList] = useState([]);
    const [lastPaidIpl, setLastPaidIpl] = useState(null);

    useEffect(() => {
      if (session) {
        const fetchUser = async () => {
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            const dataRes = res.data.data;
            setUser (dataRes);
            setLoading(false);
          } catch (error) {
            signOut();
            setLoading(false);
            console.error('Error fetching user data:', error);
          }
        };
        fetchUser();
      }
    }, [session]);

    const isValidWhatsAppNumber = (number) => {
      const sanitizedNumber = number.trim();
      const regex = /^62\d{8,13}$/;
      return regex.test(sanitizedNumber);
    };

    useEffect(() => {
      if (session) {
        const fetchHouses = async () => {
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            const dataRes = res.data;
            setHouses(dataRes.data.map(house => ({
              value: house.house_id,
              label: house.house_id,
              whatsapp_number: house.whatsapp_number
            })));
            setLoading(false);
          } catch (error) {
            setLoading(false);
            signOut();
            console.error('Error fetching houses data:', error);
          }
        };
        fetchHouses();
      }
    }, [session]);

    useEffect(() => {
      if(relatedMonths.length > 0 && houseName ) {
        const monthLabels = relatedMonths.map(val => moment(val, "YYYY-MM").format("MMMM YYYY")).join(', ');
        const descriptionText = `IPL ${houseName} periode ${monthLabels}`;
        setDescription(descriptionText);
      } else {
        setDescription('');
      }
      setAmount(feeIpl * relatedMonths.length);
    }, [houseId, relatedMonths, houseName, feeIpl]);

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
          setProofOfTransferFiles(prev => [...prev, ...files].slice(0, 5)); 
          setErrors(prev => ({ ...prev, proofOfTransfer: null }));
      }
      if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index) => {
        setProofOfTransferFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        const uploadedUrls = [];
        for (const file of proofOfTransferFiles) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                uploadedUrls.push(response.data.fileUrl);
            } catch (error) {
                console.error('Upload failed for one file', error);
                throw new Error('Gagal mengupload satu atau lebih file.');
            }
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const newErrors = {};
      if (!paymentDate) newErrors.paymentDate = 'Tanggal Wajib Diisi';
      if (relatedMonths.length === 0) newErrors.relatedMonths = 'Pilih minimal satu bulan yang dibayar';
      if (!houseId) newErrors.houseId = 'Nomor Rumah Wajib Diisi';
      if (proofOfTransferFiles.length === 0) newErrors.proofOfTransfer = 'Bukti Transfer Wajib Diisi';
      if (!whatsapp) newErrors.whatsapp = 'Nomor Whatsapp Wajib Diisi';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setIsProcessing(true);

      try {
          const proofOfTransferUrls = await uploadFiles();
          
          const newTransaction = {
            transaction_type: 'ipl',
            amount,
            description,
            additional_note_mutasi_bca,
            proof_of_transfer: proofOfTransferUrls, 
            houseId,
            payment_type:'transfer',
            related_months: relatedMonths.map(val => val.trim()),
            paymentDate,
            status,
            attachment: { attachment_title: attachmentTitle, attachment_url: attachmentUrl },
            whatsapp_notification: whatsapp
          };

          await onSubmitForm(newTransaction);
          resetForm();
      } catch (error) {
          setAlertMessage(error.message || 'Terjadi kesalahan saat memproses data.');
          setIsProcessing(false);
      }
    };

    const onSubmitForm = async (transactionData) => {
      setLoading(true);
      setShowForm(false);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/create`,
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setLoading(false);
        setNotification(true);
        setAlertMessage('Laporan pembayaran Anda telah diterima! Admin akan segera melakukan verifikasi.');

        const bodyMessage = `*Konfirmasi Transfer IPL baru!*\n\n`
            + `*Detail:*\n`
            + `*ID Transaksi:* ${response.data.transaction_id}\n`
            + `*Oleh:* ${response.data.created_by}\n`
            + `*Jumlah:* ${formatCurrency(response.data.amount)}\n`
            + `*Tanggal Pembayaran:* ${moment(response.data.date).format('DD MMM YYYY')}\n`
            + `*Status:* Perlu dicek`;
        const number = '6281717889797';

        try {
          await axios.post(`${process.env.NEXT_PUBLIC_WABOTAPI_URL}notify`, {number, bodyMessage}, {
              headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
           console.error("WA notify error", error);
        }

      } catch (error) {
        setLoading(false);
        setNotification(true);
        setAlertMessage('Konfirmasi pembayaran gagal dikirim. Silakan coba beberapa saat lagi.');
      }
    };

    const handleHouseChange = (newValue) => {
      setHouseId(newValue);
    };

    const fetchLastTransactionWhatsapp = async (currentHouseId) => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const allTransactions = res.data?.data?.transactions || [];
        const houseTransactions = allTransactions
          .filter(t => {
            const txHouseId = t.house_id?.house_id || t.houseId || t.house_id;
            return typeof txHouseId === 'string' && txHouseId.toUpperCase() === currentHouseId.toUpperCase();
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (houseTransactions.length > 0 && houseTransactions[0].whatsapp_notification) {
          setWhatsapp(houseTransactions[0].whatsapp_notification);
        }
      } catch (error) {
        console.error('Error fetching last transaction whatsapp:', error);
      }
    };

    const handleHouseSelect = (selectedHouse) => {
      setHouseId(selectedHouse.value);
      setHouseName(selectedHouse.label);
      setRelatedMonths([]); 
      setErrors((prev) => ({ ...prev, houseId: null }));
      
      if (selectedHouse.whatsapp_number) {
        setWhatsapp(selectedHouse.whatsapp_number);
      } else {
        fetchLastTransactionWhatsapp(selectedHouse.value);
      }
      fetchIPlStatus(selectedHouse.value);
    }

    const fetchIPlStatus = useCallback(async (currentHouseId) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${currentHouseId.toUpperCase()}`);
            const dataMonthlyFees = res.data.data.monthly_fees;
            const paidMonths = dataMonthlyFees.filter(item => item.status === "Lunas" || item.status === "TBD");
            const sortedPaidMonths = paidMonths.sort((a, b) => new Date(b.month) - new Date(a.month));

            let fee = 70000;
            let lastPaid = null;

            if (sortedPaidMonths.length > 0) {
                fee = sortedPaidMonths[0].fee;
                lastPaid = sortedPaidMonths[0].month;
            }
            
            setFeeIpl(fee);
            setLastPaidIpl(lastPaid);
            generateMonthsOptions(lastPaid);

        } catch (error) {
            console.error('Error fetching IPL status:', error);
            generateMonthsOptions(null);
            setFeeIpl(70000);
        }
    }, []);

    const generateMonthsOptions = (lastPaid) => {
      const defaultStartDate = moment("2024-07", "YYYY-MM");
      const startDate = lastPaid ? moment(lastPaid, "YYYY-MM").add(1, 'month') : defaultStartDate;

      const options = [];
      const startYear = startDate.year();
      let startMonthIndex = startDate.month();
      const endYear = startYear + 1; 

      for (let year = startYear; year <= endYear; year++) {
          for (let month = startMonthIndex; month < 12; month++) {
              options.push({ 
                  value: moment().month(month).year(year).format("YYYY-MM"), 
                  label: moment().month(month).year(year).format("MMM YYYY") 
              });
              if (options.length >= 12) break;
          }
          if (options.length >= 12) break;
          startMonthIndex = 0;
      }
      setMonthOptionsList(options);
    };

    const toggleMonthSelection = (val) => {
        setRelatedMonths(prev => {
            const isSelected = prev.includes(val);
            if (isSelected) {
                return prev.filter(m => m !== val);
            } else {
                const newArr = [...prev, val].sort((a, b) => new Date(a + '-01') - new Date(b + '-01'));
                return newArr;
            }
        });
        setErrors((prev) => ({ ...prev, relatedMonths: null }));
    };

    const resetForm = () => {
      setHouseId('');
      setHouseName('');
      setAmount('');
      setDescription('');
      setAttachmentTitle('');
      setAttachmentUrl('');
      setAdditional_note_mutasi_bca('');
      setProofOfTransferFiles([]);
      setRelatedMonths([]);
      setMonthOptionsList([]);
      setPaymentDate(new Date());
      setPaymentType('');
      if(fileInputRef.current) fileInputRef.current.value = '';
      setErrors({});
      setIsProcessing(false);
      setLastPaidIpl(null);
      setWhatsappError("");
    };

    const handleInputChangeWA = (e) => {
      const input = e.target.value;
      setWhatsapp(input);

      if (input.trim() === "" || input === "62") {
          setWhatsappError("");
      } else if (!isValidWhatsAppNumber(input)) {
          setWhatsappError("Nomor WhatsApp harus diawali 62 (contoh: 62812...)");
      } else {
          setWhatsappError("");
      }
    };

    if (!session) return <></>;
    if (loading) return <Spinner />;

    return (
      <div className="flex flex-col gap-4">
        <div id="root-portal"></div> {/* Portal for DatePicker */}
        
        {showForm && (
            <div className='flex gap-2 mb-2'>
                <Link href="/history" className='flex-1 flex items-center justify-center gap-1 bg-base-200 text-base-content font-bold text-xs rounded-xl px-3 py-3 active:scale-95 transition-transform'>
                    <span>Lihat Riwayat</span>
                </Link>
                <Link href="/ipl" className='flex-1 flex items-center justify-center gap-1 bg-success/10 text-success font-bold text-xs rounded-xl px-3 py-3 active:scale-95 transition-transform'>
                    <span>Cek Data Warga</span>
                </Link>
            </div>
        )}

        {notification && (
            <div className="app-card p-6 flex flex-col items-center justify-center text-center gap-4 border-success/30 bg-success/5 animate-fade-in">
                <div className="w-16 h-16 bg-success text-success-content rounded-full flex items-center justify-center mb-2 shadow-lg shadow-success/30 scale-in">
                    <FaCheckCircle className="w-8 h-8" />
                </div>
                <p className="text-base-content font-extrabold text-xl leading-tight tracking-tight">Terima Kasih!</p>
                <p className="text-sm text-base-content/70 font-medium px-4">{alertMessage}</p>
                <Link href="/history" className="app-btn bg-success mt-4 w-full sm:w-auto px-8">
                    Cek Riwayat Konfirmasi
                    <GrFormNextLink className='w-5 h-5'/>
                </Link>
                <button onClick={() => {setShowForm(true); setNotification(false); resetForm();}} className="text-xs font-bold text-base-content/50 mt-2 hover:text-primary">
                    Kirim konfirmasi lainnya
                </button>
            </div>
        )}

        {showForm && (
          <div className="app-card p-5 sm:p-8">
            <div className="mb-6 pb-4 border-b border-base-200">
                <h2 className="text-xl font-extrabold text-base-content tracking-tight">Formulir Setor IPL</h2>
                <p className="text-xs text-base-content/60 mt-1">Isi data di bawah dengan benar agar admin dapat memvalidasi iuran Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* 1. House Select */}
                <div className="relative z-20">
                    <label className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-extrabold text-base-content/70 uppercase tracking-wider">1. Pilih Blok Rumah</span>
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 z-10 pointer-events-none">
                            <FaHome className="w-4 h-4"/>
                        </div>
                        <div className="pl-10">
                            <Autocomplete
                                value={houseId}
                                onChange={handleHouseChange}
                                options={houses}
                                onSelect={handleHouseSelect}
                                className="w-full"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>
                    {errors.houseId && <p className="text-error text-xs font-bold mt-1.5">{errors.houseId}</p>}
                </div>

                {/* 2. Period Selection Grid */}
                <div className={`transition-all duration-300 ${!houseId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <label className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-extrabold text-base-content/70 uppercase tracking-wider">2. Bulan yang Dibayar</span>
                        {lastPaidIpl && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                Lunas S/d: {moment(lastPaidIpl,("YYYY-MM")).format("MMM YY")}
                            </span>
                        )}
                    </label>
                    
                    {!houseId ? (
                        <div className="bg-base-200/50 rounded-xl p-4 text-center border border-dashed border-base-300">
                            <p className="text-xs text-base-content/50 font-medium">Silakan pilih Blok Rumah Anda terlebih dahulu.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {monthOptionsList.map((month) => {
                                    const isSelected = relatedMonths.includes(month.value);
                                    return (
                                        <button
                                            key={month.value}
                                            type="button"
                                            onClick={() => toggleMonthSelection(month.value)}
                                            disabled={isProcessing}
                                            className={`py-2.5 px-1 rounded-xl text-xs font-bold border transition-all active:scale-95
                                                ${isSelected 
                                                    ? 'bg-primary border-primary text-primary-content shadow-md shadow-primary/20' 
                                                    : 'bg-base-100 border-base-300 text-base-content/70 hover:border-primary/30 hover:bg-primary/5'
                                                }
                                            `}
                                        >
                                            {month.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.relatedMonths && <p className="text-error text-xs font-bold mt-1.5">{errors.relatedMonths}</p>}
                        </>
                    )}
                </div>

                {/* 3. Total Bill */}
                <div className={`transition-all duration-300 ${!houseId ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <div className={`rounded-2xl p-4 flex justify-between items-center transition-colors ${amount > 0 ? 'bg-success/10 border border-success/20' : 'bg-base-200 border border-base-300'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${amount > 0 ? 'bg-success/20 text-success' : 'bg-base-300 text-base-content/40'}`}>
                                <FaMoneyBillWave className="w-5 h-5" />
                            </div>
                            <div>
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-0.5 ${amount > 0 ? 'text-success/70' : 'text-base-content/50'}`}>Total Tagihan</span>
                                <span className={`text-[11px] font-bold block ${amount > 0 ? 'text-success/70' : 'text-base-content/40'}`}>{relatedMonths.length} Bulan x {formatCurrency(feeIpl || 0)}</span>
                            </div>
                        </div>
                        <span className={`text-xl sm:text-2xl font-extrabold ${amount > 0 ? 'text-success' : 'text-base-content/40'}`}>
                            {formatCurrency(amount || 0)}
                        </span>
                    </div>
                </div>

                <div className="border-t border-base-200 my-1"></div>

                {/* 4. Upload Area */}
                <div>
                    <label className="flex justify-between items-end mb-2">
                        <span className="text-[11px] font-extrabold text-base-content/70 uppercase tracking-wider">3. Foto Bukti Transfer</span>
                        <span className="text-[9px] font-bold text-base-content/40 uppercase">Max 5 Foto</span>
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {proofOfTransferFiles.map((file, index) => (
                            <div key={index} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-base-200 bg-black group">
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index}`}
                                    fill
                                    className="object-cover"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                                >
                                    <FaTrash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        
                        {proofOfTransferFiles.length < 5 && (
                            <div className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-base-300 bg-base-200/50 hover:bg-base-200 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                                <input
                                    type="file"
                                    id="file"
                                    onChange={handleFileChange}
                                    accept=".jpg,.png,.jpeg"
                                    multiple
                                    ref={fileInputRef}
                                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                                    disabled={isProcessing}
                                />
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                    <FaPlus className="w-4 h-4"/>
                                </div>
                                <p className="text-[10px] font-bold text-base-content/60 text-center px-2">Tambah Foto</p>
                            </div>
                        )}
                    </div>
                    {errors.proofOfTransfer && proofOfTransferFiles.length === 0 && <p className="text-error text-xs font-bold mt-2">{errors.proofOfTransfer}</p>}
                </div>

                {/* 5. Date & WA Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative z-50">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[11px] font-extrabold text-base-content/70 uppercase tracking-wider">Tanggal Transfer</label>
                            <button 
                                type="button" 
                                onClick={() => setPaymentDate(new Date())}
                                className="text-[9px] font-bold bg-base-200 hover:bg-base-300 px-2 py-1 rounded-md transition-colors"
                            >
                                Set Hari Ini
                            </button>
                        </div>
                        <div className="relative flex items-center app-input p-0 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all h-[46px]">
                            <div className="w-12 h-full bg-base-200 border-r border-base-300 flex items-center justify-center text-base-content/40 shrink-0">
                                <FaCalendarAlt className="w-4 h-4" />
                            </div>
                            <DatePicker
                                disabled={isProcessing}
                                locale={id}
                                id="paymentDate"
                                name="paymentDate"
                                selected={paymentDate}
                                onChange={(date) => setPaymentDate(date)}
                                dateFormat="dd MMMM yyyy"
                                placeholderText="Pilih tanggal"
                                className="bg-transparent w-full text-sm font-bold text-base-content py-2 px-3 focus:outline-none"
                                portalId="root-portal"
                            />
                        </div>
                        {errors.paymentDate && <p className="text-error text-xs font-bold mt-1.5">{errors.paymentDate}</p>}
                    </div>

                    <div className="relative z-0">
                        <label className="block text-[11px] font-extrabold text-base-content/70 uppercase tracking-wider mb-2 mt-0.5">Notifikasi Whatsapp</label>
                        <div className="relative flex items-center app-input p-0 overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all h-[46px]">
                            <div className="w-12 h-full bg-base-200 border-r border-base-300 flex items-center justify-center shrink-0">
                                <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
                            </div>
                            <input
                                id='whatsapp'
                                name="whatsapp"
                                placeholder="62812345..."
                                className="bg-transparent w-full text-sm font-bold text-base-content py-2 px-3 focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                                type="number"
                                value={whatsapp || ""}
                                onChange={handleInputChangeWA}
                                disabled={isProcessing}
                            />
                        </div>
                        {errors.whatsapp && <p className="text-error text-xs font-bold mt-1.5">{errors.whatsapp}</p>}
                        {whatsappError  && <p className="text-error text-xs font-bold mt-1.5">{whatsappError}</p>}
                    </div>
                </div>

                {/* Submit Area */}
                <div className='flex gap-3 mt-4 pt-4 border-t border-base-200'>
                    <button
                        type="button"
                        className="app-btn bg-base-200 text-base-content/70 shadow-none hover:bg-base-300 flex-[1]"
                        onClick={resetForm}
                        disabled={isProcessing}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className={`app-btn flex-[2.5] ${(!houseId || relatedMonths.length === 0 || proofOfTransferFiles.length === 0) ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                        disabled={isProcessing || whatsappError}
                    >
                        {isProcessing ? (
                            <><AiOutlineLoading className="h-5 w-5 animate-spin"/> Proses...</>
                        ) : (
                            'Kirim Konfirmasi'
                        )}
                    </button>
                </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  export default Confirmation;