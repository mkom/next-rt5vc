import { useState, useEffect } from 'react';
import { HiUser } from 'react-icons/hi';
import { FaRegSave, FaTimes } from 'react-icons/fa';
import Drawer from '../ui/Drawer';
import FormField from '../ui/FormField';

/**
 * UserEditDrawer - Drawer for editing user data
 *
 * Features:
 * - Consistent field styling with app-input class
 * - Standardized button classes
 * - Form validation
 * - Fields: username, name, whatsapp_number, email
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether drawer is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.user - User data to edit
 * @param {Function} props.onSave - Save handler (userData) => Promise
 */
const UserEditDrawer = ({ isOpen, onClose, user, onSave }) => {
  const [editData, setEditData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize edit data when user changes
  useEffect(() => {
    if (user) {
      setEditData({ ...user });
    }
  }, [user]);

  if (!editData) return null;

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(editData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Data User"
      icon={<HiUser className="h-5 w-5 text-primary" />}
    >
      <div className="flex flex-col gap-4">
        {/* Username */}
        <FormField label="Username">
          <input
            className="app-input w-full"
            name="username"
            value={editData?.username || ''}
            onChange={handleInputChange}
            placeholder="Username"
          />
        </FormField>

        {/* Nama */}
        <FormField label="Nama">
          <input
            className="app-input w-full"
            name="name"
            value={editData?.name || ''}
            onChange={handleInputChange}
            placeholder="Nama lengkap"
          />
        </FormField>

        {/* WhatsApp */}
        <FormField label="WhatsApp">
          <input
            className="app-input w-full"
            name="whatsapp_number"
            value={editData?.whatsapp_number || ''}
            onChange={handleInputChange}
            placeholder="Nomor WhatsApp"
          />
        </FormField>

        {/* Email */}
        <FormField label="Email">
          <input
            className="app-input w-full"
            name="email"
            type="email"
            value={editData?.email || ''}
            onChange={handleInputChange}
            placeholder="Alamat email"
          />
        </FormField>

        {/* Actions */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-base-200">
          <button
            className="btn btn-primary btn-sm flex-1 gap-2 touch-target-sm shadow-md hover:shadow-lg transition-all"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <FaRegSave className="h-4 w-4" />
            )}
            Simpan
          </button>
          <button
            className="btn btn-ghost btn-sm touch-target-sm px-4"
            onClick={onClose}
            disabled={isSaving}
          >
            <FaTimes className="h-4 w-4" />
            Batal
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default UserEditDrawer;
