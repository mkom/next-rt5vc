import { IoCheckmarkDoneCircleSharp, IoCloseCircle, IoBookmark } from 'react-icons/io5';
import { IoPrism } from 'react-icons/io5';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { FaRegArrowAltCircleDown, FaRegArrowAltCircleUp, FaExchangeAlt } from 'react-icons/fa';

export const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'Lunas':
      return <IoCheckmarkDoneCircleSharp className="text-success h-5 w-5" />;
    case 'Belum Bayar':
      return <IoCloseCircle className="text-error h-5 w-5" />;
    case 'TBD':
      return <IoBookmark className="text-info h-5 w-5" />;
    case 'Bayar Sebagian':
      return <IoPrism className="text-warning h-5 w-5" />;
    default:
      return null;
  }
};

export const getBooleanStatusIcon = (value) => {
  switch (value) {
    case true:
      return <IoCheckmarkDoneCircleSharp className="text-success h-5 w-5" />;
    case false:
      return <IoCloseCircle className="text-error h-5 w-5" />;
    default:
      return null;
  }
};

export const getTransactionStatusIcon = (status) => {
  switch (status) {
    case 'berhasil':
      return <FaCheckCircle className="text-success h-4 w-4" />;
    case 'gagal':
      return <FaTimesCircle className="text-error h-4 w-4" />;
    case 'sedang dicek':
      return <FaHourglassHalf className="text-warning h-4 w-4" />;
    default:
      return null;
  }
};

export const getTransactionTypeIcon = (type) => {
  switch (type) {
    case 'income':
      return <FaRegArrowAltCircleDown className="text-success h-5 w-5" />;
    case 'expense':
      return <FaRegArrowAltCircleUp className="text-error h-5 w-5" />;
    case 'ipl':
      return <FaExchangeAlt className="text-success h-5 w-5" />;
    default:
      return null;
  }
};
