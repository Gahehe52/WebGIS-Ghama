from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import get_pool, close_pool
from routers import halte, rute, wilayah, kecelakaan, parkir

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    print("Database PostgreSQL (PostGIS) berhasil terkoneksi!")
    yield 
    await close_pool()
    print("Koneksi Database diputuskan.")

app = FastAPI(
    title="WebGIS API Transportasi & Spasial",
    description="REST API lengkap untuk operasi CRUD dan Analisis Spasial menggunakan FastAPI dan PostGIS. Mencakup skema Transportasi.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(halte.router)
app.include_router(rute.router)
app.include_router(wilayah.router)
app.include_router(kecelakaan.router)
app.include_router(parkir.router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Selamat datang di WebGIS API Transportasi",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }