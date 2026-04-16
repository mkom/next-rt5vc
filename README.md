# RT5VC - Sistem Keuangan RT 005 / RW 011

Aplikasi manajemen keuangan untuk RT 005 / RW 011 Villa Citayam, Susukan, Bojong Gede, Bogor. Dibangun dengan Next.js untuk transparansi dan kemudahan akses informasi keuangan warga.

## 🎯 Fitur Utama

| Modul | Deskripsi |
|-------|-----------|
| **Dashboard** | Ringkasan kas, transaksi terbaru, dan statistik keuangan |
| **Data IPL** | Manajemen iuran penghijauan dan lingkungan warga |
| **Setor** | Formulir konfirmasi setoran dan pembayaran |
| **Tunggakan** | Daftar dan pelacakan pembayaran yang tertunggak |
| **Riwayat** | Histori transaksi dan mutasi kas |
| **Laporan** | Generate laporan keuangan dalam format PDF/CSV |

## 🚀 Teknologi

- **Framework**: [Next.js 14](https://nextjs.org/) - React framework dengan App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Autentikasi**: [NextAuth.js](https://next-auth.js.org/) dengan Google OAuth
- **Font**: Inter (Google Fonts)
- **Icons**: React Icons

## 🎨 Design System

Proyek ini menggunakan design system berbasis warna hijau yang diekstrak dari logo RT5VC:

| Warna | Kode | Penggunaan |
|-------|------|------------|
| Primary Green | `#2E7D32` | Tombol, header, aksi utama |
| Secondary Teal | `#00838F` | Link, aksi sekunder |
| Accent Amber | `#F9A825` | Ikon, highlight |
| Navy | `#1A237E` | Teks heading |

Dokumentasi lengkap design system tersedia di [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## 📦 Instalasi

```bash
# Clone repository
git clone <repository-url>
cd rt5vc

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local dengan konfigurasi Anda
```

## 🔧 Konfigurasi Environment

Buat file `.env.local` dengan variabel berikut:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Base URL
NEXT_PUBLIC_API_BASE_URL=your-api-url
```

## 🖥️ Menjalankan Aplikasi

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📱 Struktur Aplikasi

```
├── pages/                    # Next.js pages
│   ├── index.mjs            # Halaman utama (public)
│   ├── ipl/                 # Manajemen IPL
│   ├── dashboard/           # Admin dashboard
│   ├── confirmation.js      # Form konfirmasi setor
│   ├── outstanding.js       # Daftar tunggakan
│   ├── history.js           # Riwayat transaksi
│   ├── cashflow.js          # Arus kas
│   └── api/                 # API routes
├── components/              # React components
│   ├── layouts/            # Layout wrappers
│   ├── SplashPage.js       # Halaman login
│   ├── Header.js           # Navigation header
│   └── Report.js           # Financial report component
├── utils/                   # Utility functions
│   ├── authUtils.js
│   ├── format.js
│   └── constants.js
├── public/                  # Static assets
│   └── rt5vc.png           # Logo RT5VC
├── design-tokens.js         # Design tokens
└── tailwind.config.js       # Tailwind configuration
```

## 🔐 Autentikasi

Aplikasi menggunakan NextAuth.js dengan Google OAuth 2.0. Hanya pengguna dengan email yang terdaftar yang dapat mengakses fitur admin.

## 📊 Fitur Dashboard

- **Ringkasan Kas**: Saldo kas real-time
- **Grafik Transaksi**: Visualisasi pemasukan & pengeluaran
- **Manajemen Warga**: Data warga dan status IPL
- **Laporan Keuangan**: Export PDF dan CSV

## 🌐 Deployment

Aplikasi ini di-deploy menggunakan [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feat/nama-fitur`)
3. Commit perubahan (`git commit -m 'Add: nama fitur'`)
4. Push ke branch (`git push origin feat/nama-fitur`)
5. Buat Pull Request

## 📝 Dokumentasi

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Panduan design system
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Ringkasan implementasi
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Catatan refactoring

## 📄 Lisensi

Proyek ini dibuat untuk RT 005 / RW 011 Villa Citayam.

---

**RT 005 / RW 011 Villa Citayam**  
Susukan, Bojong Gede, Bogor
