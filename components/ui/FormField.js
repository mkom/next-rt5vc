const FormField = ({ label, error, required, children }) => (
  <div className="form-control w-full">
    <label className="label pb-1">
      <span className="label-text font-medium">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </span>
    </label>
    {children}
    {error && <p className="text-error text-xs mt-1">{error}</p>}
  </div>
);

export default FormField;
