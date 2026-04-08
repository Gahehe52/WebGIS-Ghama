from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import get_pool, close_pool
from routers import halte, rute, wilayah, kecelakaan, parkir

# Manajemen siklus hidup (lifespan) aplikasi untuk database
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dijalankan saat server baru mulai (Startup)
    await get_pool()
    print("Database PostgreSQL (PostGIS) berhasil terkoneksi!")
    
    yield # Aplikasi berjalan di sini
    
    # Dijalankan saat server dimatikan (Shutdown)
    await close_pool()
    print("Koneksi Database diputuskan.")

# Inisialisasi Aplikasi FastAPI
app = FastAPI(
    title="WebGIS API Transportasi & Spasial",
    description="REST API lengkap untuk operasi CRUD dan Analisis Spasial menggunakan FastAPI dan PostGIS. Mencakup skema Transportasi.",
    version="1.0.0",
    lifespan=lifespan
)

# Mendaftarkan (Include) semua router yang telah dibuat
app.include_router(halte.router)
app.include_router(rute.router)
app.include_router(wilayah.router)
app.include_router(kecelakaan.router)
app.include_router(parkir.router)

# Route dasar (Root) agar saat buka localhost:8000 tidak error "Not Found"
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Selamat datang di WebGIS API Transportasi",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }