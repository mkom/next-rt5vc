import moment from 'moment';
import 'moment-timezone';

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

export const formatDate = (dateString) =>
  moment.tz(dateString, 'Asia/Jakarta').format('DD/MM/YY');

export const formatPeriodLabel = (yearMonth) =>
  moment(yearMonth, 'YYYY-MM').format('MMMM YYYY');
