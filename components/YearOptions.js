import moment from 'moment';
const YearOptions = () => {
  const startYear = 2024; // Tahun mulai
  const endYear = 2026; // Tahun akhir

  const options = [];

  // Loop untuk menghasilkan tahun dari startYear hingga endYear
  for (let year = startYear; year <= endYear; year++) {
    options.push({
      value: year,        // Nilai tahun
      label: year.toString() // Label tahun
    });
  }

  return options;
};

export default YearOptions;