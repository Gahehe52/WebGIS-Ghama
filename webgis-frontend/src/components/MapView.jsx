import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, CircleMarker, Popup, LayerGroup, useMapEvents } from 'react-leaflet';
import api from '../services/api';
import L from 'leaflet';

function MapView() {
  const mapRef = useRef(null);
  
  const [wilayah, setWilayah] = useState(null);
  const [rute, setRute] = useState(null);
  const [halte, setHalte] = useState(null);
  const [kecelakaan, setKecelakaan] = useState(null);
  const [parkir, setParkir] = useState(null);
  const [aiDetections, setAiDetections] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: '', kode: '', jenis: 'brt', alamat: '', kapasitas: 0, longitude: '', latitude: '' });

  const fetchAllData = () => {
    api.get('/wilayah/data/geojson').then(res => setWilayah(res.data)).catch(() => {});
    api.get('/rute/data/geojson').then(res => setRute(res.data)).catch(() => {});
    api.get('/halte/data/geojson').then(res => setHalte(res.data)).catch(() => {});
    api.get('/kecelakaan/data/geojson').then(res => setKecelakaan(res.data)).catch(() => {});
    api.get('/parkir/data/geojson').then(res => setParkir(res.data)).catch(() => {});
    api.get('/ai/detections/geojson').then(res => setAiDetections(res.data)).catch(() => {});
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
      alert("Gagal mengambil detail data.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus fasilitas ini?")) {
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
      alert("Terjadi kesalahan simpan data.");
    }
  };

  const handleFocusAI = (feature) => {
    if (mapRef.current) {
      const [lng, lat] = feature.geometry.coordinates[0][0];
      mapRef.current.flyTo([lat, lng], 18, {
        animate: true,
        duration: 1.5
      });
      if (window.innerWidth < 768) setIsSidebarOpen(false);
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

  const styleWilayah = () => ({ fillColor: '#7b8cb6', color: '#5a6b96', weight: 2, fillOpacity: 0.3 });
  const styleRute = () => ({ color: '#e74c3c', weight: 4, opacity: 0.8 });
  const styleAi = () => ({ color: '#f39c12', weight: 3, fillOpacity: 0.3 });

  const onEachFeatureBasic = (feature, layer, titleField, extraFields) => {
    let extraHtml = extraFields.map(f => `<p style="margin: 4px 0;"><b>${f.label}:</b> ${feature.properties[f.key]}</p>`).join('');
    layer.bindPopup(`<div style="font-family: Arial, sans-serif; min-width: 150px;"><h3 style="margin: 0 0 8px 0; color: #7b8cb6; border-bottom: 2px solid #7b8cb6; padding-bottom: 4px;">${feature.properties[titleField] || titleField}</h3>${extraHtml}</div>`);
  };

  const onEachAi = (feature, layer) => {
    const { label, confidence } = feature.properties;
    layer.bindPopup(`<div style="font-family: Arial, sans-serif; min-width: 150px;"><h3 style="margin: 0 0 8px 0; color: #7b8cb6; border-bottom: 2px solid #7b8cb6; padding-bottom: 4px;">Deteksi AI</h3><p style="margin: 4px 0;"><b>Objek:</b> <span style="text-transform: capitalize;">${label}</span></p><p style="margin: 4px 0;"><b>Akurasi:</b> ${confidence}</p></div>`);
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden', display: 'flex' }}>
      
      <div style={{ 
        width: isSidebarOpen ? '300px' : '0', 
        height: '100%', 
        background: '#fff', 
        transition: 'width 0.3s ease', 
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>🤖 Hasil Deteksi AI</h3>
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#95a5a6' }}>×</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiDetections && aiDetections.features && aiDetections.features.length > 0 ? (
              aiDetections.features.map((feature, index) => (
                <div key={index} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'capitalize', color: '#2c3e50', marginBottom: '4px' }}>{feature.properties.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '10px' }}>Akurasi: {feature.properties.confidence}</div>
                  <button onClick={() => handleFocusAI(feature)} style={{ width: '100%', padding: '6px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Fokus Lokasi</button>
                </div>
              ))
            ) : (
              <p style={{ color: '#95a5a6', textAlign: 'center' }}>Tidak ada data deteksi.</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[-5.42, 105.26]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }} ref={mapRef}>
          <MapEventsHandler />
          
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Google Satellite">
              <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution='&copy; Google Maps' />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            </LayersControl.BaseLayer>

            {wilayah && (
              <LayersControl.Overlay checked name="Wilayah Administrasi">
                <GeoJSON data={wilayah} style={styleWilayah} onEachFeature={(f, l) => onEachFeatureBasic(f, l, 'nama', [{label: 'Tipe', key: 'tipe'}])} />
              </LayersControl.Overlay>
            )}
            
            {halte && (
              <LayersControl.Overlay checked name="Halte Transportasi">
                <LayerGroup>
                  {halte.features.map((feature) => {
                    const { id, nama, kode, jenis } = feature.properties;
                    const [lng, lat] = feature.geometry.coordinates;
                    let color = jenis === 'brt' ? '#e74c3c' : (jenis === 'angkot' ? '#2ecc71' : '#3388ff');
                    return (
                      <CircleMarker key={`halte-${id}`} center={[lat, lng]} radius={8} fillColor={color} color="#fff" weight={2} fillOpacity={0.9}>
                        <Popup>
                          <div style={{ fontFamily: 'Arial, sans-serif', minWidth: '160px' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#7b8cb6', borderBottom: '2px solid #7b8cb6', paddingBottom: '4px' }}>{nama}</h3>
                            <p style={{ margin: '4px 0' }}><b>Kode:</b> {kode}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                              <button onClick={() => handleEditClick(id)} style={{ flex: 1, padding: '6px', background: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDelete(id)} style={{ flex: 1, padding: '6px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </LayerGroup>
              </LayersControl.Overlay>
            )}

            {aiDetections && (
              <LayersControl.Overlay checked name="Hasil Deteksi AI">
                <GeoJSON data={aiDetections} style={styleAi} onEachFeature={onEachAi} />
              </LayersControl.Overlay>
            )}
          </LayersControl>

          {showForm && formData.latitude && formData.longitude && (
            <CircleMarker center={[formData.latitude, formData.longitude]} radius={12} fillColor="#f39c12" color="#fff" weight={3} fillOpacity={1}>
              <Popup>Lokasi Titik Baru</Popup>
            </CircleMarker>
          )}
        </MapContainer>

        <div style={{ position: 'absolute', top: '80px', left: '10px', zIndex: 1000 }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ 
              width: '44px', 
              height: '44px', 
              background: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)', 
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Buka Daftar Deteksi AI"
          >
            🤖
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 1000 }}>
          <button onClick={handleAddClick} style={{ padding: '14px 24px', background: '#7b8cb6', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            + Tambah Fasilitas
          </button>
        </div>

        {showForm && (
          <div style={{ position: 'absolute', top: '20px', left: '70px', zIndex: 2000 }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderLeft: '5px solid #7b8cb6' }}>
              <h2 style={{ color: '#7b8cb6', marginTop: 0, fontSize: '1.1rem' }}>{formData.id ? 'Edit Fasilitas' : 'Tambah Fasilitas'}</h2>
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input placeholder="Nama" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input placeholder="Kode" required value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <button type="button" onClick={() => setIsPickingMode(!isPickingMode)} style={{ padding: '8px', background: isPickingMode ? '#e67e22' : '#f1f2f6', color: isPickingMode ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {isPickingMode ? 'Merekam... Klik Peta' : '📍 Ambil Koordinat'}
                </button>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input placeholder="Lng" required value={formData.longitude} readOnly style={{ width: '50%', padding: '8px', background: '#eee' }} />
                  <input placeholder="Lat" required value={formData.latitude} readOnly style={{ width: '50%', padding: '8px', background: '#eee' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Simpan</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;