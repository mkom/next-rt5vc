import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import { formatCurrency } from '../../utils/format';
import { getCategoryLabel, parseProofUrls, toDisplayUrl } from '../../utils/transactionHelpers';
import moment from 'moment-timezone';
import Link from 'next/link';

/**
 * DetailItem Component
 * Row item untuk detail modal
 */
const DetailItem = ({ label, value, capitalize, isHtml = false }) => (
  <div className="grid grid-cols-3 gap-2 text-sm items-start">
    <p className="text-base-content/60 font-medium">{label}</p>
    {isHtml ? (
      <div 
        className={`col-span-2 text-base-content font-semibold text-right ${capitalize ? 'capitalize' : ''}`}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    ) : (
      <p className={`col-span-2 text-base-content font-semibold text-right ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    )}
  </div>
);

/**
 * ProofOfTransfer Component
 * Menampilkan bukti transfer (image/PDF)
 */
const ProofOfTransfer = ({ urls, onZoom }) => {
  const urlArray = parseProofUrls(urls);
  
  if (urlArray.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-sm text-base-content/60 mb-2">Bukti Transfer</p>
      <div className="flex flex-wrap gap-2">
        {urlArray.map((url, i) => {
          const isPdf = url.toLowerCase().includes('.pdf');
          const displayUrl = toDisplayUrl(url);
          
          return isPdf ? (
            <a 
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[100px] h-[100px] flex flex-col items-center justify-center border rounded-xl bg-base-200 text-base-content/50 text-xs gap-1 hover:bg-base-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>PDF</span>
            </a>
          ) : (
            <img 
              key={i}
              src={displayUrl}
              alt={`Bukti ${i + 1}`}
              className="w-[100px] h-[100px] object-cover rounded-xl border cursor-zoom-in hover:opacity-90 transition-opacity"
              onClick={() => onZoom?.({ src: displayUrl, isPdf: false })}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * ZoomedImage Component
 * Portal untuk zoom image
 */
const ZoomedImage = ({ file, onClose }) => {
  if (!file) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl leading-none font-bold hover:text-white/70 transition-colors"
      >
        ×
      </button>
      {file.isPdf ? (
        <iframe 
          src={file.src} 
          className="w-[90vw] h-[90vh] rounded shadow-lg bg-base-100" 
          title="PDF Preview" 
        />
      ) : (
        <img 
          src={file.src} 
          alt="Zoom" 
          className="max-w-[90vw] max-h-[90vh] rounded shadow-lg object-contain"
          onClick={onClose}
        />
      )}
    </div>,
    document.body
  );
};

/**
 * CashflowModal Component
 * Modal detail transaksi
 * 
 * @param {Object} props
 * @param {Object} props.transaction - Data transaksi
 * @param {boolean} props.isOpen - Status modal terbuka
 * @param {Function} props.onClose - Handler tutup modal
 */
const CashflowModal = ({ transaction, isOpen, onClose }) => {
  const [zoomedFile, setZoomedFile] = useState(null);

  if (!isOpen || !transaction) return null;

  const isExpense = transaction.transaction_type === 'expense';
  const hasAttachment = transaction.attachment?.attachment_url;
  const hasProof = transaction.proof_of_transfer;
  const hasNote = transaction.additional_note_mutasi_bca;

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      >
        <div 
          className="bg-base-100 w-full sm:w-[500px] max-h-[85vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-200">
            <div>
              <h3 className="font-extrabold text-lg text-base-content">Detail Transaksi</h3>
              <p className="text-xs text-base-content/50 font-mono mt-0.5">
                {transaction.transaction_id}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/60 hover:text-base-content active:scale-90 transition-all"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Amount Display */}
          <div className="flex flex-col items-center justify-center py-4 bg-base-200/50 rounded-2xl mb-6">
            <p className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider mb-1">
              Nominal
            </p>
            <p className={`text-2xl font-extrabold ${isExpense ? 'text-error' : 'text-success'}`}>
              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
            </p>
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${
              isExpense ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
            }`}>
              {getCategoryLabel(transaction)}
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex flex-col gap-3">
            <DetailItem label="Deskripsi" value={transaction.description} />
            <DetailItem 
              label="Tanggal" 
              value={moment(transaction.date).locale('id').format('D MMMM YYYY')} 
            />
            <DetailItem 
              label="Tipe Pembayaran" 
              value={transaction.payment_type} 
              capitalize 
            />
            
            {/* Attachment Link */}
            {hasAttachment && (
              <div className="mt-2">
                <p className="text-sm text-base-content/60 mb-2">Dokumen</p>
                <Link 
                  href={transaction.attachment.attachment_url}
                  target="_blank"
                  className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors"
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                  <span className="truncate">
                    {transaction.attachment.attachment_title || 'Lihat Dokumen'}
                  </span>
                </Link>
              </div>
            )}

            {/* Proof of Transfer */}
            {hasProof && (
              <ProofOfTransfer 
                urls={transaction.proof_of_transfer} 
                onZoom={setZoomedFile}
              />
            )}

            {/* Additional Note */}
            {hasNote && (
              <div className="mt-2 bg-warning/10 border border-warning/20 p-3 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-warning tracking-wider mb-1">
                  Catatan BCA
                </p>
                <p className="text-xs text-warning-content leading-relaxed">
                  {transaction.additional_note_mutasi_bca}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zoomed Image Portal */}
      <ZoomedImage 
        file={zoomedFile} 
        onClose={() => setZoomedFile(null)} 
      />
    </>
  );
};

export default CashflowModal;
