<div align="center">
  <img src="frontend/src/assets/klebengan.png" alt="KlebKos Logo" width="120" />
  <h1>KlebKos</h1>
  <p>Sistem manajemen kamar, verifikasi iuran, dan pembukuan kas Kos Klebengan.</p>
</div>

---

## Ringkasan

KlebKos mencatat administrasi pembayaran iuran bulanan dan pengeluaran operasional kos 4 lantai. Sistem ini menggantikan pencatatan manual grup percakapan dengan basis data terpusat, alokasi pembayaran dimuka otomatis, dan modul antrean verifikasi bukti transfer bank.

## Modul Utama

- **Status Kamar dan Pembayaran Dimuka**: Menampilkan peta okupansi 4 lantai. Sistem memproses pelunasan beberapa bulan sekaligus (*advance payment*) tanpa penagihan ganda pada periode berikutnya.
- **Antrean Verifikasi Bukti Transfer**: Penghuni mengunggah struk transfer ke Supabase Storage. Pengelola memeriksa berkas melalui penampil gambar (*lightbox*) sebelum menyetujui transaksi.
- **Buku Kas Pemasukan dan Pengeluaran**: Mencatat arus kas masuk dan operasional kos dalam satu buku besar. Dilengkapi filter kategori, ringkasan saldo, dan riwayat mutasi bulanan.
- **Generator Format WhatsApp**: Menyusun draf tagihan personal ke nomor penghuni dan rekap status pelunasan untuk grup perpesanan.
- **Ekspor Laporan**: Menyediakan opsi unduh berkas CSV untuk arsip Excel serta tata letak cetak dokumen PDF.

## Struktur Repositori

```text
klebengan-kas-kos/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurasi koneksi Supabase client
│   │   ├── controllers/     # Logika bisnis transaksi, kamar, dan periode
│   │   ├── middlewares/     # Penanganan error dan autentikasi token
│   │   └── routes/          # Definisi endpoint REST API
│   ├── scripts/             # Skrip migrasi dan data awal (seeding)
│   └── server.js            # Titik masuk server Express
├── frontend/
│   ├── src/
│   │   ├── components/      # Komponen antarmuka (dashboard, kamar, kas)
│   │   ├── pages/           # Halaman utama aplikasi web
│   │   ├── services/        # Klien HTTP Axios dan Supabase Storage
│   │   └── stores/          # Manajemen state global berbasis Zustand
│   ├── public/              # Aset statis dan favicon browser
│   └── index.html           # Titik masuk HTML aplikasi
└── planning/                # Dokumentasi arsitektur, ERD, dan skema SQL
```

## Teknologi

- **Frontend**: React 19, Vite, Zustand, Tailwind CSS, GSAP, Axios, Lucide React
- **Backend**: Node.js, Express
- **Penyimpanan Data**: PostgreSQL (Supabase), Supabase Storage

## Panduan Instalasi Lokal

### Kebutuhan Sistem

- Node.js versi 18 atau yang lebih baru
- Akun dan proyek Supabase aktif

### 1. Konfigurasi Backend

Masuk ke direktori `backend`, pasang dependensi, lalu siapkan berkas lingkungan:

```bash
cd backend
npm install
```

Salin template variabel lingkungan:

```bash
cp .env.example .env
```

Isi berkas `.env` dengan kredensial proyek Supabase Anda:

```env
PORT=5000
SUPABASE_URL=https://<id-proyek>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Jalankan server backend:

```bash
npm run dev
```

Server berjalan pada port `http://localhost:5000`.

### 2. Konfigurasi Frontend

Buka terminal baru, masuk ke direktori `frontend`, lalu pasang dependensi:

```bash
cd frontend
npm install
```

Salin template variabel lingkungan:

```bash
cp .env.example .env
```

Sesuaikan nilai berkas `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://<id-proyek>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Jalankan server pengembangan:

```bash
npm run dev
```

Buka peramban di `http://localhost:5173`.

### 3. Skrip Basis Data

Untuk mengisi data awal nomor kamar 4 lantai:

```bash
cd backend
node scripts/seed-rooms.js
```

Untuk membuat catatan periode awal:

```bash
node scripts/seed-all-periods.js
```

## Lisensi

Proyek internal pengelolaan Kos Klebengan.
