import { getSession, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import DashboardLayout from '../../components/layouts/DashboardLayout';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Drawer from '../../components/ui/Drawer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import Spinner from '../../components/Spinner';

import { getBooleanStatusIcon } from '../../utils/statusIcons';
import { ZONE_OPTIONS, STATUS_HOUSE_OPTIONS, ITEMS_PER_PAGE } from '../../utils/constants';
import { selectStyles } from '../../utils/selectStyles';

import { HiHome } from 'react-icons/hi';
import { FaRegEdit } from 'react-icons/fa';
import Link from 'next/link';

import Select from 'react-select';
import moment from 'moment';
import MonthOptions from '../../components/MonthOptions.js';

const Houses = ({ initialHouses }) => {
  const { data: session } = useSession();
  const [houses, setHouses] = useState(initialHouses);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));
  const [monthly, setMonthly] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    setCurrentPage(0);
  };

  const fetchHouses = useCallback(async () => {
    if (session) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, {
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

        return (
          (searchTermLower === '' ||
            house?.resident_name?.toLowerCase().includes(searchTermLower) ||
            house?.house_id?.toLowerCase().includes(searchTermLower)) &&
          (selectedGroupLower === '' || house?.group?.toLowerCase() === selectedGroupLower) &&
          (selectedStatus === '' ||
            house.monthly_status.find((status) => status.month === selectedPeriod)?.status ===
              selectedStatus)
        );
      })
    : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredHouses.slice(offset, offset + ITEMS_PER_PAGE);

  const handleEditClick = (house) => {
    setEditData(house);
    setIsDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleEditStatus = (month, newStatus, newMandatoryIpl, newMandatoryRt) => {
    const updatedMonthlyStatus = editData.monthly_status.map((status) => {
      if (status.month === month) {
        return { ...status, status: newStatus, mandatory_ipl: newMandatoryIpl, mandatory_rt: newMandatoryRt };
      }
      return status;
    });
    setEditData({ ...editData, monthly_status: updatedMonthlyStatus });
  };

  const handleFeeChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? '' : parseInt(value, 10);

    setEditData((prevState) => {
      const updatedFees = prevState.monthly_fees.map((feeData) => {
        if (feeData.month === selectedPeriod) {
          return { ...feeData, [name]: numericValue };
        }
        return feeData;
      });
      return { ...prevState, monthly_fees: updatedFees };
    });
  };

  const handleSaveChanges = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/houses/update/${editData._id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            period: selectedPeriod,
            zona: selectedGroup,
          },
        }
      );
      setHouses(
        houses.map((house) =>
          house._id === editData._id ? { ...house, ...res.data.data } : house
        )
      );
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error updating house data:', error);
    }
  };

  const monthlyStatusCount = houses.reduce((acc, house) => {
    const month = house.monthly_status?.find((status) => status.month === selectedPeriod)?.month;
    if (month) {
      acc[month] = acc[month] || { Isi: 0, Kosong: 0, Weekend: 0 };
      if (
        house.monthly_status?.find((status) => status.month === selectedPeriod)?.status === 'Isi'
      ) {
        acc[month].Isi++;
      } else if (
        house.monthly_status?.find((status) => status.month === selectedPeriod)?.status === 'Kosong'
      ) {
        acc[month].Kosong++;
      } else if (
        house.monthly_status?.find((status) => status.month === selectedPeriod)?.status ===
        'Weekend'
      ) {
        acc[month].Weekend++;
      }
    }
    return acc;
  }, {});

  if (loading) {
    return <Spinner />;
  }

  const desktopColumns = [
    { label: 'No', className: 'py-1 px-2 text-left' },
    { label: 'Rumah', className: 'py-1 px-2 text-left' },
    { label: 'Nama', className: 'py-1 px-2 text-left w-1/4' },
    { label: 'Status', className: 'py-1 px-2 text-left w-1/6' },
    { label: 'IPL', className: 'py-1 px-2 text-center' },
    { label: 'Kas', className: 'py-1 px-2 text-center' },
    { label: 'Edit', className: 'py-1 px-2 text-left' },
  ];

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Data Rumah</h1>

      <div className="w-full md:w-2/4">
        <Select
          id="relatedMonths"
          options={MonthOptions(monthly)}
          value={MonthOptions(monthly).find((option) => option.value === selectedPeriod)}
          onChange={handleMonthChange}
          placeholder="Pilih bulan"
          className="w-full"
          styles={selectStyles}
        />
      </div>

      <div className="overflow-x-auto mt-5 rounded-xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table table-sm w-auto">
          <thead>
            <tr className="bg-base-200">
              <th className="py-1 px-2 w-28">Status</th>
              <th className="py-1 px-2 w-20 text-center">Jumlah</th>
              <th className="py-1 px-2 w-24">Iuran</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Isi</td>
              <td className="text-center">{monthlyStatusCount[selectedPeriod]?.Isi || 0}</td>
              <td>IPL + KAS</td>
            </tr>
            <tr>
              <td>Weekend</td>
              <td className="text-center">{monthlyStatusCount[selectedPeriod]?.Weekend || 0}</td>
              <td>KAS</td>
            </tr>
            <tr>
              <td>Kosong</td>
              <td className="text-center">{monthlyStatusCount[selectedPeriod]?.Kosong || 0}</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-3 mt-5 flex flex-wrap gap-2 items-center w-full">
        <div className="flex-1 min-w-[120px]">
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setCurrentPage(0);
              setSearchTerm(val);
            }}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <Select
            id="group"
            options={ZONE_OPTIONS}
            value={ZONE_OPTIONS.find((o) => o.value === selectedGroup)}
            onChange={handleGroupChange}
            placeholder="Zona"
            className="text-sm"
            styles={selectStyles}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <Select
            id="status"
            options={STATUS_HOUSE_OPTIONS}
            value={STATUS_HOUSE_OPTIONS.find((o) => o.value === selectedStatus)}
            onChange={handleStatusChange}
            placeholder="Status"
            className="text-sm"
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="mt-5">
        <ResponsiveTable
          data={currentPageData}
          columns={desktopColumns}
          renderMobileCard={(house, index) => {
            const monthStatus = house.monthly_status.find(
              (status) => status.month === selectedPeriod
            );
            return (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">
                    {house.house_id} {house.resident_name}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => handleEditClick(house)}
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-base-content/70 mt-1">
                  <span>Status: {monthStatus?.status}</span>
                  <span className="flex items-center gap-1">
                    IPL:{getBooleanStatusIcon(monthStatus?.mandatory_ipl)}
                  </span>
                  <span className="flex items-center gap-1">
                    Kas:{getBooleanStatusIcon(monthStatus?.mandatory_rt)}
                  </span>
                </div>
              </>
            );
          }}
          renderDesktopRow={(house, index) => {
            const monthStatus = house.monthly_status.find(
              (status) => status.month === selectedPeriod
            );
            return (
              <tr key={index}>
                <td className="py-2 px-2">{offset + index + 1}</td>
                <td className="py-2 px-2">{house.house_id}</td>
                <td className="py-2 px-2">{house.resident_name}</td>
                <td className="py-2 px-2">{monthStatus?.status}</td>
                <td className="py-2 px-2">
                  <div className="flex justify-center items-center h-full">
                    {getBooleanStatusIcon(monthStatus?.mandatory_ipl)}
                  </div>
                </td>
                <td className="py-2 px-2">
                  <div className="flex justify-center items-center h-full">
                    {getBooleanStatusIcon(monthStatus?.mandatory_rt)}
                  </div>
                </td>
                <td className="py-2 px-2">
                  <div className="join">
                    <button
                      className="join-item btn btn-ghost btn-xs"
                      onClick={() => handleEditClick(house)}
                    >
                      Edit
                    </button>
                    <Link
                      href={`/ipl/${house.house_id.toLowerCase()}`}
                      target="_blank"
                      className="join-item btn btn-ghost btn-xs"
                    >
                      IPL
                    </Link>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      </div>

      <Pagination
        pageCount={Math.ceil(filteredHouses.length / ITEMS_PER_PAGE)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Edit Data Rumah"
        icon={<HiHome className="h-5 w-5" />}
      >
        {editData && (
          <div className="flex flex-col gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Rumah</span>
              </label>
              <input
                className="input input-bordered input-sm"
                name="house_id"
                value={editData?.house_id || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Grup</span>
              </label>
              <select
                id="group"
                name="group"
                value={editData?.group || ''}
                onChange={handleInputChange}
                className="select select-bordered select-sm"
              >
                <option value="-">-</option>
                {ZONE_OPTIONS.filter((o) => o.value !== '').map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Nama</span>
              </label>
              <input
                className="input input-bordered input-sm"
                name="resident_name"
                value={editData?.resident_name || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">WhatsApp</span>
              </label>
              <input
                className="input input-bordered input-sm"
                name="whatsapp_number"
                value={editData?.whatsapp_number || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Status</span>
              </label>
              <select
                id="monthly_status"
                name="monthly_status"
                value={
                  Array.isArray(editData.monthly_status)
                    ? editData.monthly_status.find((status) => status.month === selectedPeriod)
                        ?.status
                    : ''
                }
                onChange={(e) =>
                  handleEditStatus(
                    selectedPeriod,
                    e.target.value,
                    editData.monthly_status.find((status) => status.month === selectedPeriod)
                      ?.mandatory_ipl,
                    editData.monthly_status.find((status) => status.month === selectedPeriod)
                      ?.mandatory_rt
                  )
                }
                className="select select-bordered select-sm"
              >
                <option value="Isi">Isi</option>
                <option value="Kosong">Kosong</option>
                <option value="Weekend">Weekend</option>
                <option value="Monthly">Monthly</option>
                <option value="Tidak ada kontak">Tidak ada kontak</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Wajib IPL</span>
              </label>
              <select
                id="mandatory_ipl"
                name="mandatory_ipl"
                value={
                  Array.isArray(editData.monthly_status)
                    ? editData.monthly_status.find((status) => status.month === selectedPeriod)
                        ?.mandatory_ipl
                    : ''
                }
                onChange={(e) =>
                  handleEditStatus(
                    selectedPeriod,
                    editData.monthly_status.find((status) => status.month === selectedPeriod)
                      ?.status,
                    e.target.value,
                    editData.monthly_status.find((status) => status.month === selectedPeriod)
                      ?.mandatory_rt
                  )
                }
                className="select select-bordered select-sm"
              >
                <option value="true">Ya</option>
                <option value="false">Tidak</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Wajib Kas</span>
              </label>
              <select
                id="mandatory_rt"
                name="mandatory_rt"
                value={
                  Array.isArray(editData.monthly_status)
                    ? editData.monthly_status.find((status) => status.month === selectedPeriod)
                        ?.mandatory_rt
                    : ''
                }
                onChange={(e) =>
                  handleEditStatus(
                    selectedPeriod,
                    editData.monthly_status.find((status) => status.month === selectedPeriod)
                      ?.status,
                    editData.monthly_status.find((status) => status.month === selectedPeriod)
                      ?.mandatory_ipl,
                    e.target.value
                  )
                }
                className="select select-bordered select-sm"
              >
                <option value="true">Ya</option>
                <option value="false">Tidak</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text font-medium">Nominal Iuran</span>
              </label>
              <input
                className="input input-bordered input-sm"
                name="fee"
                type="number"
                value={
                  editData.monthly_fees.find((status) => status.month === selectedPeriod)?.fee || ''
                }
                onChange={handleFeeChange}
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary btn-sm" onClick={handleSaveChanges}>
                Simpan
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsDrawerOpen(false)}>
                Batal
              </button>
            </div>
          </div>
        )}
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

Houses.getLayout = (page) => (
  <DashboardLayout title="Data Rumah">{page}</DashboardLayout>
);

export default Houses;
