/**
 * selectStyles - Standardized React-Select styles with green theme
 *
 * Features:
 * - Green color scheme matching design system
 * - Z-index fixes for dropdown portals
 * - Consistent sizing and spacing
 * - Accessible focus states
 */

export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '2.75rem',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#2E7D32' : '#C8E6C9',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(46, 125, 50, 0.15)' : 'none',
    '&:hover': {
      borderColor: '#2E7D32',
    },
    transition: 'all 0.2s ease',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 0.75rem',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '2.75rem',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#2E7D32' : '#9CA3AF',
    '&:hover': {
      color: '#2E7D32',
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #C8E6C9',
    overflow: 'hidden',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: '0.5rem',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#2E7D32'
      : state.isFocused
      ? '#E8F5E9'
      : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#1F2937',
    fontSize: '0.875rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: state.isSelected ? '#1B5E20' : '#C8E6C9',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#1F2937',
    fontWeight: 500,
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#E8F5E9',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#2E7D32',
    fontSize: '0.75rem',
    fontWeight: 500,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#2E7D32',
    borderRadius: '0 0.375rem 0.375rem 0',
    '&:hover': {
      backgroundColor: '#C8E6C9',
      color: '#1B5E20',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9CA3AF',
    fontSize: '0.875rem',
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#9CA3AF',
    '&:hover': {
      color: '#EF4444',
    },
  }),
};

/**
 * selectStylesCompact - Smaller variant for dense UIs
 */
export const selectStylesCompact = {
  ...selectStyles,
  control: (base, state) => ({
    ...selectStyles.control(base, state),
    minHeight: '2.25rem',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '2.25rem',
  }),
};

export default selectStyles;
