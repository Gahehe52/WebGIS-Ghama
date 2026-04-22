# WebGIS Fasilitas Publik Bandar Lampung (Full-Stack) 🗺️

Aplikasi WebGIS *Full-Stack* yang mengintegrasikan sistem Manajemen Data Spasial dengan Autentikasi Pengguna. Proyek ini dikembangkan sebagai pemenuhan **Tugas Praktikum 9 - Mata Kuliah Sistem Informasi Geografis**.

## 👤 Profil Mahasiswa
- **Nama**: Muhammad Ghama Al Fajri
- **NIM**: 123140182
- **Program Studi**: Teknik Informatika
- **Instansi**: Institut Teknologi Sumatera (ITERA)

## 🚀 Fitur Unggulan
1. **Sistem Autentikasi JWT**: Implementasi Login dan Register menggunakan *JSON Web Token* dengan pengamanan password menggunakan `bcrypt`.
2. **Manajemen Data Spasial (CRUD)**: 
   - Menambah data fasilitas baru langsung dari antarmuka web.
   - Mengubah informasi fasilitas yang sudah ada.
   - Menghapus data fasilitas dari database PostGIS melalui peta.
3. **Peta Interaktif**: Visualisasi GeoJSON dengan dukungan *Google Satellite* dan *OpenStreetMap*.
4. **Extra Work - Auto-Pick Coordinate**: Fitur khusus yang memungkinkan pengguna mengisi koordinat (Latitude & Longitude) secara otomatis hanya dengan mengklik lokasi di peta saat form tambah data aktif.

## 🛠️ Arsitektur Teknologi
- **Backend**: FastAPI (Python) dengan `asyncpg` untuk koneksi asinkron ke database.
- **Frontend**: React.js (Vite) dengan `react-leaflet` untuk manajemen komponen peta.
- **Database**: PostgreSQL dengan ekstensi **PostGIS** untuk penyimpanan data geometri.
- **Security**: `passlib` untuk enkripsi password dan `python-jose` untuk manajemen token JWT.

## 📂 Struktur Proyek (Monorepo)
```text
📦 WebGIS-Ghama
 ┣ 📂 models/          # Skema Pydantic (User, Halte, Rute, dsb)
 ┣ 📂 routers/         # Logika Endpoint API & Autentikasi
 ┣ 📂 utils/           # Helper untuk Keamanan & JWT
 ┣ 📜 database.py      # Pool Koneksi & Inisialisasi Tabel
 ┣ 📜 main.py          # Entry Point & Konfigurasi CORS Middleware
 ┗ 📂 webgis-frontend/ # Aplikasi Frontend (React)
    ┣ 📂 src/
    ┃ ┣ 📂 components/ # MapView.jsx & Login.jsx
    ┃ ┣ 📂 context/    # AuthContext (Global State Management)
    ┃ ┣ 📂 services/   # Axios Interceptor (Token Handling)
    ┃ ┗ 📜 App.jsx     # Protected Routes Logic
```

## ⚙️ Panduan Menjalankan Proyek

### 1. Persiapan Backend
Pastikan PostgreSQL dan PostGIS sudah menyala, lalu jalankan perintah berikut di folder utama:
```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*Tabel `users` akan dibuat secara otomatis pada skema `transportasi` saat server pertama kali dijalankan.*

### 2. Persiapan Frontend
Buka terminal baru di dalam folder `webgis-frontend`:
```bash
npm install
npm run dev
```

### 3. Penggunaan
1. Akses aplikasi melalui `http://localhost:5173`.
2. Lakukan **Register** akun baru untuk mendapatkan akses.
3. Setelah login, Anda dapat mengelola data fasilitas publik (Halte) dengan fitur **Tambah**, **Edit**, dan **Hapus** langsung dari interaksi peta.

## 📸 Dokumentasi Screenshot

| Tampilan Halaman Login |  Tampilan Halaman Daftar |
| :---: | :---: |
| <img src="ss/ss1.png"> | <img src="ss/ss2.png"> |

| Tampilan Utama | Pop Up Edit dan Delete Fasilitas |
| :---: | :---: |
| <img src="ss/ss3.png"> | <img src="ss/ss4.png"> |

| Edit Fasilitas (+Fitur Ambil Koordinat) | Tambah Fasilitas (+Fitur Ambil Koordinat) |
| :---: | :---: |
| <img src="ss/ss6.png"> | <img src="ss/ss5.png"> |
