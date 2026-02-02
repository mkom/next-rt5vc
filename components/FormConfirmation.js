import { getSession, useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';
import { useRequireAuth } from '../utils/authUtils.js'; 
import { useRouter } from 'next/router';
import Spinner from './Spinner';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
import { Drawer, Button, Input, FileInput, Textarea, Label, TextInput, Dropdown,Alert, Card } from 'flowbite-react';
import {FaCalendarAlt, FaMoneyBill, FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { MdDelete  } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import { GrFormNextLink } from "react-icons/gr";
import { AiOutlineLoading } from "react-icons/ai";
import axios from 'axios';
import Autocomplete from './Autocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select';
import moment from 'moment';
import 'moment/locale/id';
import 'moment-timezone';
import id from "date-fns/locale/id";
moment.locale('id');
import Link from 'next/link';

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
    const [proofOfTransfer, setProofOfTransfer] = useState('');
    const [relatedMonths, setRelatedMonths] = useState([]);
    const [status, setStatus] = useState('sedang dicek');
    const [houses, setHouses] = useState([]);
    const [paymentDate, setPaymentDate] = useState(new Date());
    const { data: session } = useSession();
    const [errors, setErrors] = useState({});
    const [uploadUrl, setUploadUrl] = useState('');
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentType, setPaymentType] = useState('');
    const [selectedImage, setSelectedImage] = useState();
    const [lastPaidIPl, setLastPaidIPl] = useState(null);
    const [feeIPl, setFeeIPl] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification]= useState(false);
    const [showForm, setShowForm] = useState(true);
    const [alertMessage, setAlertMessage] = useState('');
    const [user, setUser] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [whatsappError, setWhatsappError] = useState("");

    useEffect(() => {
      if (session) {

        const fetchUser = async () => {
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            });
            //console.log(res.data)
            const dataRes = res.data.data;
            setUser (dataRes);
            setLoading(false);
            //setWhatsapp(res.data.data.whatsapp_number);
          } catch (error) {
           
            signOut();
            setLoading(false);
            console.error('Error fetching user data:', error);
          }
        };

        fetchUser();
      } else {
        
      }
    }, [session]);

    const isValidWhatsAppNumber = (number) => {
      // Hapus spasi atau karakter tidak valid di awal atau akhir
      const sanitizedNumber = number.trim();
      // Nomor harus dimulai dengan '62', diikuti 8-13 digit
      const regex = /^62\d{8,13}$/;
      
      return regex.test(sanitizedNumber);
    };
  

    useEffect(() => {
      if (session) {
        const fetchHouses = async () => {
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            });
            //console.log(res.data)
            const dataRes = res.data;
            setHouses(dataRes.data.map(house => ({
              value: house.house_id,
              label: house.house_id
            })));
            
            setLoading(false);
          } catch (error) {
            setLoading(false);
            signOut();
            setLoading(false);
            console.error('Error fetching houses data:', error);
          }
        };
  
        fetchHouses();
      } else {
        
      }
    }, [session]);
  
    useEffect(() => {
      if(relatedMonths.length > 0 && houseName ) {
        const monthLabels = relatedMonths.map(option => moment(option.value, "YYYY-MM").format("MMMM YYYY")).join(', ');
        const descriptionText = `IPL ${houseName} periode ${monthLabels}`;
        setDescription(descriptionText);
      }
    }, [houseId, relatedMonths,houseName]);
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setProofOfTransfer(file); // Set file for upload
          setSelectedImage(e.target.files[0]);
      }
      
      //console.log( selectedImage)
      //console.log(proofOfTransfer)
    };
  
    const handleFileUpload = async (file) => {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          //console.log(response.data.fileUrl);
          setUploadUrl(response.data.fileUrl);
          return response.data.fileUrl;
      } catch (error) {
          //console.error('Error uploading file:', error);
          alert('Failed to upload file.');
          resetForm();
          onClose();
          return null;
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const newErrors = {};
      if (!paymentDate) newErrors.paymentDate = 'Tanggal Wajib Diisi';
      if (relatedMonths.length == 0) newErrors.relatedMonths = 'Periode Wajib Diisi';
      if (!houseId) newErrors.houseId = 'Nomor Rumah Wajib Diisi';
      if (!proofOfTransfer) newErrors.proofOfTransfer = 'Bukti Transfer Wajib Diisi';
      if (!whatsapp) newErrors.whatsapp = 'Nomor Whatsapp Wajib Diisi';
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsProcessing(true);
  
      let proofOfTransferUrl = uploadUrl;
      if (proofOfTransfer && proofOfTransfer instanceof File) {
        proofOfTransferUrl = await handleFileUpload(proofOfTransfer);
        if (!proofOfTransferUrl) return; 
      }
  
      const convertStringToArray = (dateString) => {
        const dateArray = dateString.split(', ').map(date => date.trim());
        return dateArray;
      };
  
      const dateString = relatedMonths.map(option => option.value).join(', ');
      const dateArray = convertStringToArray(dateString);
  
      const newTransaction = {
        transaction_type: 'ipl',
        amount,
        description,
        additional_note_mutasi_bca,
        proof_of_transfer: proofOfTransferUrl,
        houseId,
        payment_type:'transfer',
        related_months: dateArray,
        paymentDate, 
        status,
        attachment: { attachment_title: attachmentTitle, attachment_url: attachmentUrl },
        whatsapp_notification: whatsapp
        
      };

      if (typeof onSubmit !== 'function') {
        console.error('onSubmit is not a function');
        setIsProcessing(false);
        return;
      }
  
      onSubmit(newTransaction);
      //addWhatsapp(whatsapp); 
      resetForm();
     
      
    };

    const onSubmit = async (transactionData) => {
      setLoading(true);
      setShowForm(false);
      //setAlertMessage('Sedang memproses konfirmasi pembayaran Anda, harap tunggu...');

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/create`, 
          transactionData, 
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`, // Tempatkan headers di opsi konfigurasi
              'Content-Type': 'application/json',
            },
          }
        );
        setLoading(false);
        setNotification(true);
        setAlertMessage('Konfirmasi pembayaran Anda sudah selesai dan menunggu validasi dari Admin/Pengurus Rt 05.\r\nBukti penerimaan pembayaran akan dikirimkan setelah pembayaran Anda dinyatakan valid.');
      
        const bodyMessage = `*Konfirmasi Transfer IPL baru!*\n\n`
            + `*Detail:*\n`
            + `*ID Transaksi:* ${response.data.transaction_id}\n`
            + `*Oleh:* ${response.data.created_by}\n`
            + `*Input:* ${new Date(response.data.created_at).toLocaleString()}\n`
            + `*Jumlah:* ${formatCurrency(response.data.amount)}\n`
            + `*Deskripsi:* ${response.data.description}\n`
            + `*Tanggal Pembayaran:* ${moment(response.data.date).format('DD MMM YYYY')}\n`
            + `*Status:* Perlu dicek`;
        const number = '6281717889797'; 

        // Send notification to admin via the WhatsApp bot
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_WABOTAPI_URL}/send`,
              {to: number, message: bodyMessage},
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
         
        } catch (error) {
          // setNotification (true);
          // setShowForm(false);
          // Jika ingin menambahkan log detail, bisa gunakan ini:
          // console.error(error.response ? error.response.data : error);
        }
        
       
      } catch (error) {
        setLoading(false);
        setNotification(true);
        setAlertMessage('Konfirmasi pembayaran Anda gagal, coba ulangi lagi');
        //console.error('Error creating transaction:', error);
      }
    };
  
  
    const handleHouseChange = (newValue) => {
      setHouseId(newValue);
    };
  
    const handleHouseSelect = (selectedHouse) => {
      resetForm();
      const currentHouseId = selectedHouse.value;
      setHouseId(selectedHouse.value);
      setHouseName(selectedHouse.label)
      fetchIPlStatus(currentHouseId);
    }

    const fetchIPlStatus = useCallback (async (currentHouseId) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${currentHouseId.toUpperCase()}`, {

        });

           // console.log(res.data.data)
            const dataMonthlyFees = res.data.data.monthly_fees
            const paidMonths = dataMonthlyFees.filter(item => item.status === "Lunas" || item.status === "TBD");
            const sortedPaidMonths = paidMonths.sort((a, b) => new Date(b.month) - new Date(a.month));
      
            //console.log(sortedPaidMonths)
            // Ambil bulan terakhir yang statusnya "Lunas"
            if (sortedPaidMonths.length > 0) {
                const lastPaidMonth = sortedPaidMonths[0].month;
                const getFeeIPL = sortedPaidMonths[0].fee;
                setFeeIPl(getFeeIPL);
                setLastPaidIPl(lastPaidMonth);
            }
          
        } catch (error) {
    
            console.error('Error fetching houses data:', error);
            //setLoading(false);
        }
       
    },[])

    const handleMonthChange = (selectedOptions) => {
      setRelatedMonths(selectedOptions || []);
      setAmount(feeIPl*selectedOptions.length)
    };
  
    const generateMonthsOptions = () => {
      const defaultStartDate = moment("2024-07", "YYYY-MM"); // Default mulai dari Juli 2024 jika lastPaidIPl kosong
      const startDate = lastPaidIPl 
          ? moment(lastPaidIPl, "YYYY-MM").add(1, 'month') 
          : defaultStartDate;
  
      const options = [];
      const startYear = startDate.year();
      let startMonthIndex = startDate.month(); // Bulan awal
      const endYear = startYear + 1; // Generate bulan selama 2 tahun ke depan
  
      for (let year = startYear; year <= endYear; year++) {
          for (let month = startMonthIndex; month < 12; month++) {
              const value = moment().month(month).year(year).format("YYYY-MM");
              const label = moment().month(month).year(year).format("MMMM YYYY");
              options.push({ value, label });
          }
          startMonthIndex = 0; // Setelah tahun pertama, mulai lagi dari bulan Januari
      }
  
      return options;
    };
  
  
    const optionsType = [
      { value: 'cash', label: 'Cash' },
      { value: 'transfer', label: 'Transfer' },
    ]
  
  
    const handleTypeChange = (e) => {
      setPaymentType(e);
    };
  
    const resetForm = () => {
      setHouseId('');
      setAmount('');
      setDescription('');
      setAttachmentTitle('');
      setAttachmentUrl('');
      setAdditional_note_mutasi_bca('');
      setProofOfTransfer('');
      setRelatedMonths([]);
      setPaymentDate(new Date());
      setPaymentType('');
      fileInputRef.current.value = '';
      setErrors({});
      setIsProcessing(false);
      setSelectedImage(null);
      setLastPaidIPl(null);
      //setWhatsapp(user.whatsapp_number);
      setWhatsappError("");
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
      }).format(amount);
    };

    const handleDeleteImg = () => {
      setProofOfTransfer('');
      setSelectedImage(null);
      fileInputRef.current.value = ''; // Reset input file
    };

    const handleInputChangeWA = (e) => {
      const input = e.target.value;
      setWhatsapp(input);
  
      if (input.trim() === "" || input === "62") {
          setWhatsappError(""); // Hapus pesan error jika input kosong atau hanya "62"
      } else if (!isValidWhatsAppNumber(input)) {
          setWhatsappError("Nomor WhatsApp tidak valid. Harus dimulai dengan 62 dan memiliki panjang 10-14 digit.");
      } else {
          setWhatsappError("");
          //addWhatsapp(input); 
      }
    };
  

    const addWhatsapp = async () => {
      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/users/update/${user._id}`,
          { whatsapp_number: whatsapp }, // Data yang dikirim dalam body
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
    
        //console.log('Response:', response.data);
        // Tambahkan logika untuk menangani respons sukses, seperti notifikasi
      } catch (error) {
        console.error('Error updating WhatsApp number:', error);
        // Tambahkan logika untuk menampilkan pesan kesalahan ke pengguna
      }
    };

    if (!session) {
      return <></>;
    }

    if (loading) {
       return <Spinner />;
    }

    const confirmFrom = () => {
      setShowForm(true);
      setNotification(false)
    }


    return (
      <>

      {notification &&
        <Card className='md:w-10/12 m-auto text-center'>
          <p>{alertMessage}</p>
          
          <div  className=" flex space-x-3 justify-center mb-4">
            <Button 
            color="success"
            as={Link} href="/history"
            >
              Selesai
              <GrFormNextLink  className='w-5 h-5'/>
            </Button>
            {/* <Button color="blue">
              Riwayat Pembayaran
              <GrFormNextLink  className='w-5 h-5'/>
            </Button> */}
          </div>
        </Card>
      }
     

        {showForm && 
          <>
            <div className='flex justify-start gap-2'>
              <Link  href="/history" className='flex items-center content-center bg-blue-700 text-white font-medium text-xs rounded-xl px-2 py-1 '>
              <span className='text-center content-center'>Riwayat konfirmasi transfer</span>
              <GrFormNextLink  className='w-5 h-5'/>
              </Link >
              <Link href="/ipl" className='flex items-center content-center bg-green-700 text-white font-medium text-xs rounded-xl px-2 py-1 '>
              <span className='text-center content-center'>Data IPL</span>
              <GrFormNextLink  className='w-5 h-5'/>
              </Link>
            </div>
          <p className='py-6'>Lengkapi data yang diperlukan. Jangan sampai terlewat satupun. Setelah yakin terisi semua, jangan lupa klik tombol KIRIM.</p>
          <form onSubmit={handleSubmit} className="">
            <div className="mb-5 ">
              <Label htmlFor="houseId" className="mb-2 block">No Rumah</Label>
              <Autocomplete
                value={houseId}
                onChange={handleHouseChange}
                options={houses}
                onSelect={handleHouseSelect}
                className="z-50 w-full md:w-72"
                disabled={isProcessing}
              />

              
              {errors.houseId && <div className="text-red-500 text-xs pt-2">{errors.houseId}</div>}
              {lastPaidIPl && 
                <>
                <p className='text-xs pt-2 text-gray-700'>IPL Terakhir : {moment(lastPaidIPl,("YYYY-MM")).format("MMMM YYYY")}</p>
                </>
              }
              
            </div>

            <div className="mb-5 ">
                <Label htmlFor="relatedMonths" className="mb-2 block">Periode</Label>
                <Select
                id="relatedMonths"
                isMulti
                isSearchable={false}
                options={generateMonthsOptions()}
                value={relatedMonths}
                onChange={handleMonthChange}
                placeholder="Pilih periode"
                className='bg-gray-50 text-sm z-20 w-full'
                disabled={isProcessing}
                noOptionsMessage={() => "Tidak ada opsi tersedia"}
                />
                
                {errors.relatedMonths && <div className="text-red-500 text-xs pt-2">{errors.relatedMonths}</div>}
                
                {/* {relatedMonths && relatedMonths.length > 0 && feeIPl*relatedMonths.length > 0 && 
                <>
                <p className='text-xs pt-3 text-gray-700'>Nominal yang harus dibayarkan: <strong>{formatCurrency(feeIPl*relatedMonths.length)}</strong></p>
                </>
                } */}
            </div>
            <div className="mb-5 ">
                <Label htmlFor="proofOfTransfer" className="mb-2 block">Bukti Transfer</Label>
                <FileInput 
                  id="file" 
                  onChange={handleFileChange} 
                  accept=".jpg,.png,.jpeg"
                  ref={fileInputRef}
                  className=''
                  disabled={isProcessing}
                />
                
                <TextInput
                  id="proofOfTransfer"
                  name="proofOfTransfer"
                  value={proofOfTransfer || ""}
                  onChange={(e) => setProofOfTransfer(e.target.value)}
                  placeholder="Masukkan URL lampiran"
                  className='hidden'
                />
                {selectedImage && (
                <div className='w-40 h-40 relative'>
                  <Image
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  width={300}
                  height={300}
                  className="py-2 w-full h-full object-cover"
                />
                <MdDelete  onClick={handleDeleteImg} title='Hapus' className='absolute top-2 right-2 w-6 h-6 cursor-pointer text-red-500'/>
                </div>
              )}

                {errors.proofOfTransfer && !proofOfTransfer && <div className="text-red-500 text-xs pt-2">{errors.proofOfTransfer}</div>}
                {proofOfTransfer && !selectedImage &&
                <div className='w-40 h-40'>
                  <Image className='py-2 w-full h-full object-cover' width={300} height={300} src={transactionToEdit.proof_of_transfer}  alt="image 1" /> 
                </div>
                  
                }
            </div>

            <div className="mb-5">
              <Label htmlFor="paymentDate" className="mb-2 block">Tanggal Pembayaran</Label>
              <div className='flex items-center w-full md:w-72 relative border border-gray-300 rounded-md shadow-sm bg-gray-50'>
              <FaCalendarAlt className="absolute h-5 w-5 left-2 z-10  top-1/2 transform -translate-y-1/2 text-gray-500" />
              <DatePicker
                disabled={isProcessing}
                locale={id}
                id="paymentDate"
                name="paymentDate"
                selected={paymentDate}
                onChange={(date) => setPaymentDate(date)}
                dateFormat="dd MMMM yyyy"
                calendarClassName="light-blue-stripes"
                placeholderText="Pilih tanggal"
                className="block w-full pl-8 text-sm text-gray-900  border-gray-300 border-none rounded-md py-2 px-4 focus:ring-0 bg-gray-50"
              />
              </div>
              {errors.paymentDate && <div className="text-red-500 text-xs pt-2">{errors.paymentDate}</div>}
              <p className='text-xs pt-2 text-gray-700'>Sesuai dengan tanggal di bukti transfer</p>
            </div>

            <div className="mb-5">
                <Label htmlFor="proofOfTransfer" className="mb-1 block">No Whatsapp Anda</Label>
                <span className='mb-3 block text-sm'>Untuk Menerima Konfirmasi Pembayaran.</span>
                <TextInput 
                  id='whatsapp'
                  name="whatsapp"
                  placeholder="No Whataspp dimulai dengan 62"
                  className=" w-full md:w-72"
                  type="number"
                  value={whatsapp || ""}
                  onChange={handleInputChangeWA}
                />
                <p className='text-xs pt-2 text-gray-700'>Contoh: 6283863473596</p>
                {errors.whatsapp && <div className="text-red-500 text-xs pt-2">{errors.whatsapp}</div>}
                {whatsappError  && <div className="text-red-500 text-xs pt-2">{whatsappError}</div>}
            </div>

            <div className='flex gap-2 mt-9'>
              <Button 
              size="md"
              type="submit" 
              color="success"
              className='w-48'
              disabled={isProcessing || whatsappError}
              >
                {isProcessing && <AiOutlineLoading className="h-5 w-5 animate-spin mr-2" />}
            
                Kirim
              </Button>
              <Button
              size="md"
                type="button"
                color="gray"
                onClick={() => {
                  resetForm();
                //  onClose();
                }}
              >
                Batal
              </Button>
            </div>
          </form>
          </>
        }
        
      </>
    );
  };
  
  export default Confirmation;