// components/TransactionDrawer.js
import { getSession, useSession } from 'next-auth/react';
import { useState, useEffect, useRef,useCallback } from 'react';
import Image from "next/image";
import { Drawer, Button, Input, FileInput, Textarea, Label, TextInput, Dropdown,Alert, Card } from 'flowbite-react';
import {FaCalendarAlt, FaMoneyBill, FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { FaExchangeAlt } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import axios from 'axios';
import Autocomplete from '../Autocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select';
import moment from 'moment';
import 'moment/locale/id';
import id from "date-fns/locale/id";
moment.locale('id');

const TransactionDrawer = ({ isOpen, onClose, onSubmit, transactionType, transactionToEdit }) => {
  
 // console.log(transactionToEdit);
  const [houseId, setHouseId] = useState('');
  const [houseName, setHouseName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
 // const [attachments, setAttachments] = useState([]);
  const [attachmentTitle, setAttachmentTitle] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [additional_note_mutasi_bca, setAdditional_note_mutasi_bca] = useState('');
  const [reason_cancellation, setReason_cancellation] = useState('');
  const [proofOfTransfer, setProofOfTransfer] = useState('');
  const [relatedMonths, setRelatedMonths] = useState([]);
  const [status, setStatus] = useState('berhasil');
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const { data: session } = useSession();
  const [errors, setErrors] = useState({});
  const [uploadUrl, setUploadUrl] = useState('');
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [selectedImage, setSelectedImage] = useState();
  const [formattedMonths, setFormattedMonths] =useState([]);
  const [lastPaidIPl, setLastPaidIPl] = useState(null);
  const [feeIPl, setFeeIPl] = useState(0);
  const [noteCancel, setNoteCancel] = useState(false);

  // const handleAddAttachment = () => {
  //   setAttachments([...attachments, { attachment_title: attactment_title, attachment_url: attactment_url }]);
  //   setAttactment_title(''); // Reset the input
  //   setAttactment_url('');
  // };

  useEffect(() => {
    if (transactionToEdit) {
      const formattedMonth = transactionToEdit.related_months.map((month) => {
        const date = new Date(month + '-01'); // add '-01' to create a valid date string
        const label = moment(date).format('MMMM YYYY');
        return { value: month, label };
      });
      setFormattedMonths(formattedMonth)
    }
    

  }, [transactionToEdit]);

  useEffect(() => {
    if (formattedMonths !== null) {
      //console.log(formattedMonths);
      setRelatedMonths(formattedMonths || []);
    }
  }, [formattedMonths]);

  useEffect(() => {
    if (transactionToEdit) {
    //
      setHouseId(transactionToEdit.house_id ? transactionToEdit.house_id.house_id : '');
      setHouseName(transactionToEdit.house_id ? transactionToEdit.house_id.house_id : '');
      setAmount(transactionToEdit.amount || '');
      setDescription(transactionToEdit.description || '');
      setAttachmentTitle(transactionToEdit.attachment.attachment_title || '');
      setAttachmentUrl(transactionToEdit.attachment.attachment_url || '');
      setAdditional_note_mutasi_bca(transactionToEdit.additional_note_mutasi_bca || '');
      setProofOfTransfer(transactionToEdit.proof_of_transfer || '');
      //setRelatedMonths(formattedMonths || []);
      setPaymentDate(transactionToEdit.date ? transactionToEdit.date : new Date());
      setStatus(transactionToEdit.status ? { value: transactionToEdit.status, label: transactionToEdit.status } : '');
      setPaymentType(transactionToEdit.payment_type ? { value: transactionToEdit.payment_type, label: transactionToEdit.payment_type } : '');
    }
  }, [transactionToEdit]);


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
        } catch (error) {
          console.error('Error fetching houses data:', error);
        }
      };

      fetchHouses();
    }
  }, [session]);

  useEffect(() => {
    if (transactionType === 'ipl') {
      //console.log(relatedMonths)
      if(relatedMonths.length > 0 && houseName ) {
        const monthLabels = relatedMonths.map(option => moment(option.value, "YYYY-MM").format("MMMM YYYY")).join(', ');
        const descriptionText = `IPL ${houseName} periode ${monthLabels}`;
        setDescription(descriptionText);
      }
     
    }
  }, [houseId, relatedMonths, transactionType,houseName]);

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

  useEffect(() => {
    if (transactionToEdit) {
      setUploadUrl(transactionToEdit.proof_of_transfer);
    }
  }, [transactionToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!transactionType) newErrors.transactionType = 'Transaction type is required';
    if (!amount || amount <= 0) newErrors.amount = 'Amount must be a positive number';
    if (!description) newErrors.description = 'Description is required';
    if (!paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!relatedMonths) newErrors.relatedMonths = 'Months is required';
    if (!paymentType) newErrors.paymentType = 'Payment Type is required';
    if (!status) newErrors.status = 'Status is required';
    if (transactionType === 'ipl' && !houseId) newErrors.houseId = 'House ID is required';
    if (paymentType === 'transfer' && !proofOfTransfer) newErrors.proofOfTransfer = 'Proof of transfer is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true); // Start processing

    let proofOfTransferUrl = uploadUrl;
    // If proofOfTransfer is a file that needs to be uploaded
    if (proofOfTransfer && proofOfTransfer instanceof File) {
      proofOfTransferUrl = await handleFileUpload(proofOfTransfer);
      if (!proofOfTransferUrl) return; // Abort if upload fails
    }

    const convertStringToArray = (dateString) => {
      // Memisahkan string berdasarkan koma dan spasi
      const dateArray = dateString.split(', ').map(date => date.trim());
      return dateArray;
    };

    const dateString = relatedMonths.map(option => option.value).join(', ');
    const dateArray = convertStringToArray(dateString);

    const newTransaction = {
      transaction_type: transactionType,
      amount,
      description,
      additional_note_mutasi_bca,
      proof_of_transfer: proofOfTransferUrl,
      houseId,
      payment_type: paymentType.value,
      related_months: dateArray,
      paymentDate,
      status: status.value,
      attachment: { attachment_title: attachmentTitle, attachment_url: attachmentUrl },
      reason_cancellation
      
    };

    //console.log(newTransaction)

    onSubmit(newTransaction);
    setHouseId('');
    setAmount('');
    setDescription('');
    setAttachmentTitle('');
    setAttachmentUrl('');
    setAdditional_note_mutasi_bca('')
    setProofOfTransfer('');
    setRelatedMonths([]);
    setPaymentDate(new Date());
    setStatus('');
    fileInputRef.current.value = '';
    setPaymentType('');
    setIsProcessing(false); // Stop processing
    onClose();
    resetForm();
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

  };
  
  const fetchIPlStatus = useCallback (async (currentHouseId) => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${currentHouseId.toUpperCase()}`, {

    });

        const dataMonthlyFees = res.data.data.monthly_fees

        // Filter data yang memiliki status "Lunas"
        const paidMonths = dataMonthlyFees.filter(item => item.status === "Lunas");
        // Urutkan berdasarkan bulan, dari yang terbaru
        const sortedPaidMonths = paidMonths.sort((a, b) => new Date(b.month) - new Date(a.month));
    
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
   
},[houseId])

  const handleMonthChange = (selectedOptions) => {
    setRelatedMonths(selectedOptions || []);
    setAmount(feeIPl*selectedOptions.length)
  };

  const generateMonthsOptions = () => {
      if (!lastPaidIPl) return [];
      const options = [];
      let nextMonth = moment(lastPaidIPl, "YYYY-MM").add(1, 'month'); // Bulan setelah bulan terakhir yang "Lunas"
      let startYear = nextMonth.year();
      let startMonthIndex = nextMonth.month(); // Bulan setelah bulan terakhir yang "Lunas"
      let endYear = startYear + 1; 

      // Generate bulan selama 2 tahun ke depan
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

  const optionsStatus = [
    { value: 'berhasil', label: 'Berhasil' },
    { value: 'gagal', label: 'Gagal' },
    { value: 'sedang dicek', label: 'Sedang dicek' },
  ]


  const handleStatusChange = (e) => {
    setStatus(e);
    if(e.value == 'gagal') {
      setNoteCancel(true)
    }
   
  };

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
    setStatus('');
  };

 
  return (
    <Drawer
      open={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      position="right"
      className="py-4 px-7 top-0 z-50 w-full md:w-2/4"
    >
      <Drawer.Header title={`Transaksi ${transactionType === 'ipl' ? 'IPL' : transactionType === 'income' ? 'Masuk' : 'Keluar'}`} titleIcon={FaExchangeAlt} />
      <Drawer.Items>

        {transactionToEdit && 
         <div className='p-3 shadow-none rounded-md border '>
            <div className='flex flex-wrap gap-3 justify-start'>
              <div className="text-sm ">Dibuat oleh :</div>
              <div className="text-sm ">{transactionToEdit.created_by[0]?  transactionToEdit.created_by[0].email :''}</div>
            </div>
            <div className='flex flex-wrap gap-3 justify-start'>
              <div className="text-sm ">Tanggal :</div>
              <div className="text-sm ">{transactionToEdit.created_at}</div>
            </div>
            <div className='flex flex-wrap gap-3 justify-start'>
              <div className="text-sm ">Whatsapp :</div>
              <div className="text-sm ">{transactionToEdit.whatsapp_notification}</div>
            </div>
          </div>
        }
       

        <form onSubmit={handleSubmit} className="space-y-4">
          {transactionType !== 'expense' && transactionType !== 'income' && (
            <>
              <div className="mb-6 mt-3">
                <Label htmlFor="houseId" className="mb-2 block">No Rumah</Label>
                <Autocomplete
                  value={houseId}
                  onChange={handleHouseChange}
                  options={houses}
                  onSelect={handleHouseSelect}
                />
                {errors.houseId && <div className="text-red-500 text-sm">{errors.houseId}</div>}
                {lastPaidIPl && 
                  <>
                  <p className='text-xs pt-2 text-gray-700'>IPL Terakhir : {moment(lastPaidIPl,("YYYY-MM")).format("MMMM YYYY")}</p>
                  </>
                }
              </div>
              

            </>
          )}

          {transactionType === 'ipl' && (
             <div className="mb-6 mt-3">
             <Label htmlFor="relatedMonths" className="mb-2 block">Periode</Label>
             <Select
              id="relatedMonths"
              isMulti
              options={generateMonthsOptions()}
              value={relatedMonths}
              onChange={handleMonthChange}
              placeholder="Pilih bulan"
              className='bg-gray-50 text-sm'
             />
             {errors.relatedMonths && <div className="text-red-500 text-sm">{errors.relatedMonths}</div>}
             </div>
          )}

          <div className="mb-6 mt-3">
            <Label htmlFor="description" className="mb-2 block">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi"
              readOnly={transactionType === 'ipl'} // Make description read-only for IPL transactions
            />
            {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
          </div>

          <div className="mb-6 mt-3">
            <Label htmlFor="amount" className="mb-2 block">Jumlah</Label>
            <TextInput
              id="amount"
              name="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan jumlah"
            />
            {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
          </div>

          <div className="mb-6 mt-3">
            <Label htmlFor="payment_type" className="mb-2 block">Tipe Pembayaran</Label>
              <Select
                id="payment_type"
                options={optionsType}
                value={paymentType}
                onChange={handleTypeChange}
                placeholder="Cash atau Transfer"
                className='bg-gray-50 text-sm'
              />
            {errors.paymentType && <div className="text-red-500 text-sm">{errors.paymentType}</div>}
          </div>

          <div className="mb-6 mt-3">
              <Label htmlFor="proofOfTransfer" className="mb-2 block">Lampiran</Label>
              <FileInput 
                id="file" 
                onChange={handleFileChange} 
                accept=".jpg,.png,.pdf,.jpeg"
                ref={fileInputRef}
              />
              
              <TextInput
                id="proofOfTransfer"
                name="proofOfTransfer"
                value={proofOfTransfer}
                onChange={(e) => setProofOfTransfer(e.target.value)}
                placeholder="Masukkan URL lampiran"
                className='hidden'
              />
              {selectedImage && (
              <Image
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                width={250}
                height={250}
                className="p-8"
              />
            )}
              {errors.proofOfTransfer && <div className="text-red-500 text-sm">{errors.proofOfTransfer}</div>}
              {proofOfTransfer && !selectedImage &&
                <Image className='p-8' width={250} height={250} src={transactionToEdit.proof_of_transfer}  alt="image 1" /> 
              }
            </div>

          <div className="mb-6 mt-3">
            <Label htmlFor="paymentDate" className="mb-2 block">Tanggal Pembayaran</Label>
            <div className='flex items-center w-72 relative border border-gray-300 rounded-md shadow-sm bg-gray-50'>
            <FaCalendarAlt className="absolute h-5 w-5 left-2 z-50 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <DatePicker
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
            {errors.paymentDate && <div className="text-red-500 text-sm">{errors.paymentDate}</div>}
            
          </div>

          <div className="mb-6 mt-3">
            <Label htmlFor="additional_note_mutasi_bca" className="mb-2 block">Catatan</Label>
            <Textarea
              id="additional_note_mutasi_bca"
              name="additional_note_mutasi_bca"
              value={additional_note_mutasi_bca}
              onChange={(e) => setAdditional_note_mutasi_bca(e.target.value)}
              placeholder="Catatan tambahan"
            />
            
          </div>

          <div className="mb-6 mt-3">
            <Label htmlFor="payment_type" className="mb-2 block">Status</Label>
              <Select
                id="status"
                options={optionsStatus}
                value={status}
                onChange={handleStatusChange}
                placeholder="Status"
                className='bg-gray-50 text-sm'
              />
            {errors.status && <div className="text-red-500 text-sm">{errors.status}</div>}
          </div>

        {noteCancel && status.value === 'gagal' && 
        
        <div className="mb-6 mt-3">
            <Label htmlFor="cancel_note" className="mb-2 block">Alasan pembatalan</Label>
            <Textarea
              id="cancel_note"
              name="cancel_note"
              value={reason_cancellation}
              onChange={(e) => setReason_cancellation(e.target.value)}
              placeholder="Catatan tambahan"
            />
            
          </div>
        }
          

          {transactionType !== 'ipl' && 
            <Card>
            <h3>Dokumen tambahan</h3>
              <div className=" mt-3">
                <Label htmlFor="attactment_title" className="mb-2 block">Judul Dokumen</Label>
                <TextInput
                  id="attactment_title"
                  name="attactment_title"
                  type="text"
                  value={attachmentTitle}
                  onChange={(e) => setAttachmentTitle(e.target.value)}
                  placeholder="Judul"
                />
              
              </div>
              <div className="mb-6">
                <Label htmlFor="attactment_url" className="mb-2 block">Url Dokumen</Label>
                <TextInput
                  id="attactment_url"
                  name="attactment_url"
                  type="text"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="Link Url"
                />
              
              </div>
            </Card>
          }
         

          <div className='flex gap-2'>
            <Button 
            type="submit" 
            color={transactionType === 'ipl' ? 'success' : transactionType === 'income' ? 'blue' : 'failure'}
            disabled={isProcessing}
            >
              {isProcessing && <AiOutlineLoading className="h-5 w-5 animate-spin mr-2" />}
              {transactionType === 'ipl' && <FaExchangeAlt className="mr-2 h-5 w-5" />}
              {transactionType === 'income' && <FaRegArrowAltCircleDown className="mr-2 h-5 w-5" />}
              {transactionType === 'expense' && <FaRegArrowAltCircleUp className="mr-2 h-5 w-5" />}
              Simpan
            </Button>
            <Button
              type="button"
              color="gray"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      </Drawer.Items>
    </Drawer>
  );
};

export default TransactionDrawer;
