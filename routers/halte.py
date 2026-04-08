from fastapi import APIRouter, HTTPException
from database import get_pool
from models.halte import HalteCreate
import json
import asyncpg

router = APIRouter(prefix="/api/halte", tags=["Halte Transportasi"])

@router.get("/")
async def get_all_halte():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, kode, jenis, alamat, ST_AsGeoJSON(geom) as geom FROM transportasi.halte LIMIT 100")
        return [dict(row) for row in rows]

@router.get("/{id}")
async def get_halte_by_id(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id, nama, kode, jenis, alamat, kapasitas, ST_X(geom) as longitude, ST_Y(geom) as latitude FROM transportasi.halte WHERE id=$1", id)
        if not row:
            raise HTTPException(status_code=404, detail="Halte tidak ditemukan")
        return dict(row)

@router.get("/data/geojson")
async def get_halte_geojson():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, kode, jenis, ST_AsGeoJSON(geom) as geom FROM transportasi.halte")
        return {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": json.loads(row["geom"]), "properties": {"id": row["id"], "nama": row["nama"], "kode": row["kode"], "jenis": row["jenis"]}} for row in rows]}

@router.get("/spatial/nearby")
async def get_nearby_halte(lat: float, lon: float, radius: int = 1000):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, jenis, ROUND(ST_Distance(geom::geography, ST_Point($1,$2)::geography)::numeric, 2) as jarak_m FROM transportasi.halte WHERE ST_DWithin(geom::geography, ST_Point($1,$2)::geography, $3) ORDER BY jarak_m", lon, lat, radius)
        return [dict(row) for row in rows]

@router.post("/", status_code=201)
async def create_halte(data: HalteCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow("INSERT INTO transportasi.halte (nama, kode, jenis, alamat, kapasitas, geom) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_Point($6,$7), 4326)) RETURNING id, nama, kode, jenis, alamat, kapasitas, ST_X(geom) as longitude, ST_Y(geom) as latitude", data.nama, data.kode, data.jenis, data.alamat, data.kapasitas, data.longitude, data.latitude)
            return dict(row)
        except asyncpg.exceptions.UniqueViolationError:
             raise HTTPException(status_code=400, detail="Kode Halte sudah terdaftar")

@router.put("/{id}")
async def update_halte(id: int, data: HalteCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("UPDATE transportasi.halte SET nama=$2, kode=$3, jenis=$4, alamat=$5, kapasitas=$6, geom=ST_SetSRID(ST_Point($7,$8), 4326) WHERE id=$1 RETURNING id, nama, kode, jenis, alamat, kapasitas, ST_X(geom) as longitude, ST_Y(geom) as latitude", id, data.nama, data.kode, data.jenis, data.alamat, data.kapasitas, data.longitude, data.latitude)
        if not row:
            raise HTTPException(status_code=404, detail="Halte tidak ditemukan")
        return dict(row)

@router.delete("/{id}", status_code=204)
async def delete_halte(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        check = await conn.fetchval("SELECT id FROM transportasi.halte WHERE id=$1", id)
        if not check:
            raise HTTPException(status_code=404, detail="Halte tidak ditemukan")
        await conn.execute("DELETE FROM transportasi.halte WHERE id=$1", id)