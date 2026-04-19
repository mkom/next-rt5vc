import Link from 'next/link';
import { FaLock } from 'react-icons/fa';

/**
 * AccessDenied - Komponen untuk menampilkan halaman akses ditolak
 * 
 * Ditampilkan ketika user mencoba mengakses dashboard tanpa role admin.
 * 
 * Usage:
 * <AccessDenied />
 */
const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaLock className="w-10 h-10 text-error" />
        </div>
        <h1 className="text-2xl font-bold text-base-content mb-2">
          Akses Ditolak
        </h1>
        <p className="text-base-content/70 mb-6">
          Anda tidak memiliki izin untuk mengakses halaman ini. 
          Halaman ini hanya untuk administrator.
        </p>
        <Link 
          href="/" 
          className="btn btn-primary"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
