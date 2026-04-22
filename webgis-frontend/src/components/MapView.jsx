import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, CircleMarker, Popup, LayerGroup, useMapEvents } from 'react-leaflet';
import api from '../services/api';
import L from 'leaflet';

function MapView() {
  const [wilayah, setWilayah] = useState(null);
  const [rute, setRute] = useState(null);
  const [halte, setHalte] = useState(null);
  const [kecelakaan, setKecelakaan] = useState(null);
  const [parkir, setParkir] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: '', kode: '', jenis: 'brt', alamat: '', kapasitas: 0, longitude: '', latitude: '' });

  const fetchAllData = () => {
    api.get('/wilayah/data/geojson').then(res => setWilayah(res.data)).catch(() => {});
    api.get('/rute/data/geojson').then(res => setRute(res.data)).catch(() => {});
    api.get('/halte/data/geojson').then(res => setHalte(res.data)).catch(() => {});
    api.get('/kecelakaan/data/geojson').then(res => setKecelakaan(res.data)).catch(() => {});
    api.get('/parkir/data/geojson').then(res => setParkir(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddClick = () => {
    setFormData({ id: null, nama: '', kode: '', jenis: 'brt', alamat: '', kapasitas: 0, longitude: '', latitude: '' });
    setIsPickingMode(false);
    setShowForm(true);
  };

  const handleEditClick = async (id) => {
    try {
      const res = await api.get(`/halte/${id}`);
      setFormData(res.data);
      setIsPickingMode(false);
      setShowForm(true);
    } catch (error) {
      alert("Gagal mengambil detail data fasilitas.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus fasilitas ini dari peta?")) {
      try {
        await api.delete(`/halte/${id}`);
        fetchAllData();
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nama: formData.nama,
        kode: formData.kode,
        jenis: formData.jenis,
        alamat: formData.alamat,
        kapasitas: formData.kapasitas,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude)
      };

      if (formData.id) {
        await api.put(`/halte/${formData.id}`, payload);
      } else {
        await api.post('/halte/', payload);
      }
      setShowForm(false);
      setIsPickingMode(false);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.detail || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const MapEventsHandler = () => {
    useMapEvents({
      click(e) {
        if (showForm && isPickingMode) {
          setFormData(prev => ({
            ...prev,
            latitude: e.latlng.lat.toFixed(6),
            longitude: e.latlng.lng.toFixed(6)
          }));
          setIsPickingMode(false);
        }
      }
    });
    return null;
  };

  const popupHeader = (title) => `
    <h3 style="margin: 0 0 8px 0; color: #7b8cb6; border-bottom: 2px solid #7b8cb6; padding-bottom: 4px;">
      ${title}
    </h3>
  `;

  const styleWilayah = () => ({ fillColor: '#7b8cb6', color: '#5a6b96', weight: 2, fillOpacity: 0.3 });
  const styleRute = () => ({ color: '#e74c3c', weight: 4, opacity: 0.8 });

  const onEachFeatureBasic = (feature, layer, titleField, extraFields) => {
    let extraHtml = extraFields.map(f => `<p style="margin: 4px 0;"><b>${f.label}:</b> ${feature.properties[f.key]}</p>`).join('');
    layer.bindPopup(`<div style="font-family: Arial, sans-serif; min-width: 150px;">${popupHeader(feature.properties[titleField] || titleField)}${extraHtml}</div>`);
    layer.on({
      mouseover: (e) => e.target.setStyle({ weight: 6, opacity: 1, fillOpacity: 0.6 }),
      mouseout: (e) => e.target.setStyle({ weight: e.target.feature.geometry.type === 'LineString' ? 4 : 2, opacity: 0.8, fillOpacity: 0.3 }),
      click: (e) => e.target._map.fitBounds ? e.target._map.fitBounds(e.target.getBounds()) : e.target._map.flyTo(e.latlng, 16)
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer center={[-5.42, 105.26]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <MapEventsHandler />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Google Satellite">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution='&copy; Google Maps' />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
          </LayersControl.BaseLayer>

          {wilayah && (
            <LayersControl.Overlay checked name="Wilayah Administrasi">
              <GeoJSON data={wilayah} style={styleWilayah} onEachFeature={(f, l) => onEachFeatureBasic(f, l, 'nama', [{label: 'Tipe', key: 'tipe'}])} />
            </LayersControl.Overlay>
          )}
          
          {rute && (
            <LayersControl.Overlay checked name="Rute Transportasi">
              <GeoJSON data={rute} style={styleRute} onEachFeature={(f, l) => onEachFeatureBasic(f, l, 'nama_rute', [{label: 'Kode', key: 'kode_rute'}])} />
            </LayersControl.Overlay>
          )}
          
          {halte && (
            <LayersControl.Overlay checked name="Halte Transportasi (CRUD Aktif)">
              <LayerGroup>
                {halte.features.map((feature) => {
                  const { id, nama, kode, jenis } = feature.properties;
                  const [lng, lat] = feature.geometry.coordinates;
                  let color = '#3388ff';
                  if (jenis === 'brt') color = '#e74c3c';
                  else if (jenis === 'angkot') color = '#2ecc71';

                  return (
                    <CircleMarker key={`halte-${id}`} center={[lat, lng]} radius={8} fillColor={color} color="#fff" weight={2} fillOpacity={0.9}>
                      <Popup>
                        <div style={{ fontFamily: 'Arial, sans-serif', minWidth: '160px' }}>
                          <h3 style={{ margin: '0 0 8px 0', color: '#7b8cb6', borderBottom: '2px solid #7b8cb6', paddingBottom: '4px' }}>{nama}</h3>
                          <p style={{ margin: '4px 0' }}><b>Kode:</b> {kode}</p>
                          <p style={{ margin: '4px 0' }}><b>Jenis:</b> <span style={{ textTransform: 'capitalize' }}>{jenis}</span></p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button onClick={() => handleEditClick(id)} style={{ flex: 1, padding: '6px', background: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                            <button onClick={() => handleDelete(id)} style={{ flex: 1, padding: '6px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hapus</button>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {showForm && formData.latitude && formData.longitude && (
          <CircleMarker center={[formData.latitude, formData.longitude]} radius={12} fillColor="#f39c12" color="#fff" weight={3} fillOpacity={1}>
            <Popup>Lokasi Titik Baru</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      <div style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 1000 }}>
        <button onClick={handleAddClick} style={{ padding: '14px 24px', background: '#7b8cb6', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
          + Tambah Fasilitas (Halte)
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderLeft: '5px solid #7b8cb6' }}>
            <h2 style={{ color: '#7b8cb6', marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px', fontSize: '1.2rem' }}>
              {formData.id ? 'Edit Data Fasilitas' : 'Tambah Fasilitas Baru'}
            </h2>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <input placeholder="Nama Fasilitas" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#333', background: '#fff' }} />
              <input placeholder="Kode (Misal: HLT-001)" required value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#333', background: '#fff' }} />
              <select value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#333', background: '#fff' }}>
                <option value="brt">BRT</option>
                <option value="angkot">Angkot</option>
                <option value="bus">Bus Umum</option>
              </select>
              <input placeholder="Alamat Detail" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#333', background: '#fff' }} />
              <input type="number" placeholder="Kapasitas" value={formData.kapasitas} onChange={e => setFormData({...formData, kapasitas: parseInt(e.target.value) || 0})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#333', background: '#fff' }} />
              
              <button type="button" onClick={() => setIsPickingMode(!isPickingMode)} style={{ padding: '8px', background: isPickingMode ? '#e67e22' : '#f1f2f6', color: isPickingMode ? '#fff' : '#333', border: isPickingMode ? 'none' : '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '4px' }}>
                {isPickingMode ? 'Merekam... Klik Peta Sekarang' : '📍 Ambil Koordinat dari Peta'}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" step="any" placeholder="Longitude" required value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#333', background: '#fff' }} />
                <input type="number" step="any" placeholder="Latitude" required value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', color: '#333', background: '#fff' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan</button>
                <button type="button" onClick={() => { setShowForm(false); setIsPickingMode(false); }} style={{ flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;