import { getSession, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { selectStyles } from '../../../utils/selectStyles';
import moment from 'moment';
import Link from 'next/link';
import { IoCheckmarkDoneCircleSharp, IoCloseCircle, IoBookmark } from 'react-icons/io5';
import { IoPrism } from 'react-icons/io5';
import { FaCalendarCheck } from 'react-icons/fa';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import SearchInput from '../../../components/ui/SearchInput';
import Pagination from '../../../components/ui/Pagination';
import ResponsiveTable from '../../../components/ui/ResponsiveTable';
import Spinner from '../../../components/Spinner';
import MonthOptions from '../../../components/MonthOptions.js';

import { formatCurrency, formatDate } from '../../../utils/format';
import { getPaymentStatusIcon } from '../../../utils/statusIcons';
import { ZONE_OPTIONS, STATUS_IPL_OPTIONS, ITEMS_PER_PAGE } from '../../../utils/constants';

const Ipl = ({ initialHouses }) => {
  const { data: session } = useSession();
  const [houses, setHouses] = useState([initialHouses]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));
  const [monthly, setMonthly] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    setCurrentPage(0);
  };

  const fetchHouses = useCallback(async () => {
    if (session) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setHouses(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching houses data:', error);
        setLoading(false);
      }
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchHouses();
    }
  }, [session, fetchHouses]);

  const handleSearchChange = (value) => {
    setCurrentPage(0);
    setSearchTerm(value);
  };

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption.value);
    setCurrentPage(0);
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption.value);
    setCurrentPage(0);
  };

  const filteredHouses = Array.isArray(houses)
    ? houses.filter((house) => {
        const searchTermLower = searchTerm.toLowerCase();
        const selectedGroupLower = selectedGroup.toLowerCase();
        const monthlyStatus = house.monthly_status?.find(
          (status) => status.month === selectedPeriod
        );

        return (
          (searchTermLower === '' ||
            house?.resident_name?.toLowerCase().includes(searchTermLower) ||
            house?.house_id?.toLowerCase().includes(searchTermLower)) &&
          (selectedGroupLower === '' ||
            house?.group?.toLowerCase() === selectedGroupLower) &&
          (selectedStatus === '' ||
            house.monthly_fees.find((status) => status.month === selectedPeriod)
              ?.status === selectedStatus) &&
          house.monthly_fees?.length > 0 &&
          house.monthly_status?.length > 0 &&
          monthlyStatus &&
          (monthlyStatus.status === 'Isi' || monthlyStatus.status === 'Weekend')
        );
      })
    : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);

  const monthlyStatusCount = houses.reduce((acc, house) => {
    const monthlyFee = house.monthly_fees?.find(
      (status) => status.month === selectedPeriod
    );

    if (monthlyFee) {
      const { month, status, fee } = monthlyFee;

      acc[month] = acc[month] || {
        Lunas: 0,
        BelumBayar: 0,
        Tbd: 0,
        BayarSebagian: 0,
        totalFeeCollected: 0,
      };

      if (status === 'Lunas') {
        acc[month].Lunas++;
        acc[month].totalFeeCollected += fee || 0;
      } else if (status === 'Belum Bayar') {
        acc[month].BelumBayar++;
      } else if (status === 'TBD') {
        acc[month].Tbd++;
      } else if (status === 'Bayar Sebagian') {
        acc[month].totalFeeCollected += fee || 0;
        acc[month].BayarSebagian++;
      }
    }

    return acc;
  }, {});

  const getMonthlyFee = (house) =>
    house.monthly_fees.find((s) => s.month === selectedPeriod);

  const isWeekend = (house) =>
    house.monthly_status.find((s) => s.month === selectedPeriod)?.status ===
    'Weekend';

  const columns = [
    { label: 'No' },
    { label: 'Rumah' },
    { label: 'Nama', className: 'w-1/3' },
    { label: 'Tanggal', className: 'w-1/6' },
    { label: 'Nominal', className: 'w-1/6' },
    { label: 'Status', className: 'text-center w-1/4' },
    { label: 'Detail', className: 'w-1/6' },
  ];

  const renderDesktopRow = (house, index) => {
    const fee = getMonthlyFee(house);
    const feeStatus = fee?.status;
    const showAmount = feeStatus === 'Lunas' || feeStatus === 'Bayar Sebagian';

    return (
      <tr
        key={index}
        className={isWeekend(house) ? 'bg-secondary/20' : ''}
      >
        <td>{offset + index + 1}</td>
        <td>{house.house_id}</td>
        <td>{house.resident_name}</td>
        <td>
          {fee?.transaction_id?.date ? formatDate(fee.transaction_id.date) : '-'}
        </td>
        <td>{showAmount ? formatCurrency(fee?.fee) : '-'}</td>
        <td>
          <div className="flex justify-center items-center">
            {getPaymentStatusIcon(feeStatus)}
          </div>
        </td>
        <td>
          <Link
            href={`/ipl/${house.house_id.toLowerCase()}`}
            target="_blank"
            className="btn btn-ghost btn-xs"
          >
            Detail
          </Link>
        </td>
      </tr>
    );
  };

  const renderMobileCard = (house, index) => {
    const fee = getMonthlyFee(house);
    const feeStatus = fee?.status;
    const showAmount = feeStatus === 'Lunas' || feeStatus === 'Bayar Sebagian';

    return (
      <div className={isWeekend(house) ? 'bg-secondary/20 rounded-lg p-1' : ''}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">
            {house.house_id} {house.resident_name}
          </span>
          {getPaymentStatusIcon(feeStatus)}
        </div>
        <div className="flex justify-between items-center mt-1 text-sm text-base-content/70">
          <span>
            Tgl: {fee?.transaction_id?.date ? formatDate(fee.transaction_id.date) : '-'}
            {'  '}
            {showAmount ? formatCurrency(fee?.fee) : '-'}
          </span>
          <Link
            href={`/ipl/${house.house_id.toLowerCase()}`}
            target="_blank"
            className="btn btn-ghost btn-xs"
          >
            Detail
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-4 flex items-center text-base-content">
        <FaCalendarCheck className="mr-2 h-7 w-7" />
        <span>Data IPL</span>
      </h1>

      <div className="w-full md:w-2/4">
        <Select
          id="relatedMonths"
          options={MonthOptions(monthly)}
          value={MonthOptions(monthly).find(
            (option) => option.value === selectedPeriod
          )}
          onChange={handleMonthChange}
          placeholder="Pilih bulan"
          className="w-full"
          styles={selectStyles}
        />
      </div>

      <div className="join mt-3">
        <button className="join-item btn btn-ghost btn-xs gap-1">
          <IoCheckmarkDoneCircleSharp className="text-success h-4 w-4" />
          <span className="text-xs">
            Lunas / {monthlyStatusCount[selectedPeriod]?.Lunas || 0}
          </span>
        </button>
        <button className="join-item btn btn-ghost btn-xs gap-1">
          <IoCloseCircle className="text-error h-4 w-4" />
          <span className="text-xs">
            Belum Bayar / {monthlyStatusCount[selectedPeriod]?.BelumBayar || 0}
          </span>
        </button>
        <button className="join-item btn btn-ghost btn-xs gap-1">
          <IoBookmark className="text-info h-4 w-4" />
          <span className="text-xs">
            PGYB / {monthlyStatusCount[selectedPeriod]?.Tbd || 0}
          </span>
        </button>
        <button className="join-item btn btn-ghost btn-xs gap-1">
          <IoPrism className="text-warning h-4 w-4" />
          <span className="text-xs">
            Sebagian / {monthlyStatusCount[selectedPeriod]?.BayarSebagian || 0}
          </span>
        </button>
      </div>

      <span className="font-semibold block mt-3">
        {formatCurrency(monthlyStatusCount[selectedPeriod]?.totalFeeCollected || 0)}
      </span>

      <div className="mb-3 mt-5 flex flex-wrap gap-2 items-center w-full">
        <div className="flex-1 min-w-[120px]">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <Select
            id="group"
            options={ZONE_OPTIONS}
            value={ZONE_OPTIONS.find((option) => option.value === selectedGroup)}
            onChange={handleGroupChange}
            placeholder="Zona"
            className="text-sm"
            styles={selectStyles}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <Select
            id="status"
            options={STATUS_IPL_OPTIONS}
            value={STATUS_IPL_OPTIONS.find(
              (option) => option.value === selectedStatus
            )}
            onChange={handleStatusChange}
            placeholder="Status"
            className="text-sm"
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="mt-4">
        <ResponsiveTable
          data={currentPageData}
          columns={columns}
          renderDesktopRow={renderDesktopRow}
          renderMobileCard={renderMobileCard}
        />
      </div>

      <Pagination
        pageCount={Math.ceil(filteredHouses.length / ITEMS_PER_PAGE)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

Ipl.getLayout = (page) => (
  <DashboardLayout title="Data IPL">{page}</DashboardLayout>
);

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/', permanent: false } };
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL_V2}/ipl`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return {
      props: {
        initialHouses: res.data.data,
      },
    };
  } catch (error) {
    console.error('Error fetching houses data:', error);
    return {
      props: {
        initialHouses: [],
      },
    };
  }
};

export default Ipl;
