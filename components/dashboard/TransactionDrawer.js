// components/TransactionDrawer.js
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaCalendarAlt, FaRegArrowAltCircleDown, FaRegArrowAltCircleUp, FaExchangeAlt } from 'react-icons/fa';
import { AiOutlineLoading } from "react-icons/ai";
import axios from 'axios';
import Autocomplete from '../Autocomplete';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { selectStyles } from '@/utils/selectStyles';
import moment from 'moment';
import id from "date-fns/locale/id";
import { useRequireAuth } from '@/utils/authUtils';
import Drawer from '../ui/Drawer';
import FormField from '../ui/FormField';

const optionsType = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
];

const optionsCategory = [
  { value: 'Rutin', label: 'Rutin' },
  { value: 'Lain - Lain', label: 'Lain - Lain' },
  { value: 'Fasilitas Sosial', label: 'Fasilitas Sosial' },
  { value: 'Fasilitas Umum', label: 'Fasilitas Umum' },
];

const optionsStatus = [
  { value: 'berhasil', label: 'Berhasil' },
  { value: 'gagal', label: 'Gagal' },
  { value: 'sedang dicek', label: 'Sedang dicek' },
];

const TransactionDrawer = ({ isOpen, onClose, onSubmit, transactionType, transactionToEdit }) => {
  const { useAuthRedirectDashboard } = useRequireAuth(['admin', 'editor', 'superadmin']);
  useAuthRedirectDashboard();

  const [houseId, setHouseId] = useState('');
  const [houseName, setHouseName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentTitle, setAttachmentTitle] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [additional_note_mutasi_bca, setAdditional_note_mutasi_bca] = useState('');
  const [reason_cancellation, setReason_cancellation] = useState('');
  const [proofOfTransfer, setProofOfTransfer] = useState('');
  const [relatedMonths, setRelatedMonths] = useState([]);
  const [status, setStatus] = useState('berhasil');
  const [houses, setHouses] = useState([]);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const { data: session } = useSession();
  const [errors, setErrors] = useState({});
  const [uploadUrl, setUploadUrl] = useState('');
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [zoomedFile, setZoomedFile] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [filePreviewUrls, setFilePreviewUrls] = useState([]);

  useEffect(() => {
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setFilePreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [selectedFiles]);
  const [formattedMonths, setFormattedMonths] = useState([]);
  const [lastPaidIPl, setLastPaidIPl] = useState(null);
  const [feeIPl, setFeeIPl] = useState(0);
  const [noteCancel, setNoteCancel] = useState(false);
  const [trxCategory, setTrxCategory] = useState('');
  const [noWa, setNowa] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      const formattedMonth = transactionToEdit.related_months.map((month) => {
        const date = new Date(month + '-01');
        const label = moment(date).format('MMMM YYYY');
        return { value: month, label };
      });
      setFormattedMonths(formattedMonth);
    }
  }, [transactionToEdit]);

  useEffect(() => {
    if (formattedMonths !== null) {
      setRelatedMonths(formattedMonths || []);
    }
  }, [formattedMonths]);

  const fetchIPlStatus = useCallback(async (currentHouseId) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl/${currentHouseId.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      const dataMonthlyFees = res.data.data.monthly_fees;
      const paidMonths = dataMonthlyFees
        .filter(item => item.status === "Lunas" || item.status === "TBD")
        .sort((a, b) => new Date(b.month) - new Date(a.month));
      if (paidMonths.length > 0) {
        setFeeIPl(paidMonths[0].fee);
        setLastPaidIPl(paidMonths[0].month);
      }
    } catch (error) {
      console.error('Error fetching IPL status:', error);
    }
  }, [session]);

  useEffect(() => {
    if (transactionToEdit) {
      fetchIPlStatus(transactionToEdit.house_id ? transactionToEdit.house_id.house_id : '');
      setHouseId(transactionToEdit.house_id ? transactionToEdit.house_id.house_id : '');
      setHouseName(transactionToEdit.house_id ? transactionToEdit.house_id.house_id : '');
      setAmount(transactionToEdit.amount || '');
      setDescription(transactionToEdit.description || '');
      setAttachmentTitle(transactionToEdit.attachment.attachment_title || '');
      setAttachmentUrl(transactionToEdit.attachment.attachment_url || '');
      setAdditional_note_mutasi_bca(transactionToEdit.additional_note_mutasi_bca || '');
      setProofOfTransfer(Array.isArray(transactionToEdit.proof_of_transfer) ? transactionToEdit.proof_of_transfer[0] : transactionToEdit.proof_of_transfer || '');
      setPaymentDate(transactionToEdit.date || '');
      setStatus(transactionToEdit.status ? { value: transactionToEdit.status, label: transactionToEdit.status } : '');
      setPaymentType(transactionToEdit.payment_type ? { value: transactionToEdit.payment_type, label: transactionToEdit.payment_type } : '');
      setTrxCategory(transactionToEdit.transaction_category ? { value: transactionToEdit.transaction_category, label: transactionToEdit.transaction_category } : '');
      setNowa(transactionToEdit.whatsapp_notification || '');
    }
  }, [transactionToEdit]);

  useEffect(() => {
    if (session) {
      const fetchHouses = async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          setHouses(res.data.data.map(house => ({
            value: house.house_id,
            label: house.house_id,
            whatsapp_number: house.whatsapp_number,
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
      setTrxCategory({ value: 'Rutin', label: 'Rutin' });
      if (relatedMonths.length > 0 && houseName) {
        const monthLabels = relatedMonths.map(o => moment(o.value, "YYYY-MM").format("MMMM YYYY")).join(', ');
        setDescription(`IPL ${houseName} periode ${monthLabels}`);
      }
    }
  }, [houseId, relatedMonths, transactionType, houseName]);

  useEffect(() => {
    if (transactionToEdit) {
      setUploadUrl(Array.isArray(transactionToEdit.proof_of_transfer) ? transactionToEdit.proof_of_transfer : transactionToEdit.proof_of_transfer);
    }
  }, [transactionToEdit]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prev => {
        const merged = [...prev, ...files];
        setProofOfTransfer(merged[0]);
        return merged;
      });
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${session?.accessToken}` },
      });
      setUploadUrl(response.data.fileUrl);
      return response.data.fileUrl;
    } catch (error) {
      setAlertMessage('Gagal mengupload file.');
      resetForm();
      onClose();
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!transactionType) newErrors.transactionType = 'Tipe transaksi wajib diisi';
    if (!amount || amount <= 0) newErrors.amount = 'Jumlah harus lebih dari 0';
    if (!description) newErrors.description = 'Deskripsi wajib diisi';
    if (!paymentDate) newErrors.paymentDate = 'Tanggal pembayaran wajib diisi';
    if (!paymentType) newErrors.paymentType = 'Tipe pembayaran wajib diisi';
    if (!trxCategory) newErrors.trxCategory = 'Kategori wajib diisi';
    if (!status) newErrors.status = 'Status wajib diisi';
    if (transactionType === 'ipl' && !houseId) newErrors.houseId = 'No Rumah wajib diisi';
    if (paymentType === 'transfer' && !proofOfTransfer) newErrors.proofOfTransfer = 'Bukti transfer wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true);

    let proofOfTransferUrl = uploadUrl;
    if (selectedFiles.length > 0) {
      const urls = [];
      for (const file of selectedFiles) {
        const url = await handleFileUpload(file);
        if (!url) return;
        urls.push(url);
      }
      proofOfTransferUrl = urls;
    }

    const dateString = relatedMonths.map(o => o.value).join(', ');
    const dateArray = dateString.split(', ').map(d => d.trim());

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
      reason_cancellation,
      transaction_category: trxCategory.value,
      whatsapp_notification: noWa,
    };

    onSubmit(newTransaction);
    resetForm();
    setIsProcessing(false);
    onClose();
  };

  const handleHouseSelect = (selectedHouse) => {
    resetForm();
    setHouseId(selectedHouse.value);
    setHouseName(selectedHouse.label);
    setNowa(selectedHouse?.whatsapp_number || '');
    fetchIPlStatus(selectedHouse.value);
  };

  const handleMonthChange = (selectedOptions) => {
    setRelatedMonths(selectedOptions || []);
    setAmount(feeIPl * selectedOptions.length);
  };

  const generateMonthsOptions = () => {
    const lastPaid = lastPaidIPl || "2024-06";
    const options = [];
    let nextMonth = moment(lastPaid, "YYYY-MM").add(1, 'month');
    const startYear = nextMonth.year();
    let startMonthIndex = nextMonth.month();
    const endYear = startYear + 1;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = startMonthIndex; month < 12; month++) {
        const value = moment().month(month).year(year).format("YYYY-MM");
        const label = moment().month(month).year(year).format("MMMM YYYY");
        if (!relatedMonths.some(m => m.value === value)) {
          options.push({ value, label });
        }
      }
      startMonthIndex = 0;
    }
    return options;
  };

  const handleStatusChange = (e) => {
    setStatus(e);
    if (e.value === 'gagal') setNoteCancel(true);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors({});
    setIsProcessing(false);
    setSelectedFiles([]);
    setLastPaidIPl(null);
    setStatus('');
    setTrxCategory('');
    setNowa('');
  };

  const toDisplayUrl = (url) => {
    if (!url) return url;
    if (url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com')) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const titleMap = {
    ipl: 'Transaksi IPL',
    income: 'Transaksi Masuk',
    expense: 'Transaksi Keluar',
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={() => { resetForm(); onClose(); }}
        title={titleMap[transactionType] || 'Transaksi'}
        icon={<FaExchangeAlt className="h-5 w-5 text-primary" />}
      >
          <div className="space-y-4">
            {alertMessage && (
              <div className="alert alert-error">
                <span>{alertMessage}</span>
                <button onClick={() => setAlertMessage('')} className="btn btn-ghost btn-xs">x</button>
              </div>
            )}
            {/* Edit info */}
            {transactionToEdit && (
              <div className="bg-base-200 rounded-lg p-3 text-sm space-y-1">
                <div className="flex gap-2"><span className="text-base-content/60">Dibuat oleh:</span><span>{transactionToEdit.created_by[0]?.email || ''}</span></div>
                <div className="flex gap-2"><span className="text-base-content/60">Tanggal:</span><span>{transactionToEdit.created_at}</span></div>
                <div className="flex gap-2"><span className="text-base-content/60">WhatsApp:</span><span>{transactionToEdit.whatsapp_notification}</span></div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* No Rumah */}
              {transactionType !== 'expense' && transactionType !== 'income' && (
                <FormField label="No Rumah" error={errors.houseId}>
                  <Autocomplete
                    value={houseId}
                    onChange={setHouseId}
                    options={houses}
                    onSelect={handleHouseSelect}
                  />
                  {lastPaidIPl && (
                    <p className="text-xs pt-1 text-base-content/60">
                      IPL Terakhir: {moment(lastPaidIPl, "YYYY-MM").format("MMMM YYYY")}
                    </p>
                  )}
                  {noWa && (
                    <p className="text-xs pt-1 text-base-content/60">WhatsApp: {noWa}</p>
                  )}
                </FormField>
              )}

              {/* Periode */}
              {transactionType === 'ipl' && (
                <FormField label="Periode" error={errors.relatedMonths}>
                  <Select
                    isMulti
                    options={generateMonthsOptions()}
                    value={relatedMonths}
                    onChange={handleMonthChange}
                    placeholder="Pilih bulan"
                    styles={selectStyles}
                    isSearchable={false}
                  />
                </FormField>
              )}

              {/* Deskripsi */}
              <FormField label="Deskripsi" error={errors.description}>
                <textarea
                  className="textarea textarea-bordered textarea-sm w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Masukkan deskripsi"
                  readOnly={transactionType === 'ipl'}
                  rows={3}
                />
              </FormField>

              {/* Kategori */}
              <FormField label="Kategori" error={errors.trxCategory}>
                <Select
                  isSearchable={false}
                  options={optionsCategory}
                  value={trxCategory}
                  onChange={setTrxCategory}
                  placeholder="Kategori"
                  styles={selectStyles}
                />
              </FormField>

              {/* Jumlah */}
              <FormField label="Jumlah" error={errors.amount}>
                <input
                  type="number"
                  className="input input-bordered input-sm w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Masukkan jumlah"
                />
              </FormField>

              {/* Tipe Pembayaran */}
              <FormField label="Tipe Pembayaran" error={errors.paymentType}>
                <Select
                  isSearchable={false}
                  options={optionsType}
                  value={paymentType}
                  onChange={setPaymentType}
                  placeholder="Cash atau Transfer"
                  styles={selectStyles}
                />
              </FormField>

              {/* Lampiran */}
              <FormField label="Lampiran" error={errors.proofOfTransfer}>
                <input
                  type="file"
                  className="file-input file-input-bordered file-input-sm w-full"
                  onChange={handleFileChange}
                  accept=".jpg,.png,.pdf,.jpeg"
                  ref={fileInputRef}
                  multiple
                />
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, i) => {
                      const isPdf = file.type === 'application/pdf';
                      const src = filePreviewUrls[i];
                      const removeFile = (e) => {
                        e.stopPropagation();
                        setSelectedFiles(prev => {
                          const updated = prev.filter((_, idx) => idx !== i);
                          setProofOfTransfer(updated[0] ?? '');
                          return updated;
                        });
                      };
                      return (
                        <div key={i} className="relative">
                          {isPdf ? (
                            <div
                              onClick={() => setZoomedFile({ src, isPdf: true })}
                              className="w-[100px] h-[100px] flex flex-col items-center justify-center border rounded-lg cursor-pointer bg-base-200 text-base-content/60 text-xs gap-1"
                            >
                              <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                              <span className="truncate w-full text-center px-1">{file.name}</span>
                            </div>
                          ) : (
                            <img
                              src={src}
                              alt={`Preview ${i + 1}`}
                              className="w-[100px] h-[100px] object-cover rounded-lg border cursor-zoom-in"
                              onClick={() => setZoomedFile({ src, isPdf: false })}
                            />
                          )}
                          <button
                            onClick={removeFile}
                            className="absolute -top-1 -right-1 btn btn-error btn-xs btn-circle text-xs"
                          >×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedFiles.length === 0 && uploadUrl && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Array.isArray(uploadUrl) ? uploadUrl : uploadUrl.split(/,(?=https?:\/\/)/).map(u => u.trim())).map((url, i) => {
                      const isPdf = url.toLowerCase().includes('.pdf');
                      const displayUrl = toDisplayUrl(url);
                      return isPdf ? (
                        <div
                          key={i}
                          onClick={() => setZoomedFile({ src: url, isPdf: true })}
                          className="w-[100px] h-[100px] flex flex-col items-center justify-center border rounded-lg cursor-pointer bg-base-200 text-base-content/60 text-xs gap-1"
                        >
                          <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          <span className="text-center px-1">PDF</span>
                        </div>
                      ) : (
                        <img
                          key={i}
                          src={displayUrl}
                          alt={`image ${i + 1}`}
                          className="w-[100px] h-[100px] object-cover rounded-lg border cursor-zoom-in"
                          onClick={() => setZoomedFile({ src: displayUrl, isPdf: false })}
                        />
                      );
                    })}
                  </div>
                )}
              </FormField>

              {/* Tanggal Pembayaran */}
              <FormField label="Tanggal Pembayaran" error={errors.paymentDate}>
                <div className="relative flex items-center input input-bordered w-full px-3 py-0">
                  <FaCalendarAlt className="text-base-content/40 mr-2 shrink-0" />
                  <DatePicker
                    locale={id}
                    selected={paymentDate}
                    onChange={(date) => setPaymentDate(date)}
                    dateFormat="dd MMMM yyyy"
                    placeholderText="Pilih tanggal"
                    className="bg-transparent w-full text-sm py-[0.6rem] focus:outline-none"
                  />
                </div>
              </FormField>

              {/* Catatan */}
              <FormField label="Catatan">
                <textarea
                  className="textarea textarea-bordered textarea-sm w-full"
                  value={additional_note_mutasi_bca}
                  onChange={(e) => setAdditional_note_mutasi_bca(e.target.value)}
                  placeholder="Catatan tambahan"
                  rows={2}
                />
              </FormField>

              {/* Status */}
              <FormField label="Status" error={errors.status}>
                <Select
                  isSearchable={false}
                  options={optionsStatus}
                  value={status}
                  onChange={handleStatusChange}
                  placeholder="Status"
                  styles={selectStyles}
                />
              </FormField>

              {/* Alasan pembatalan */}
              {noteCancel && status?.value === 'gagal' && (
                <FormField label="Alasan Pembatalan">
                  <textarea
                    className="textarea textarea-bordered textarea-sm w-full"
                    value={reason_cancellation}
                    onChange={(e) => setReason_cancellation(e.target.value)}
                    placeholder="Alasan pembatalan"
                    rows={2}
                  />
                </FormField>
              )}

              {/* Dokumen tambahan */}
              {transactionType !== 'ipl' && (
                <div className="card bg-base-200 p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Dokumen Tambahan</h3>
                  <FormField label="Judul Dokumen">
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={attachmentTitle}
                      onChange={(e) => setAttachmentTitle(e.target.value)}
                      placeholder="Judul"
                    />
                  </FormField>
                  <FormField label="URL Dokumen">
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      placeholder="Link URL"
                    />
                  </FormField>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pb-10 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`btn flex-1 ${
                    transactionType === 'ipl' ? 'btn-success' :
                    transactionType === 'income' ? 'btn-primary' :
                    'btn-error'
                  }`}
                >
                  {isProcessing && <AiOutlineLoading className="h-4 w-4 animate-spin" />}
                  {transactionType === 'ipl' && <FaExchangeAlt className="h-4 w-4" />}
                  {transactionType === 'income' && <FaRegArrowAltCircleDown className="h-4 w-4" />}
                  {transactionType === 'expense' && <FaRegArrowAltCircleUp className="h-4 w-4" />}
                  Simpan
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { resetForm(); onClose(); }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
      </Drawer>

      {/* Image/PDF zoom modal */}
      {zoomedFile && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <button
            onClick={() => setZoomedFile(null)}
            className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost text-white text-xl"
          >✕</button>
          {zoomedFile.isPdf ? (
            <iframe
              src={zoomedFile.src}
              className="w-[90vw] h-[90vh] rounded-lg shadow-xl bg-base-100"
              title="PDF Preview"
            />
          ) : (
            <img
              src={zoomedFile.src}
              alt="Zoom"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
              onClick={() => setZoomedFile(null)}
            />
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default TransactionDrawer;
