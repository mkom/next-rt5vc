// components/TransactionDrawer.js
import { getSession, useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Drawer, Button, Input, FileInput, Textarea, Label, TextInput, Dropdown,Alert } from 'flowbite-react';
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

const TransactionDrawer = ({ isOpen, onClose, onSubmit, transactionType,transactionToEdit }) => {
  
  const [houseId, setHouseId] = useState('');
  const [houseName, setHouseName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
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

  // Set nilai awal formulir jika ada transactionToEdit
  useEffect(() => {
    if (transactionToEdit) {
      setHouseId(transactionToEdit.houseId || '');
      setHouseName(transactionToEdit.houseName || '');
      setAmount(transactionToEdit.amount || '');
      setDescription(transactionToEdit.description || '');
      setProofOfTransfer(transactionToEdit.proof_of_transfer || '');
      setRelatedMonths(transactionToEdit.related_months || []);
      setPaymentDate(transactionToEdit.paymentDate || new Date());
      setStatus(transactionToEdit.status || 'berhasil');
      setPaymentType(transactionToEdit.payment_type || '');
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
          setHouses(res.data.map(house => ({
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
      if(relatedMonths.length > 0 && houseName ) {
        const monthLabels = relatedMonths.map(option => moment(option.value, "YYYY-MM").format("MMMM YYYY")).join(', ');
        const descriptionText = `IPL ${houseName} periode ${monthLabels}`;
        setDescription(descriptionText);
      }
     
    }
  }, [houseId, relatedMonths, transactionType]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setProofOfTransfer(file); // Set file for upload
    }
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
        setUploadUrl(response.data.url);
        return response.data.url;
    } catch (error) {
        //console.error('Error uploading file:', error);
        //alert('Failed to upload file.');
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



    //console.log(relatedMonths.map(option => option.value))
    const newTransaction = {
      transaction_type: transactionType,
      amount,
      description,
      proof_of_transfer: proofOfTransferUrl,
      houseId,
      payment_type: paymentType.value,
      related_months: dateArray,
      //relatedMonths:relatedMonths.map(option => moment(option.value, "YYYY-MM")).join(', '),
      paymentDate,
      status
    };

   // console.log(newTransaction)

    onSubmit(newTransaction);
    setHouseId('');
    setAmount('');
    setDescription('');
    setProofOfTransfer('');
    setRelatedMonths([]);
    setPaymentDate(new Date());
    setStatus('berhasil');
    fileInputRef.current.value = '';
    setPaymentType('');
    setIsProcessing(false); // Stop processing
    onClose();
  };

  useEffect(() => {
    if (transactionToEdit) {
      setHouseName(transactionToEdit.houseName);
    }
  }, [transactionToEdit]);


  const handleHouseChange = (newValue) => {
    setHouseId(newValue);
  };

  const handleHouseSelect = (selectedHouse) => {
    setHouseId(selectedHouse.value);
    setHouseName(selectedHouse.label)
    //setDescription(`IPL rumah ${selectedHouse.value} periode ${relatedMonths.join(', ')}`);
  };
  
  useEffect(() => {
    if (transactionToEdit) {
      setRelatedMonths(transactionToEdit.related_months || []);
    }
  }, [transactionToEdit]);


  const handleMonthChange = (selectedOptions) => {
    setRelatedMonths(selectedOptions || []);
  };

  const generateMonthsOptions = () => {
    const options = [];
    const startYear = moment().year();
    const endYear = startYear + 2; // 2 tahun ke depan

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const value = moment().month(month).year(year).format("YYYY-MM");
        const label = moment().month(month).year(year).format("MMMM YYYY");
        options.push({ value, label });
      }
    }
    return options;
  };

  const optionsType = [
    { value: 'cash', label: 'Cash' },
    { value: 'transfer', label: 'Transfer' },
  ]

  useEffect(() => {
    if (transactionToEdit) {
      setPaymentType(transactionToEdit.payment_type || '');
    }
  }, [transactionToEdit]);

  const handleTypeChange = (e) => {
    setPaymentType(e);
  };

  const resetForm = () => {
    setHouseId('');
    setAmount('');
    setDescription('');
    setProofOfTransfer('');
    setRelatedMonths([]);
    setPaymentDate(new Date());
    setStatus('berhasil');
    setPaymentType('');
    fileInputRef.current.value = '';
    setErrors({});
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {transactionType === 'ipl' && (
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
              </div>

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
            </>
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
            {/* {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>} */}
          </div>

          <div className="mb-6 mt-3">
              <Label htmlFor="proofOfTransfer" className="mb-2 block">Lampiran</Label>
              <FileInput 
                id="file" 
                onChange={handleFileChange} 
                accept=".jpg,.png,.pdf"
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
              {errors.proofOfTransfer && <div className="text-red-500 text-sm">{errors.proofOfTransfer}</div>}
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
