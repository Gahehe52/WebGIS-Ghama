from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class KecelakaanCreate(BaseModel):
    tanggal: date
    waktu: Optional[time] = None
    jenis_kecelakaan: str
    jumlah_korban: Optional[int] = 0
    jumlah_kendaraan: Optional[int] = 1
    penyebab: Optional[str] = None
    kondisi_jalan: Optional[str] = None
    kondisi_cuaca: Optional[str] = None
    keterangan: Optional[str] = None
    longitude: float
    latitude: float