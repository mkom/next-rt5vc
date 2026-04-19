import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'moment/locale/id';
import id from 'date-fns/locale/id';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
moment.locale('id');

/**
 * FilterTransactions - Date range picker for filtering transactions
 *
 * Features:
 * - Date range selection with calendar picker
 * - Clear button to reset filter
 * - Proper session authentication
 * - Consistent styling with app-input class
 * - Loading state during fetch
 * - Fixed z-index for calendar popup
 *
 * @param {Object} props
 * @param {Array} props.dateRange - Current date range [startDate, endDate]
 * @param {Function} props.onChange - Handler when date range changes locally
 * @param {Function} props.onDateRangeChange - Handler when date range is applied (fetches data)
 * @param {Array} props.initialTransactions - Original unfiltered transactions for reset
 */
const FilterTransactions = ({
  dateRange,
  onChange,
  onDateRangeChange,
  initialTransactions,
}) => {
  const { data: session } = useSession();
  const [startDate, endDate] = dateRange || [null, null];
  const [loading, setLoading] = useState(false);

  const handleDateRangeChange = useCallback(
    async (update) => {
      const [newStartDate, newEndDate] = update;

      // Always update local state first
      onChange?.(update);

      // If both dates are null, reset to initial transactions
      if (newStartDate === null && newEndDate === null) {
        onDateRangeChange?.(initialTransactions || []);
        return;
      }

      // Only fetch if both dates are selected
      if (newStartDate && newEndDate) {
        setLoading(true);
        try {
          const startDateAdjusted = new Date(newStartDate);
          const endDateAdjusted = new Date(newEndDate);
          endDateAdjusted.setDate(endDateAdjusted.getDate() + 1);

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/filter`,
            {
              headers: {
                Authorization: `Bearer ${session?.accessToken}`,
              },
              params: {
                startDate: startDateAdjusted.toISOString(),
                endDate: endDateAdjusted.toISOString(),
              },
            }
          );

          const transactions =
            response.data.data?.transactions?.sort((a, b) => {
              return new Date(b.date) - new Date(a.date);
            }) || [];

          onDateRangeChange?.(transactions);
        } catch (error) {
          console.error('Error fetching filtered transactions:', error);
          // On error, keep current data but log the error
        } finally {
          setLoading(false);
        }
      }
    },
    [session, onChange, onDateRangeChange, initialTransactions]
  );

  const handleClear = useCallback(() => {
    onChange?.([null, null]);
    onDateRangeChange?.(initialTransactions || []);
  }, [onChange, onDateRangeChange, initialTransactions]);

  const hasValue = startDate || endDate;

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <FaCalendarAlt
          className={`absolute left-3 h-4 w-4 ${loading ? 'animate-pulse text-primary' : 'text-base-content/40'}`}
        />
        <DatePicker
          locale={id}
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateRangeChange}
          placeholderText="Rentang Tanggal"
          dateFormat="dd/MM/yy"
          isClearable={false}
          disabled={loading}
          className="app-input pl-10 pr-10 w-full text-sm cursor-pointer relative z-50"
          aria-label="Filter by date range"
          popperContainer={({ children }) => <div className="absolute z-[9999]">{children}</div>}
          portalId="datepicker-portal"
        />
        {hasValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full hover:bg-base-200 transition-colors touch-target-sm"
            aria-label="Clear date filter"
            title="Clear date filter"
          >
            <FaTimes className="h-3 w-3 text-base-content/40" />
          </button>
        )}
      </div>
      {loading && (
        <span className="absolute -bottom-5 left-0 text-[10px] text-primary animate-pulse">
          Memuat data...
        </span>
      )}
    </div>
  );
};

export default FilterTransactions;
