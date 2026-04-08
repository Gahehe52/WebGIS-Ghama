from fastapi import APIRouter, HTTPException
from database import get_pool
from models.parkir import ParkirCreate
import json

router = APIRouter(prefix="/api/parkir", tags=["Lokasi Parkir"])

@router.get("/")
async def get_all_parkir():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, jenis, pengelola, ST_AsGeoJSON(geom) as geom FROM transportasi.parkir LIMIT 100")
        return [dict(row) for row in rows]

@router.get("/{id}")
async def get_parkir_by_id(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id, nama, jenis, kapasitas, tarif_per_jam, pengelola, ST_X(geom) as longitude, ST_Y(geom) as latitude FROM transportasi.parkir WHERE id=$1", id)
        if not row:
            raise HTTPException(status_code=404, detail="Parkir tidak ditemukan")
        return dict(row)

@router.get("/data/geojson")
async def get_parkir_geojson():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, jenis, ST_AsGeoJSON(geom) as geom FROM transportasi.parkir")
        return {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": json.loads(row["geom"]), "properties": {"id": row["id"], "nama": row["nama"], "jenis": row["jenis"]}} for row in rows]}

@router.get("/spatial/nearby")
async def get_nearby_parkir(lat: float, lon: float, radius: int = 1000):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, jenis, ROUND(ST_Distance(geom::geography, ST_Point($1,$2)::geography)::numeric, 2) as jarak_m FROM transportasi.parkir WHERE ST_DWithin(geom::geography, ST_Point($1,$2)::geography, $3) ORDER BY jarak_m", lon, lat, radius)
        return [dict(row) for row in rows]

@router.post("/", status_code=201)
async def create_parkir(data: ParkirCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("INSERT INTO transportasi.parkir (nama, jenis, kapasitas, tarif_per_jam, jam_buka, jam_tutup, pengelola, geom) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_Point($8,$9), 4326)) RETURNING id, nama, jenis, pengelola, ST_X(geom) as longitude, ST_Y(geom) as latitude", data.nama, data.jenis, data.kapasitas, data.tarif_per_jam, data.jam_buka, data.jam_tutup, data.pengelola, data.longitude, data.latitude)
        return dict(row)

@router.put("/{id}")
async def update_parkir(id: int, data: ParkirCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("UPDATE transportasi.parkir SET nama=$2, jenis=$3, kapasitas=$4, tarif_per_jam=$5, jam_buka=$6, jam_tutup=$7, pengelola=$8, geom=ST_SetSRID(ST_Point($9,$10), 4326) WHERE id=$1 RETURNING id, nama, jenis, pengelola, ST_X(geom) as longitude, ST_Y(geom) as latitude", id, data.nama, data.jenis, data.kapasitas, data.tarif_per_jam, data.jam_buka, data.jam_tutup, data.pengelola, data.longitude, data.latitude)
        if not row:
            raise HTTPException(status_code=404, detail="Parkir tidak ditemukan")
        return dict(row)

@router.delete("/{id}", status_code=204)
async def delete_parkir(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        check = await conn.fetchval("SELECT id FROM transportasi.parkir WHERE id=$1", id)
        if not check:
            raise HTTPException(status_code=404, detail="Parkir tidak ditemukan")
        await conn.execute("DELETE FROM transportasi.parkir WHERE id=$1", id)