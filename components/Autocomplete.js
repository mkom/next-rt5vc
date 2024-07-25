import React from 'react';
import Select from 'react-select';
import { TextInput } from 'flowbite-react';

// Custom styles for react-select
const customStyles = {
  control: (provided) => ({
    ...provided,
    border: '1px solid #D1D5DB',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid #3B82F6',
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

const Autocomplete = ({ value, onChange, options, onSelect }) => {
  const handleChange = (selectedOption) => {
    onSelect(selectedOption);
  };

  return (
    <div className="mt-1 block w-72">
      <Select
        value={options.find(option => option.value === value)}
        onChange={handleChange}
        options={options}
        styles={customStyles}
        placeholder="Pilih"
      />
    </div>
  );
};

export default Autocomplete;
