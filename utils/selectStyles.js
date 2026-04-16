export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '2.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#4f46e5' : '#e2e8f0',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#4f46e5',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 0.5rem',
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
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#4f46e5'
      : state.isFocused
      ? '#f0f4f8'
      : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#0f172a',
    fontSize: '0.875rem',
    padding: '0.625rem 0.75rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#e8edf2',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#4f46e5',
    fontSize: '0.75rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#4f46e5',
    ':hover': {
      backgroundColor: '#cbd5e0',
      color: '#3730a3',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '0.875rem',
  }),
};
