import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { BedDouble, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import './RoomTypesPage.css';

const initialFormData = {
  name: '',
  basePrice: '',
  capacityAdults: '',
  capacityChildren: '',
  description: '',
  amenityIds: [],
  recommendedServiceIds: []
};

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0);
}

function toggleId(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchData();
  }, []);

  const serviceOptions = useMemo(
    () => services.map((service) => ({
      ...service,
      label: service.categoryName ? `${service.name} (${service.categoryName})` : service.name
    })),
    [services]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomTypesRes, amenitiesRes, servicesRes] = await Promise.all([
        axiosClient.get('/RoomTypes'),
        axiosClient.get('/Amenities'),
        axiosClient.get('/Services')
      ]);
      setRoomTypes(Array.isArray(roomTypesRes.data) ? roomTypesRes.data : []);
      setAmenities(Array.isArray(amenitiesRes.data) ? amenitiesRes.data : []);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      setError(null);
    } catch (err) {
      setError('Khong the tai du lieu loai phong, tien nghi hoac dich vu.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData(initialFormData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleEdit = async (roomType) => {
    try {
      setSaving(true);
      const res = await axiosClient.get(`/RoomTypes/${roomType.id}`);
      const detail = res.data;
      setEditingId(roomType.id);
      setFormData({
        name: detail.name || '',
        basePrice: detail.basePrice ?? '',
        capacityAdults: detail.capacityAdults ?? '',
        capacityChildren: detail.capacityChildren ?? '',
        description: detail.description || '',
        amenityIds: Array.isArray(detail.amenityIds) ? detail.amenityIds : [],
        recommendedServiceIds: Array.isArray(detail.recommendedServiceIds) ? detail.recommendedServiceIds : []
      });
      setShowForm(true);
    } catch (err) {
      alert(`Khong the tai chi tiet loai phong: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        basePrice: parseFloat(formData.basePrice) || 0,
        capacityAdults: parseInt(formData.capacityAdults, 10) || 0,
        capacityChildren: parseInt(formData.capacityChildren, 10) || 0,
        description: formData.description,
        amenityIds: formData.amenityIds,
        recommendedServiceIds: formData.recommendedServiceIds
      };

      if (editingId) {
        await axiosClient.put(`/RoomTypes/${editingId}`, payload);
      } else {
        await axiosClient.post('/RoomTypes', payload);
      }

      resetForm();
      await fetchData();
    } catch (err) {
      alert(`Loi khi luu loai phong: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ban co chac muon xoa loai phong nay?')) return;
    try {
      await axiosClient.delete(`/RoomTypes/${id}`);
      await fetchData();
    } catch (err) {
      alert(`Loi khi xoa loai phong: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Dang tai du lieu...</div>;
  }

  return (
    <div className="room-types-page">
      <div className="page-header">
        <h1><BedDouble size={28} className="header-icon" /> Cau Hinh Hang Phong</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={16} /> Lam moi
          </button>
          <button className="btn btn-primary" onClick={openCreateForm}>
            <Plus size={18} /> Them hang phong
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? <><Pencil size={18} /> Sua hang phong</> : <><Plus size={18} /> Them hang phong moi</>}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ten hang phong</label>
                <input name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Gia co ban (VND)</label>
                <input type="number" name="basePrice" value={formData.basePrice} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Suc chua nguoi lon</label>
                <input type="number" min="1" name="capacityAdults" value={formData.capacityAdults} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Suc chua tre em</label>
                <input type="number" min="0" name="capacityChildren" value={formData.capacityChildren} onChange={handleInputChange} required />
              </div>
              <div className="form-group full-width">
                <label>Mo ta</label>
                <textarea rows="3" name="description" value={formData.description} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label>Tien nghi di kem</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  {amenities.map((amenity) => (
                    <label key={amenity.id} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.amenityIds.includes(amenity.id)}
                        onChange={() => setFormData((prev) => ({
                          ...prev,
                          amenityIds: toggleId(prev.amenityIds, amenity.id)
                        }))}
                      />
                      <span>{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group full-width">
                <label>Dich vu goi y / upsell</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {serviceOptions.map((service) => (
                    <label key={service.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.recommendedServiceIds.includes(service.id)}
                        onChange={() => setFormData((prev) => ({
                          ...prev,
                          recommendedServiceIds: toggleId(prev.recommendedServiceIds, service.id)
                        }))}
                      />
                      <span>
                        <strong>{service.label}</strong>
                        <br />
                        <small style={{ color: '#64748b' }}>{formatPrice(service.price)}{service.unit ? ` / ${service.unit}` : ''}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Dang luu...' : editingId ? 'Cap nhat' : 'Tao moi'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Huy</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hang phong</th>
              <th>Gia / dem</th>
              <th>Suc chua</th>
              <th>Tien nghi & goi y</th>
              <th>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">Chua co hang phong nao.</td>
              </tr>
            ) : roomTypes.map((roomType) => (
              <tr key={roomType.id}>
                <td>{roomType.id}</td>
                <td>
                  <strong>{roomType.name}</strong>
                  {roomType.description && (
                    <div style={{ marginTop: 4, color: '#64748b', fontSize: '0.85rem' }}>
                      {roomType.description}
                    </div>
                  )}
                </td>
                <td className="price-cell">{formatPrice(roomType.basePrice)}</td>
                <td>{roomType.capacityAdults} nguoi lon / {roomType.capacityChildren} tre em</td>
                <td style={{ color: '#64748b' }}>
                  Cau hinh chi tiet co trong form sua.
                </td>
                <td className="action-cell">
                  <button className="btn btn-sm btn-edit" onClick={() => handleEdit(roomType)} disabled={saving}>
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-sm btn-delete" onClick={() => handleDelete(roomType.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
