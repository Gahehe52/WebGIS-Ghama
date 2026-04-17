# WebGIS Transportasi Bandar Lampung 🗺️

Proyek ini adalah aplikasi WebGIS *full-stack* yang mengintegrasikan **FastAPI** (Backend) dengan **React** dan **Leaflet** (Frontend). Aplikasi ini berfungsi untuk memvisualisasikan data spasial dari skema transportasi Kota Bandar Lampung, mencakup halte, rute, wilayah administrasi, titik kecelakaan, dan lokasi parkir.

## Profil Pengembang
* **Nama**: Muhammad Ghama Al Fajri
* **NIM**: 123140182
* **Prodi**: Teknik Informatika
* **Instansi**: Institut Teknologi Sumatera (ITERA)

## 🛠️ Teknologi yang Digunakan

### Backend & Database
* **Framework**: FastAPI
* **Database**: PostgreSQL dengan ekstensi **PostGIS**
* **Library**: `asyncpg`, `pydantic`, `python-dotenv`

### Frontend
* **Framework**: React.js (Vite)
* **Peta**: Leaflet & React-Leaflet
* **HTTP Client**: Axios

## 📂 Struktur Proyek (Monorepo)

```text
📦 WebGIS-Ghama
 ┣ 📂 models/          # Skema validasi Pydantic (Backend)
 ┣ 📂 routers/         # Endpoint API per tabel (Backend)
 ┣ 📂 ss/              # Dokumentasi screenshot hasil uji
 ┣ 📜 database.py      # Konfigurasi database connection pool
 ┣ 📜 main.py          # Entry point FastAPI & konfigurasi CORS
 ┣ 📜 requirements.txt # Dependensi Python
 ┗ 📂 webgis-frontend/ # Folder Proyek React (Frontend)
    ┣ 📂 src/
    ┃ ┣ 📂 components/ # Komponen MapView.jsx
    ┃ ┣ 📜 App.jsx     # Layout utama
    ┃ ┗ 📜 main.jsx    # Import CSS Leaflet
    ┗ 📜 package.json  # Dependensi Node.js
```

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Menjalankan Backend (FastAPI)
1. Masuk ke folder utama `WebGIS-Ghama`.
2. Aktifkan *Virtual Environment*:
   ```powershell
   .\venv\Scripts\activate
   ```
3. Pastikan file `.env` sudah dikonfigurasi dengan URL database PostGIS Anda.
4. Jalankan server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Menjalankan Frontend (React)
1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd webgis-frontend
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
4. Buka alamat `http://localhost:5173` di browser.

## 📡 Fitur Utama & Interaksi Peta

### Integrasi GeoJSON & Basemap
* **Peta Dasar**: Tersedia pilihan antara **Google Satellite** (Default) dan **OpenStreetMap** melalui *Layers Control*.
* **Overlay Layer**: Data Halte, Rute, Wilayah, Kecelakaan, dan Parkir ditampilkan secara otomatis saat peta dimuat.

### Analisis & Interaksi Spasial
* **Styling Dinamis**: Warna marker dan garis berbeda berdasarkan kategori data.
* **Hover Highlight**: Titik atau wilayah akan membesar/berubah warna saat kursor diarahkan ke atasnya.
* **Click to Zoom**: Melakukan animasi *Fly To* atau *Fit Bounds* ke objek yang diklik untuk melihat detail lebih dekat.
* **Popup Informatif**: Menampilkan atribut lengkap dari database (Nama, Kode, Jenis, dsb) saat objek diklik.

## 📸 Dokumentasi Screenshot

| Tampilan Awal Frontend |
| :---: |
| <img src="ss/ss1.png"> |

| Contoh Detail Halte |  Contoh Detail Wilayah |
| :---: | :---: |
| <img src="ss/ss2.png"> | <img src="ss/ss3.png"> |

| Contoh Detail Jalan | Contoh Detail Kecelakaan |
| :---: | :---: |
| <img src="ss/ss4.png"> | <img src="ss/ss5.png"> |

| Contoh Detail Parkir | Extra Work (Opsi Map dan Hide/Show Components |
| :---: | :---: |
| <img src="ss/ss6.png"> | <img src="ss/ss7.png"> |
