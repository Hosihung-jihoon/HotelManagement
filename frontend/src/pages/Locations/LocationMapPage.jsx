import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Map, MapPin } from 'lucide-react';

export default function LocationMapPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/Attractions');
      // Chỉ hiển thị các địa điểm Active
      setLocations(response.data.filter(l => l.isActive));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải bản đồ...</div>;

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Map size={32} color="#2563eb" /> Bản đồ Địa Điểm
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {locations.length === 0 && <p>Chưa có địa điểm nào được kích hoạt.</p>}
        {locations.map((loc) => (
          <div key={loc.id} style={{
             border: '1px solid #ddd', 
             borderRadius: '8px', 
             padding: '16px',
             backgroundColor: '#fff'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} /> {loc.name} {loc.distanceKm && `(${loc.distanceKm} km)`}
            </h3>
            {loc.address && <p style={{ margin: '0 0 10px 0' }}>📍 {loc.address}</p>}
            {loc.description && <p style={{ margin: '0 0 10px 0', color: '#666' }}>{loc.description}</p>}
            
            {loc.mapEmbedLink ? (
              <div 
                style={{ width: '100%', height: '300px', borderRadius: '4px', overflow: 'hidden' }}
                dangerouslySetInnerHTML={{ __html: loc.mapEmbedLink }}
              />
            ) : loc.latitude ? (
              <div style={{ padding: '20px', backgroundColor: '#f8f9fa', border: '1px dashed #ccc', textAlign: 'center' }}>
                <MapPin size={24} color="#3b82f6" style={{marginBottom: '8px'}} /> <br/>
                Tọa độ: {loc.latitude}, {loc.longitude} 
                <br/><small>(Chưa hỗ trợ render bản đồ động không dùng iframe)</small>
              </div>
            ) : (
              <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404' }}>
                Chưa có dữ liệu bản đồ.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
