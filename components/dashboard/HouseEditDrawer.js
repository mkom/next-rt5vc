import { useState, useEffect } from 'react';
import { HiHome } from 'react-icons/hi';
import { FaRegSave, FaTimes } from 'react-icons/fa';
import Drawer from '../ui/Drawer';
import FormField from '../ui/FormField';
import { ZONE_OPTIONS, STATUS_HOUSE_OPTIONS } from '../../utils/constants';

/**
 * HouseEditDrawer - Drawer for editing house data
 *
 * Features:
 * - Consistent field styling with app-input class
 * - Standardized button classes
 * - Form validation
 * - All fields: house_id, group, resident_name, whatsapp_number, status, mandatory_ipl, mandatory_rt, fee
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether drawer is open
 * @param {Function} props.onClose - Close handler
 * @param {Object} props.house - House data to edit
 * @param {string} props.selectedPeriod - Selected period (YYYY-MM)
 * @param {Function} props.onSave - Save handler (houseData) => Promise
 */
const HouseEditDrawer = ({ isOpen, onClose, house, selectedPeriod, onSave }) => {
  const [editData, setEditData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize edit data when house changes
  useEffect(() => {
    if (house) {
      const hasCurrentPeriodStatus = house.monthly_status?.some(
        (s) => s.month === selectedPeriod
      );

      if (!hasCurrentPeriodStatus) {
        // Add default status for current period
        setEditData({
          ...house,
          monthly_status: [
            ...(house.monthly_status || []),
            {
              month: selectedPeriod,
              status: 'Isi',
              mandatory_ipl: true,
              mandatory_rt: true,
            },
          ],
        });
      } else {
        setEditData({ ...house });
      }
    }
  }, [house, selectedPeriod]);

  if (!editData) return null;

  // Handle input change for simple fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle status change (requires updating monthly_status array)
  const handleStatusChange = (month, newStatus) => {
    console.log('handleStatusChange:', month, newStatus);
    setEditData((prevData) => {
      const updatedMonthlyStatus = prevData.monthly_status.map((status) => {
        if (status.month === month) {
          return { ...status, status: newStatus };
        }
        return status;
      });
      const newData = { ...prevData, monthly_status: updatedMonthlyStatus };
      console.log('New data after status change:', newData.monthly_status.find(s => s.month === month));
      return newData;
    });
  };

  // Handle mandatory fields change (IPL or Kas)
  const handleMandatoryChange = (month, field, value) => {
    setEditData((prevData) => {
      const updatedMonthlyStatus = prevData.monthly_status.map((status) => {
        if (status.month === month) {
          return { ...status, [field]: value };
        }
        return status;
      });
      return { ...prevData, monthly_status: updatedMonthlyStatus };
    });
  };

  // Handle fee change
  const handleFeeChange = (e) => {
    const { value } = e.target;
    const numericValue = value === '' ? '' : parseInt(value, 10);

    setEditData((prevState) => {
      const updatedFees = prevState.monthly_fees.map((feeData) => {
        if (feeData.month === selectedPeriod) {
          return { ...feeData, fee: numericValue };
        }
        return feeData;
      });
      return { ...prevState, monthly_fees: updatedFees };
    });
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(editData);
      onClose();
    } catch (error) {
      console.error('Error saving house:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get current period status
  const currentStatus = editData.monthly_status?.find(
    (s) => s.month === selectedPeriod
  );

  // Get current period fee
  const currentFee = editData.monthly_fees?.find(
    (f) => f.month === selectedPeriod
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Data Rumah"
      icon={<HiHome className="h-5 w-5 text-primary" />}
    >
      <div className="flex flex-col gap-4">
        {/* DEBUG INFO */}
        {/* Rumah */}
        <FormField label="Rumah">
          <input
            className="app-input w-full"
            name="house_id"
            value={editData?.house_id || ''}
            onChange={handleInputChange}
            placeholder="ID Rumah"
          />
        </FormField>

        {/* Grup */}
        <FormField label="Grup">
          <select
            name="group"
            value={editData?.group || ''}
            onChange={handleInputChange}
            className="app-input w-full"
          >
            <option value="-">-</option>
            {ZONE_OPTIONS.filter((o) => o.value !== '').map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Nama */}
        <FormField label="Nama">
          <input
            className="app-input w-full"
            name="resident_name"
            value={editData?.resident_name || ''}
            onChange={handleInputChange}
            placeholder="Nama penghuni"
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

        {/* Status */}
        <FormField label="Status">
          <select
            value={currentStatus?.status || ''}
            onChange={(e) => handleStatusChange(selectedPeriod, e.target.value)}
            className="app-input w-full"
          >
            {STATUS_HOUSE_OPTIONS.filter((o) => o.value !== '').map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Wajib IPL */}
        <FormField label="Wajib IPL">
          <select
            value={currentStatus?.mandatory_ipl?.toString() || 'true'}
            onChange={(e) =>
              handleMandatoryChange(selectedPeriod, 'mandatory_ipl', e.target.value)
            }
            className="app-input w-full"
          >
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>
        </FormField>

        {/* Wajib Kas */}
        <FormField label="Wajib Kas">
          <select
            value={currentStatus?.mandatory_rt?.toString() || 'true'}
            onChange={(e) =>
              handleMandatoryChange(selectedPeriod, 'mandatory_rt', e.target.value)
            }
            className="app-input w-full"
          >
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>
        </FormField>

        {/* Nominal Iuran */}
        <FormField label="Nominal Iuran">
          <input
            className="app-input w-full"
            name="fee"
            type="number"
            value={currentFee?.fee || ''}
            onChange={handleFeeChange}
            placeholder="Nominal iuran"
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

export default HouseEditDrawer;
