import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';

function MapView() {
  const [wilayah, setWilayah] = useState(null);
  const [rute, setRute] = useState(null);
  const [halte, setHalte] = useState(null);
  const [kecelakaan, setKecelakaan] = useState(null);
  const [parkir, setParkir] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/wilayah/data/geojson').then(res => setWilayah(res.data)).catch(console.error);
    axios.get('http://localhost:8000/api/rute/data/geojson').then(res => setRute(res.data)).catch(console.error);
    axios.get('http://localhost:8000/api/halte/data/geojson').then(res => setHalte(res.data)).catch(console.error);
    axios.get('http://localhost:8000/api/kecelakaan/data/geojson').then(res => setKecelakaan(res.data)).catch(console.error);
    axios.get('http://localhost:8000/api/parkir/data/geojson').then(res => setParkir(res.data)).catch(console.error);
  }, []);

  const popupHeader = (title) => `
    <h3 style="margin: 0 0 8px 0; color: #7b8cb6; border-bottom: 2px solid #7b8cb6; padding-bottom: 4px;">
      ${title}
    </h3>
  `;

  const styleWilayah = () => {
    return { fillColor: '#7b8cb6', color: '#5a6b96', weight: 2, fillOpacity: 0.3 };
  };

  const onEachWilayah = (feature, layer) => {
    const { nama, tipe } = feature.properties;
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif; min-width: 150px;">
        ${popupHeader(nama)}
        <p style="margin: 4px 0;"><b>Tipe:</b> ${tipe}</p>
      </div>
    `);
    layer.on({
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.6, weight: 3 }),
      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.3, weight: 2 }),
      click: (e) => e.target._map.fitBounds(e.target.getBounds())
    });
  };

  const styleRute = () => {
    return { color: '#e74c3c', weight: 4, opacity: 0.8 };
  };

  const onEachRute = (feature, layer) => {
    const { nama_rute, kode_rute } = feature.properties;
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif; min-width: 150px;">
        ${popupHeader(nama_rute)}
        <p style="margin: 4px 0;"><b>Kode:</b> ${kode_rute}</p>
      </div>
    `);
    layer.on({
      mouseover: (e) => e.target.setStyle({ weight: 6, opacity: 1 }),
      mouseout: (e) => e.target.setStyle({ weight: 4, opacity: 0.8 }),
      click: (e) => e.target._map.fitBounds(e.target.getBounds())
    });
  };

  const pointHalte = (feature, latlng) => {
    return L.circleMarker(latlng, { radius: 8, fillColor: '#3388ff', color: '#ffffff', weight: 2, fillOpacity: 0.9 });
  };

  const onEachHalte = (feature, layer) => {
    const { nama, kode, jenis } = feature.properties;
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif; min-width: 150px;">
        ${popupHeader(nama)}
        <p style="margin: 4px 0;"><b>Kode:</b> ${kode}</p>
        <p style="margin: 4px 0;"><b>Jenis:</b> <span style="text-transform: capitalize;">${jenis}</span></p>
      </div>
    `);
    layer.on({
      mouseover: (e) => e.target.setStyle({ radius: 12, fillColor: '#7b8cb6' }),
      mouseout: (e) => e.target.setStyle({ radius: 8, fillColor: '#3388ff' }),
      click: (e) => e.target._map.flyTo(e.latlng, 16, { duration: 1.5 })
    });
  };

  const pointKecelakaan = (feature, latlng) => {
    return L.circleMarker(latlng, { radius: 8, fillColor: '#e74c3c', color: '#ffffff', weight: 2, fillOpacity: 0.9 });
  };

  const onEachKecelakaan = (feature, layer) => {
    const { tanggal, jenis_kecelakaan } = feature.properties;
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif; min-width: 150px;">
        ${popupHeader("Titik Kecelakaan")}
        <p style="margin: 4px 0;"><b>Tanggal:</b> ${tanggal}</p>
        <p style="margin: 4px 0;"><b>Jenis:</b> ${jenis_kecelakaan}</p>
      </div>
    `);
    layer.on({
      mouseover: (e) => e.target.setStyle({ radius: 12, fillColor: '#7b8cb6' }),
      mouseout: (e) => e.target.setStyle({ radius: 8, fillColor: '#e74c3c' }),
      click: (e) => e.target._map.flyTo(e.latlng, 16, { duration: 1.5 })
    });
  };

  const pointParkir = (feature, latlng) => {
    return L.circleMarker(latlng, { radius: 8, fillColor: '#2ecc71', color: '#ffffff', weight: 2, fillOpacity: 0.9 });
  };

  const onEachParkir = (feature, layer) => {
    const { nama, jenis } = feature.properties;
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif; min-width: 150px;">
        ${popupHeader(nama)}
        <p style="margin: 4px 0;"><b>Jenis:</b> ${jenis}</p>
      </div>
    `);
    layer.on({
      mouseover: (e) => e.target.setStyle({ radius: 12, fillColor: '#7b8cb6' }),
      mouseout: (e) => e.target.setStyle({ radius: 8, fillColor: '#2ecc71' }),
      click: (e) => e.target._map.flyTo(e.latlng, 16, { duration: 1.5 })
    });
  };

  return (
    <MapContainer center={[-5.42, 105.26]} zoom={13} style={{ height: '100%', width: '100%' }}>
      
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Google Satellite">
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        {wilayah && (
          <LayersControl.Overlay checked name="Wilayah Administrasi">
            <GeoJSON data={wilayah} style={styleWilayah} onEachFeature={onEachWilayah} />
          </LayersControl.Overlay>
        )}
        
        {rute && (
          <LayersControl.Overlay checked name="Rute Transportasi">
            <GeoJSON data={rute} style={styleRute} onEachFeature={onEachRute} />
          </LayersControl.Overlay>
        )}
        
        {halte && (
          <LayersControl.Overlay checked name="Halte Transportasi">
            <GeoJSON data={halte} pointToLayer={pointHalte} onEachFeature={onEachHalte} />
          </LayersControl.Overlay>
        )}

        {kecelakaan && (
          <LayersControl.Overlay checked name="Data Kecelakaan">
            <GeoJSON data={kecelakaan} pointToLayer={pointKecelakaan} onEachFeature={onEachKecelakaan} />
          </LayersControl.Overlay>
        )}

        {parkir && (
          <LayersControl.Overlay checked name="Lokasi Parkir">
            <GeoJSON data={parkir} pointToLayer={pointParkir} onEachFeature={onEachParkir} />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
}

export default MapView;