const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-base-100/90 z-[9999]">
    <div className="flex flex-col items-center gap-3">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-sm text-base-content/60">Memuat...</p>
    </div>
  </div>
);

export default Spinner;
