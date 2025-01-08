import React, { useState, useEffect } from 'react';
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

const Periode = ({ value, onChange, options, onSelect }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulasi pemuatan data
    const loadData = async () => {
      setIsLoading(true);
      // Simulasikan delay atau tunggu hingga data selesai dimuat
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false); // Data selesai dimuat
    };

    loadData();
  }, []);


  const handleChange = (selectedOption) => {
    onSelect(selectedOption);
  };

  return (
    <div className="mt-1 block w-72">
      <Select
        value={value ? options.find(option => option.value === value) : null}
        onChange={handleChange}
        options={options}
        styles={customStyles}
        placeholder={isLoading ? "Memuat data..." : "Pilih periode"}
        className='text-sm'
        isDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Periode;
