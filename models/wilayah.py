from pydantic import BaseModel, Field
from typing import Optional

class WilayahCreate(BaseModel):
    kode_wilayah: str
    nama: str = Field(..., min_length=3)
    tipe: str
    populasi: Optional[int] = None
    luas_km2: Optional[float] = None
    # Input berupa array of rings untuk POLYGON: [[[lon1,lat1], [lon2,lat2], ..., [lon1,lat1]]]
    coordinates: list[list[list[float]]]