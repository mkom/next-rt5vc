import React, { useState, useEffect, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { selectStyles } from '../utils/selectStyles';

const Autocomplete = ({ value, onChange, options, onSelect }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    if (options) {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (selectedOption) => {
    onSelect(selectedOption);
  };

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
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      styles={selectStyles}
      value={value ? options.find(option => option.value === value) : null}
      onChange={handleChange}
      placeholder={isLoading ? "Memuat data..." : "Cari"}
      noOptionsMessage={() =>
        inputValue.length < 2
          ? "Ketik minimal 2 huruf untuk mencari"
          : "Tidak ada opsi yang cocok"
      }
    />
  );
};

export default Autocomplete;
