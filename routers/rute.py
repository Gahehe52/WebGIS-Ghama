from fastapi import APIRouter, HTTPException
from database import get_pool
from models.rute import RuteCreate
import json
import asyncpg

router = APIRouter(prefix="/api/rute", tags=["Rute Transportasi"])

@router.get("/")
async def get_all_rute():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, kode_rute, nama_rute, jenis, tarif, ST_AsGeoJSON(geom) as geom FROM transportasi.rute LIMIT 100")
        return [dict(row) for row in rows]

@router.get("/{id}")
async def get_rute_by_id(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id, kode_rute, nama_rute, jenis, tarif, ST_AsText(geom) as wkt_geom FROM transportasi.rute WHERE id=$1", id)
        if not row:
            raise HTTPException(status_code=404, detail="Rute tidak ditemukan")
        return dict(row)

@router.get("/data/geojson")
async def get_rute_geojson():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, kode_rute, nama_rute, ST_AsGeoJSON(geom) as geom FROM transportasi.rute")
        return {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": json.loads(row["geom"]), "properties": {"id": row["id"], "kode_rute": row["kode_rute"], "nama_rute": row["nama_rute"]}} for row in rows]}

@router.get("/spatial/nearby")
async def get_nearby_rute(lat: float, lon: float, radius: int = 1000):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama_rute, jenis, ROUND(ST_Distance(geom::geography, ST_Point($1,$2)::geography)::numeric, 2) as jarak_m FROM transportasi.rute WHERE ST_DWithin(geom::geography, ST_Point($1,$2)::geography, $3) ORDER BY jarak_m", lon, lat, radius)
        return [dict(row) for row in rows]

@router.post("/", status_code=201)
async def create_rute(data: RuteCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        coords_str = ", ".join([f"{c[0]} {c[1]}" for c in data.coordinates])
        wkt = f"LINESTRING({coords_str})"
        try:
            row = await conn.fetchrow("INSERT INTO transportasi.rute (kode_rute, nama_rute, jenis, tarif, geom) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_GeomFromText($5), 4326)) RETURNING id, kode_rute, nama_rute", data.kode_rute, data.nama_rute, data.jenis, data.tarif, wkt)
            return dict(row)
        except asyncpg.exceptions.UniqueViolationError:
             raise HTTPException(status_code=400, detail="Kode Rute sudah terdaftar")

@router.put("/{id}")
async def update_rute(id: int, data: RuteCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        coords_str = ", ".join([f"{c[0]} {c[1]}" for c in data.coordinates])
        wkt = f"LINESTRING({coords_str})"
        row = await conn.fetchrow("UPDATE transportasi.rute SET kode_rute=$2, nama_rute=$3, jenis=$4, tarif=$5, geom=ST_SetSRID(ST_GeomFromText($6), 4326) WHERE id=$1 RETURNING id, kode_rute, nama_rute", id, data.kode_rute, data.nama_rute, data.jenis, data.tarif, wkt)
        if not row:
            raise HTTPException(status_code=404, detail="Rute tidak ditemukan")
        return dict(row)

@router.delete("/{id}", status_code=204)
async def delete_rute(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        check = await conn.fetchval("SELECT id FROM transportasi.rute WHERE id=$1", id)
        if not check:
            raise HTTPException(status_code=404, detail="Rute tidak ditemukan")
        await conn.execute("DELETE FROM transportasi.rute WHERE id=$1", id)