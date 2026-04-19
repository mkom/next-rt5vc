/**
 * PageHeader - Consistent page header for dashboard pages
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {React.ReactNode} props.icon - Icon component
 * @param {React.ReactNode} props.actions - Action buttons or elements
 * @param {string} props.description - Optional description text
 */
const PageHeader = ({ title, icon: Icon, actions, description }) => {
  return (
    <div className="pt-2 px-1 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-extrabold text-base-content tracking-tight flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 text-primary" />}
            <span className="truncate">{title}</span>
          </h1>
          {description && (
            <p className="text-sm text-base-content/70 mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
