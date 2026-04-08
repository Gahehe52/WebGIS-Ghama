from pydantic import BaseModel, Field
from typing import Optional

class HalteCreate(BaseModel):
    nama: str = Field(..., min_length=3)
    kode: str = Field(..., min_length=3)
    jenis: str
    alamat: Optional[str] = None
    kapasitas: Optional[int] = None
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)