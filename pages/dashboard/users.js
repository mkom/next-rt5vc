import { getSession, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Drawer from '../../components/ui/Drawer';
import ResponsiveTable from '../../components/ui/ResponsiveTable';
import Spinner from '../../components/Spinner';
import { ITEMS_PER_PAGE } from '../../utils/constants';
import { HiHome } from "react-icons/hi";
import { FaCalendarCheck } from 'react-icons/fa';


const Users = ({ initialUser }) => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState(initialUser ?? []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    if (session) {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/list`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setUsers(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchUser();
    }
  }, [session, fetchUser]);

  const handleSearchChange = (value) => {
    setCurrentPage(0);
    setSearchTerm(value);
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          searchTermLower === '' || (
            user?.username?.toLowerCase().includes(searchTermLower) ||
            user?.name?.toLowerCase().includes(searchTermLower) ||
            user?.email?.toLowerCase().includes(searchTermLower)
          )
        );
      })
    : [];

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredUsers.slice(offset, offset + ITEMS_PER_PAGE);

  const handleEditClick = (house) => {
    setEditData(house);
    setIsDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/houses/update/${editData._id}`, editData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          period: selectedPeriod,
          zona: selectedGroup
        }
      });
      setHouses(houses.map(house => house._id === editData._id ? { ...house, ...res.data.data } : house));
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error updating house data:', error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  const columns = [
    { label: 'No' },
    { label: 'Nama', className: 'w-1/4' },
    { label: 'Whatsapp', className: 'w-1/4' },
    { label: 'Email', className: 'w-1/3' },
    { label: 'Edit' },
  ];

  return (
    <>
      <h1 className="text-xl font-bold mb-4 flex items-center">
        <FaCalendarCheck className="mr-2 h-7 w-7" />
        <span>User</span>
      </h1>

      <div className="mb-3 mt-5 flex justify-between content-center items-center gap-3 w-full">
        <div className="w-full md:w-1/3">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari"
          />
        </div>
      </div>

      <div className="mt-5">
        <ResponsiveTable
          data={currentPageData}
          columns={columns}
          renderMobileCard={(user, index) => (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm">
                  {user.username} / {user.name || '-'}
                </div>
                <div className="text-xs text-base-content/70 mt-1">
                  WhatsApp: {user.whatsapp_number || '-'} &nbsp; Email: {user.email || '-'}
                </div>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => handleEditClick(user)}>Edit</button>
            </div>
          )}
          renderDesktopRow={(user, index) => (
            <tr key={index}>
              <td>{offset + index + 1}</td>
              <td>{user.name ? user.name : user.username}</td>
              <td>{user.whatsapp_number}</td>
              <td>{user.email}</td>
              <td>
                <button className="btn btn-ghost btn-xs" onClick={() => handleEditClick(user)}>Edit</button>
              </td>
            </tr>
          )}
        />
      </div>

      <Pagination
        pageCount={Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Edit Data User"
        icon={<HiHome className="h-5 w-5" />}
      >
        {editData && (
          <div className="flex flex-col gap-3">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">Username</span></label>
              <input className="input input-bordered input-sm" name="username" value={editData?.username || ''} onChange={handleInputChange} />
            </div>
            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">Nama</span></label>
              <input className="input input-bordered input-sm" name="name" value={editData?.name || ''} onChange={handleInputChange} />
            </div>
            <div className="form-control">
              <label className="label pb-1"><span className="label-text font-medium">WhatsApp</span></label>
              <input className="input input-bordered input-sm" name="whatsapp_number" value={editData?.whatsapp_number || ''} onChange={handleInputChange} />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary btn-sm" onClick={handleSaveChanges}>Simpan</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsDrawerOpen(false)}>Batal</button>
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
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/list`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return {
      props: {
        initialUser: res.data.data,
      },
    };
  } catch (error) {
    console.error('Error fetching users data:', error);
    return {
      props: {
        initialUser: [],
      },
    };
  }
};

Users.getLayout = (page) => (
  <DashboardLayout title="Users">{page}</DashboardLayout>
);

export default Users;
