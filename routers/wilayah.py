from fastapi import APIRouter, HTTPException
from database import get_pool
from models.wilayah import WilayahCreate
import json
import asyncpg

router = APIRouter(prefix="/api/wilayah", tags=["Wilayah Administrasi"])

@router.get("/")
async def get_all_wilayah():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, kode_wilayah, nama, tipe, populasi, ST_AsGeoJSON(geom) as geom FROM transportasi.wilayah LIMIT 100")
        return [dict(row) for row in rows]

@router.get("/{id}")
async def get_wilayah_by_id(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id, kode_wilayah, nama, tipe, populasi, ST_AsText(geom) as wkt_geom FROM transportasi.wilayah WHERE id=$1", id)
        if not row:
            raise HTTPException(status_code=404, detail="Wilayah tidak ditemukan")
        return dict(row)

@router.get("/data/geojson")
async def get_wilayah_geojson():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, kode_wilayah, nama, tipe, ST_AsGeoJSON(geom) as geom FROM transportasi.wilayah")
        return {"type": "FeatureCollection", "features": [{"type": "Feature", "geometry": json.loads(row["geom"]), "properties": {"id": row["id"], "kode_wilayah": row["kode_wilayah"], "nama": row["nama"], "tipe": row["tipe"]}} for row in rows]}

@router.get("/spatial/nearby")
async def get_nearby_wilayah(lat: float, lon: float, radius: int = 1000):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, tipe, ROUND(ST_Distance(geom::geography, ST_Point($1,$2)::geography)::numeric, 2) as jarak_m FROM transportasi.wilayah WHERE ST_DWithin(geom::geography, ST_Point($1,$2)::geography, $3) ORDER BY jarak_m", lon, lat, radius)
        return [dict(row) for row in rows]

@router.post("/", status_code=201)
async def create_wilayah(data: WilayahCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Mengubah array of rings menjadi format WKT POLYGON
        rings_str = []
        for ring in data.coordinates:
            ring_coords = ", ".join([f"{c[0]} {c[1]}" for c in ring])
            rings_str.append(f"({ring_coords})")
        wkt = f"POLYGON({', '.join(rings_str)})"
        
        try:
            row = await conn.fetchrow("INSERT INTO transportasi.wilayah (kode_wilayah, nama, tipe, populasi, luas_km2, geom) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromText($6), 4326)) RETURNING id, kode_wilayah, nama", data.kode_wilayah, data.nama, data.tipe, data.populasi, data.luas_km2, wkt)
            return dict(row)
        except asyncpg.exceptions.UniqueViolationError:
             raise HTTPException(status_code=400, detail="Kode Wilayah sudah terdaftar")

@router.put("/{id}")
async def update_wilayah(id: int, data: WilayahCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rings_str = []
        for ring in data.coordinates:
            ring_coords = ", ".join([f"{c[0]} {c[1]}" for c in ring])
            rings_str.append(f"({ring_coords})")
        wkt = f"POLYGON({', '.join(rings_str)})"
        
        row = await conn.fetchrow("UPDATE transportasi.wilayah SET kode_wilayah=$2, nama=$3, tipe=$4, populasi=$5, luas_km2=$6, geom=ST_SetSRID(ST_GeomFromText($7), 4326) WHERE id=$1 RETURNING id, kode_wilayah, nama", id, data.kode_wilayah, data.nama, data.tipe, data.populasi, data.luas_km2, wkt)
        if not row:
            raise HTTPException(status_code=404, detail="Wilayah tidak ditemukan")
        return dict(row)

@router.delete("/{id}", status_code=204)
async def delete_wilayah(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        check = await conn.fetchval("SELECT id FROM transportasi.wilayah WHERE id=$1", id)
        if not check:
            raise HTTPException(status_code=404, detail="Wilayah tidak ditemukan")
        await conn.execute("DELETE FROM transportasi.wilayah WHERE id=$1", id)