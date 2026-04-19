/**
 * FormField - Standardized form field wrapper
 *
 * Features:
 * - Consistent label styling
 * - Error message display
 * - Helper text support
 * - Required indicator
 * - Proper spacing
 * - Accessibility attributes
 *
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.error - Error message
 * @param {string} props.helper - Helper text (optional)
 * @param {boolean} props.required - Whether field is required
 * @param {React.ReactNode} props.children - Input element
 * @param {string} props.className - Additional CSS classes
 */
const FormField = ({
  label,
  error,
  helper,
  required,
  children,
  className = '',
}) => (
  <div className={`form-control w-full ${className}`}>
    {label && (
      <label className="label py-1 px-0 min-h-0">
        <span className="label-text font-medium text-sm text-base-content/80">
          {label}
          {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </span>
      </label>
    )}
    <div className="relative">{children}</div>
    {helper && !error && (
      <p className="text-xs text-base-content/50 mt-1.5">{helper}</p>
    )}
    {error && (
      <p className="text-error text-xs mt-1.5 flex items-center gap-1" role="alert">
        <span aria-hidden="true">•</span>
        {error}
      </p>
    )}
  </div>
);

export default FormField;
