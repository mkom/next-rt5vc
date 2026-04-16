import React from 'react';
import Select from 'react-select';
import { selectStyles } from '../utils/selectStyles';

/**
 * SelectPeriod Component
 * Dropdown pemilihan periode tanpa fake loading
 * 
 * @param {Object} props
 * @param {string} props.value - Nilai yang dipilih
 * @param {Function} props.onChange - Handler perubahan
 * @param {Array} props.options - Array opsi
 * @param {string} props.placeholder - Placeholder text
 */
const SelectPeriod = ({ value, onChange, options, placeholder = "Pilih periode" }) => {
  const handleChange = (selectedOption) => {
    onChange(selectedOption);
  };

  return (
    <Select
      value={value ? options.find(option => option.value === value) : null}
      onChange={handleChange}
      options={options}
      styles={selectStyles}
      placeholder={placeholder}
      isSearchable={false}
      className="rounded-xl text-sm font-medium"
    />
  );
};

export default SelectPeriod;
