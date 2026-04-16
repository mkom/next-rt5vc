import { getSession, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaRegEnvelope, FaWhatsapp } from 'react-icons/fa';

import DashboardLayout from '../../components/layouts/DashboardLayout';
import Spinner from '../../components/Spinner';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Drawer from '../../components/ui/Drawer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import { formatCurrency } from '../../utils/format';
import LetterPreview from '@/components/LetterPreview.js';
import WhatsAppMessage from '@/components/WhatsAppMessage.js';

const ITEMS_PER_PAGE = 30;

const Bills = ({ initialHouses }) => {
  const { data: session } = useSession();
  const [houses, setHouses] = useState(initialHouses ?? []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchHouses = useCallback(async () => {
    if (session) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, {});
        const sorted = res.data.data.sort((a, b) => b.total_fee - a.total_fee);
        setHouses(sorted);
        setTotalHouses(res.data.total);
        setTotalAmount(res.data.total_amount);
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

  const handleEditClick = (data) => {
    setIsDrawerOpen(true);
    setDetailData(data);
  };

  const handleWhatsAppClick = (data) => {
    setIsWhatsAppDrawerOpen(true);
    setDetailData(data);
  };

  const filteredHouses = Array.isArray(houses)
    ? houses.filter((house) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          searchTermLower === '' ||
          house?.resident_name?.toLowerCase().includes(searchTermLower) ||
          house?.house_id?.toLowerCase().includes(searchTermLower)
        );
      })
    : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);

  const columns = [
    { label: 'No', className: 'w-4' },
    { label: 'Rumah', className: 'w-14' },
    { label: 'Nama', className: 'w-28' },
    { label: 'Periode', className: 'w-80' },
    { label: 'Total', className: 'w-16' },
    { label: 'Jumlah', className: 'w-16 text-right' },
    { label: '', className: 'w-20' },
  ];

  const renderPeriodBadges = (house) => (
    <span className="flex flex-wrap gap-1">
      {house.periods.map((period, subindex) => {
        const status = house.monthly_status.find((s) => s.month === period)?.status;
        const badgeClass = status === 'Weekend' ? 'badge-secondary' : 'badge-error';
        return (
          <span key={subindex} className={`badge badge-xs ${badgeClass}`}>
            {moment(period, 'YYYY-MM').format('MMMM YYYY')}
          </span>
        );
      })}
    </span>
  );

  const renderActionButtons = (house) => (
    <div className="join">
      <button className="join-item btn btn-ghost btn-xs" onClick={() => handleEditClick(house)}>
        <FaRegEnvelope className="h-4 w-4" />
        <span>Surat</span>
      </button>
      <button className="join-item btn btn-ghost btn-xs" onClick={() => handleWhatsAppClick(house)}>
        <FaWhatsapp className="h-4 w-4" />
        <span>WA</span>
      </button>
    </div>
  );

  const renderDesktopRow = (house, index) => (
    <tr key={index}>
      <td>{offset + index + 1}</td>
      <td>{house.house_id}</td>
      <td>{house.resident_name}</td>
      <td>{renderPeriodBadges(house)}</td>
      <td>{house.periods.length} Bulan</td>
      <td className="text-right">{formatCurrency(house.total_fee)}</td>
      <td>{renderActionButtons(house)}</td>
    </tr>
  );

  const renderMobileCard = (house, index) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <span className="font-semibold">{house.house_id}</span>{' '}
          <span className="text-base-content/70">{house.resident_name}</span>
        </div>
      </div>
      <div>{renderPeriodBadges(house)}</div>
      <div className="flex justify-between items-center">
        <span className="text-sm">
          {house.periods.length} Bln {formatCurrency(house.total_fee)}
        </span>
        {renderActionButtons(house)}
      </div>
    </div>
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="mb-3 flex justify-between items-center gap-3 w-full">
        <div className="w-full md:w-1/2">
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setCurrentPage(0);
              setSearchTerm(val);
            }}
          />
        </div>
      </div>

      <div className="text-right text-sm mb-3">
        Jumlah Keseluruhan: <span className="font-semibold">{formatCurrency(totalAmount)}</span>
      </div>

      <ResponsiveTable
        data={currentPageData}
        columns={columns}
        renderDesktopRow={renderDesktopRow}
        renderMobileCard={renderMobileCard}
        emptyMessage="Tidak ada tagihan"
      />

      <Pagination
        pageCount={Math.ceil(filteredHouses.length / ITEMS_PER_PAGE)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Preview"
        icon={<FaRegEnvelope className="h-4 w-4" />}
        width="lg"
      >
        {detailData && <LetterPreview data={detailData} />}
      </Drawer>

      <Drawer
        isOpen={isWhatsAppDrawerOpen}
        onClose={() => setIsWhatsAppDrawerOpen(false)}
        title="Pesan WhatsApp"
        width="lg"
      >
        {detailData && <WhatsAppMessage data={detailData} />}
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/', permanent: false } };
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
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

Bills.getLayout = (page) => (
  <DashboardLayout title="Tagihan Berjalan">{page}</DashboardLayout>
);

export default Bills;
