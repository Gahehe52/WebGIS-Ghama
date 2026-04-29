from fastapi import APIRouter
import json
import os

router = APIRouter(prefix="/api/ai", tags=["Spatial AI"])

@router.get("/detections/geojson")
async def get_detections():
    file_path = "detections.geojson"
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}