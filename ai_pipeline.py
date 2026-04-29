import cv2
import json
import rasterio
from rasterio.transform import from_origin
from pyproj import Transformer
from ultralytics import YOLO

def process_large_image(image_path, output_geojson="detections.geojson", tile_size=640):
    model = YOLO('yolov8n.pt')
    
    # Filter hanya untuk kendaraan
    target_vehicle_classes = [2, 3, 5, 7]
    min_confidence = 0.25

    transformer = None
    
    try:
        with rasterio.open(image_path) as src:
            transform = src.transform
            img = src.read().transpose(1, 2, 0)
            if img.shape[2] == 4:
                img = img[:, :, :3]
            
            # Jika ada metadata CRS bawaan, buat alat konversi ke WGS 84 (EPSG:4326)
            if src.crs:
                transformer = Transformer.from_crs(src.crs, "EPSG:4326", always_xy=True)
                
    except Exception:
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        transform = from_origin(105.26, -5.42, 0.00005, 0.00005)

    if img is None:
        return

    h, w, _ = img.shape
    features = []

    for y in range(0, h, tile_size):
        for x in range(0, w, tile_size):
            tile = img[y:y+tile_size, x:x+tile_size]
            
            if tile.shape[0] < 32 or tile.shape[1] < 32:
                continue
                
            results = model(tile, verbose=False)
            
            for box in results[0].boxes:
                conf = box.conf[0].item()
                cls_id = int(box.cls[0].item())

                if conf < min_confidence or cls_id not in target_vehicle_classes:
                    continue
                
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                label = model.names[cls_id]
                
                # Posisi piksel absolut pada gambar
                global_x1 = x + x1
                global_y1 = y + y1
                global_x2 = x + x2
                global_y2 = y + y2
                
                # Konversi ke koordinat mentah bawaan gambar (bisa meter atau derajat)
                gx1, gy1 = transform * (global_x1, global_y1)
                gx2, gy2 = transform * (global_x2, global_y2)
                
                # Ubah paksa ke format Latitude/Longitude (WGS 84) agar terbaca oleh Leaflet
                if transformer:
                    lon1, lat1 = transformer.transform(gx1, gy1)
                    lon2, lat2 = transformer.transform(gx2, gy2)
                else:
                    lon1, lat1 = gx1, gy1
                    lon2, lat2 = gx2, gy2
                
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [lon1, lat1],
                            [lon2, lat1],
                            [lon2, lat2],
                            [lon1, lat2],
                            [lon1, lat1]
                        ]]
                    },
                    "properties": {
                        "label": label,
                        "confidence": round(conf, 2)
                    }
                }
                features.append(feature)

    geojson_data = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(output_geojson, "w") as f:
        json.dump(geojson_data, f, indent=2)

if __name__ == "__main__":
    process_large_image("sample.tif")