from pydantic import BaseModel, Field
from typing import Optional
from datetime import time

class ParkirCreate(BaseModel):
    nama: str = Field(..., min_length=3)
    jenis: str
    kapasitas: Optional[int] = None
    tarif_per_jam: Optional[int] = None
    jam_buka: Optional[time] = None
    jam_tutup: Optional[time] = None
    pengelola: Optional[str] = None
    longitude: float
    latitude: float