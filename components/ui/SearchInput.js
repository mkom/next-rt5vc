import { HiOutlineSearch } from 'react-icons/hi';

/**
 * SearchInput Component
 * Input pencarian dengan styling konsisten
 * 
 * @param {Object} props
 * @param {string} props.value - Nilai input
 * @param {Function} props.onChange - Handler perubahan nilai
 * @param {string} props.placeholder - Placeholder text (default: 'Cari')
 * @param {string} props.className - Class tambahan (opsional)
 */
const SearchInput = ({ value, onChange, placeholder = 'Cari', className = '' }) => (
  <div className={`relative ${className}`}>
    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 h-5 w-5" />
    <input
      type="text"
      className="app-input pl-11 w-full"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchInput;
