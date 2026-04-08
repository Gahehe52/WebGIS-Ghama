# WebGIS API Transportasi & Spasial 🗺️

- **Nama:** Muhammad Ghama Al Fajri
- **NIM:** 123140182
- **Mata Kuliah:** Sistem Informasi Geografis (SIG) - ITERA

REST API lengkap untuk operasi CRUD dan Analisis Spasial menggunakan FastAPI dan PostGIS. Proyek ini dibangun sebagai pemenuhan **Tugas Praktikum 7 - Mata Kuliah Sistem Informasi Geografis**.

API ini mengelola data spasial skema transportasi yang mencakup fasilitas halte, rute jalan, wilayah administrasi, lokasi kecelakaan, dan lokasi parkir.

## 🛠️ Teknologi yang Digunakan
* **Backend Framework:** FastAPI
* **Database:** PostgreSQL dengan ekstensi PostGIS
* **Database Driver:** `asyncpg` (Asynchronous)
* **Data Validation:** Pydantic
* **Server:** Uvicorn

## 📂 Struktur Proyek
```text
📦 webgis-ghama
 ┣ 📂 models/          # Skema validasi Pydantic (Halte, Rute, dll)
 ┣ 📂 routers/         # Endpoint API untuk setiap tabel
 ┣ 📂 ss/              # Dokumentasi screenshot (Swagger UI & Testing)
 ┣ 📜 .gitignore       # Mengabaikan file env & cache
 ┣ 📜 database.py      # Konfigurasi connection pool asyncpg
 ┣ 📜 main.py          # Entry point aplikasi FastAPI
 ┗ 📜 requirements.txt # Daftar library Python
````

## 🚀 Cara Menjalankan Proyek Lokal

### 1\. Prasyarat

  * Python 3.10+ terinstal.
  * PostgreSQL dan PostGIS sudah berjalan.
  * Database bernama `sig_praktikum` dengan tabel skema `transportasi` sudah tersedia.

### 2\. Instalasi

Buka terminal di direktori proyek ini dan buat *virtual environment*:

```bash
python -m venv venv
```

Aktifkan *virtual environment*:

  * **Windows:** `.\venv\Scripts\activate`
  * **Mac/Linux:** `source venv/bin/activate`

Install semua dependensi yang dibutuhkan:

```bash
pip install -r requirements.txt
```

### 3\. Konfigurasi Environment

Buat file bernama `.env` di *root* direktori (sejajar dengan `main.py`) dan masukkan konfigurasi database kamu:

```env
DATABASE_URL=postgresql://postgres:password_database_kamu@localhost:5432/sig_praktikum
```

### 4\. Menjalankan Server

Jalankan server *development* menggunakan Uvicorn:

```bash
uvicorn main:app --reload
```

## 📡 Dokumentasi API & Fitur Utama

Setelah server berjalan, dokumentasi interaktif (Swagger UI) dapat diakses melalui browser di:
👉 **[http://127.0.0.1:8000/docs](https://www.google.com/search?q=http://127.0.0.1:8000/docs)**

### Fitur Endpoint Tersedia (Contoh pada tabel `Halte`):

  * `GET /api/halte/` : Mengambil semua data halte.
  * `GET /api/halte/{id}` : Mengambil data halte berdasarkan ID.
  * `GET /api/halte/data/geojson` : Menghasilkan output standar spasial dalam format **GeoJSON** (`FeatureCollection`).
  * `GET /api/halte/spatial/nearby` : **Query Spasial** (`ST_DWithin`) untuk mencari halte dalam radius tertentu dari suatu titik koordinat.
  * `POST /api/halte/` : Menambahkan data halte baru (Create).
  * `PUT /api/halte/{id}` : Mengubah data halte yang ada (Update).
  * `DELETE /api/halte/{id}` : Menghapus data halte (Delete).

*(Pola endpoint yang sama berlaku untuk rute, wilayah, kecelakaan, dan parkir).*

## 📸 Dokumentasi Screenshot

| Tampilan Awal Swagger UI |
| :---: |
| <img src="ss/ss1.png"> |

| Contoh Get All Halte (Langkah 1) |  Contoh Get All Halte (Langkah 2) |
| :---: | :---: |
| <img src="ss/ss2.png"> | <img src="ss/ss3.png"> |

| Contoh Get All Halte (Langkah 3) | Contoh Get Halte By ID |
| :---: | :---: |
| <img src="ss/ss4.png"> | <img src="ss/ss5.png"> |

| Contoh Get Halte GeoJSON | Navigation Drawer |
| :---: | :---: |
| <img src="ss/ss6.png"> | <img src="ss/ss7.png"> |

Bukti pengujian API (Endpoint GET, POST, GeoJSON, Nearby, dll) telah dilampirkan pada folder `/ss`.
