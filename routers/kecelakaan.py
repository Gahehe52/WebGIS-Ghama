from fastapi import APIRouter, HTTPException
from database import get_pool
from models.kecelakaan import KecelakaanCreate
import json

router = APIRouter(prefix="/api/kecelakaan", tags=["Kecelakaan Lalu Lintas"])

@router.get("/")
async def get_all_kecelakaan():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, tanggal, jenis_kecelakaan, penyebab, ST_AsGeoJSON(geom) as geom FROM transportasi.kecelakaan LIMIT 100")
        return [dict(row) for row in rows]

@router.get("/{id}")
async def get_kecelakaan_by_id(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id, tanggal, jenis_kecelakaan, penyebab, jumlah_korban, ST_X(geom) as longitude, ST_Y(geom) as latitude FROM transportasi.kecelakaan WHERE id=$1", id)
        if not row:
            raise HTTPException(status_code=404, detail="Kecelakaan tidak ditemukan")
        return dict(row)

@router.get("/data/geojson")
async def get_kecelakaan_geojson():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, tanggal, jenis_kecelakaan, ST_AsGeoJSON(geom) as geom FROM transportasi.kecelakaan")
        return {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": json.loads(row["geom"]), "properties": {"id": row["id"], "tanggal": str(row["tanggal"]), "jenis_kecelakaan": row["jenis_kecelakaan"]}} for row in rows]}

@router.get("/spatial/nearby")
async def get_nearby_kecelakaan(lat: float, lon: float, radius: int = 1000):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, tanggal, jenis_kecelakaan, ROUND(ST_Distance(geom::geography, ST_Point($1,$2)::geography)::numeric, 2) as jarak_m FROM transportasi.kecelakaan WHERE ST_DWithin(geom::geography, ST_Point($1,$2)::geography, $3) ORDER BY jarak_m", lon, lat, radius)
        return [dict(row) for row in rows]

@router.post("/", status_code=201)
async def create_kecelakaan(data: KecelakaanCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("INSERT INTO transportasi.kecelakaan (tanggal, waktu, jenis_kecelakaan, jumlah_korban, jumlah_kendaraan, penyebab, kondisi_jalan, kondisi_cuaca, keterangan, geom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_Point($10,$11), 4326)) RETURNING id, tanggal, jenis_kecelakaan, penyebab, ST_X(geom) as longitude, ST_Y(geom) as latitude", data.tanggal, data.waktu, data.jenis_kecelakaan, data.jumlah_korban, data.jumlah_kendaraan, data.penyebab, data.kondisi_jalan, data.kondisi_cuaca, data.keterangan, data.longitude, data.latitude)
        return dict(row)

@router.put("/{id}")
async def update_kecelakaan(id: int, data: KecelakaanCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("UPDATE transportasi.kecelakaan SET tanggal=$2, waktu=$3, jenis_kecelakaan=$4, jumlah_korban=$5, jumlah_kendaraan=$6, penyebab=$7, kondisi_jalan=$8, kondisi_cuaca=$9, keterangan=$10, geom=ST_SetSRID(ST_Point($11,$12), 4326) WHERE id=$1 RETURNING id, tanggal, jenis_kecelakaan, penyebab, ST_X(geom) as longitude, ST_Y(geom) as latitude", id, data.tanggal, data.waktu, data.jenis_kecelakaan, data.jumlah_korban, data.jumlah_kendaraan, data.penyebab, data.kondisi_jalan, data.kondisi_cuaca, data.keterangan, data.longitude, data.latitude)
        if not row:
            raise HTTPException(status_code=404, detail="Kecelakaan tidak ditemukan")
        return dict(row)

@router.delete("/{id}", status_code=204)
async def delete_kecelakaan(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        check = await conn.fetchval("SELECT id FROM transportasi.kecelakaan WHERE id=$1", id)
        if not check:
            raise HTTPException(status_code=404, detail="Kecelakaan tidak ditemukan")
        await conn.execute("DELETE FROM transportasi.kecelakaan WHERE id=$1", id)