import { useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment';
import id from "date-fns/locale/id";
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { selectStyles } from '../../../utils/selectStyles';

const SetorRw = () => {
  const [relatedMonths, setRelatedMonths] = useState([]);
  const [months, setMonths] = useState([]);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [amount, setAmount] = useState('');

  const handleMonthChange = (selectedOptions) => {
    const months = selectedOptions.map(option => option.value);
    setMonths(months || []);
    setRelatedMonths(selectedOptions || []);
  };

  const generateMonthsOptions = () => {
    const first = "2024-06";
    const options = [];
    let nextMonth = moment(first, "YYYY-MM").add(1, 'month');
    let startYear = nextMonth.year();
    let startMonthIndex = nextMonth.month();
    let endYear = startYear + 1;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = startMonthIndex; month < 12; month++) {
        const value = moment().month(month).year(year).format("YYYY-MM");
        const label = moment().month(month).year(year).format("MMMM YYYY");
        if (!relatedMonths.some((m) => m.value === value)) {
          options.push({ value, label });
        }
      }
      startMonthIndex = 0;
    }
    return options;
  };

  return (
    <>
      <h1 className='text-xl mb-4 font-bold'>Setor</h1>
      <div className="card bg-base-100 shadow-sm border border-base-200 w-full">
        <div className="card-body">
          <form className="flex flex-col gap-4">
            <div>
              <label className="label pb-1"><span className="label-text font-medium">Periode IPL</span></label>
              <Select
                id="relatedMonths"
                isMulti
                options={generateMonthsOptions()}
                value={relatedMonths}
                onChange={handleMonthChange}
                placeholder="Pilih bulan"
                className="text-sm"
                isSearchable={false}
                styles={selectStyles}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="w-full">
                <label className="label pb-1"><span className="label-text font-medium">Tanggal Penarikan</span></label>
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
              </div>
              <div className="w-full">
                <label className="label pb-1"><span className="label-text font-medium">Jumlah</span></label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Masukkan jumlah"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-2">Proses</button>
          </form>
        </div>
      </div>
    </>
  );
};

SetorRw.getLayout = (page) => (
  <DashboardLayout title="Setor RW">{page}</DashboardLayout>
);

export default SetorRw;
