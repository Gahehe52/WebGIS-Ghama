from pydantic import BaseModel, Field
from typing import Optional

class RuteCreate(BaseModel):
    kode_rute: str
    nama_rute: str = Field(..., min_length=3)
    jenis: str
    warna: Optional[str] = None
    panjang_km: Optional[float] = None
    estimasi_waktu_menit: Optional[int] = None
    tarif: Optional[int] = None
    # Input berupa array of coordinates untuk LINESTRING: [[lon1, lat1], [lon2, lat2], ...]
    coordinates: list[list[float]] = Field(..., min_items=2)