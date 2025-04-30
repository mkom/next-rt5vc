import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
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
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    // Simulasi pemuatan data
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    setDataLoaded(true); // Tandai bahwa data telah dimuat
    if (options) {
      setIsLoading(false); // Hanya nonaktifkan loading jika value ada
    }
  };

  useEffect(() => {
    loadData();
  }, [options]); // Jalankan ulang saat value berubah

  const handleInputChange = (value) => {
    setInputValue(value);
  };

  const handleChange = (selectedOption) => {
    onSelect(selectedOption);
  };

  // Filter opsi hanya jika inputValue memiliki 2 huruf atau lebih
  const filteredOptions = inputValue.length >= 2 ? options : [];

  const filterHouses = (inputValue) => {
    return options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(filterHouses(inputValue));
      }, 1000);
    });
  };

  return (
    <div className="mt-1 block md:w-72">
      <AsyncSelect 
      cacheOptions 
      defaultOptions 
      loadOptions={loadOptions} 
      styles={customStyles}
      className='text-sm'
      value={value ? options.find(option => option.value === value) : null}
      onChange={handleChange}
      placeholder={isLoading ? "Memuat data..." : "Cari"}
      noOptionsMessage={() =>
        inputValue.length < 2
          ? "Ketik minimal 2 huruf untuk mencari"
          : "Tidak ada opsi yang cocok"
      }
      />
      
      {/* <Select
        value={value ? options.find(option => option.value === value) : null}
        onChange={handleChange}
        options={filteredOptions}
        onInputChange={handleInputChange}
        styles={customStyles}
        placeholder={isLoading ? "Memuat data..." : "Cari"}
        className='text-sm'
        isDisabled={isLoading}
        isLoading={isLoading}
        noOptionsMessage={() =>
          inputValue.length < 2
            ? "Ketik minimal 2 huruf untuk mencari"
            : "Tidak ada opsi yang cocok"
        }
      /> */}
    </div>
  );
};

export default Autocomplete;
