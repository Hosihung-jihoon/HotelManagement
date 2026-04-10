import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Pencil, Trash2, MapPin, Globe } from 'lucide-react';
import '../RoomTypes/RoomTypesPage.css'; // Reusing standard CRUD styles

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    distanceKm: '',
    description: '',
    mapEmbedLink: '',
    latitude: '',
    longitude: '',
    address: '',
    isActive: true
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/Attractions');
      setLocations(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu địa điểm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (editingId) {
        await axiosClient.put(`/Attractions/${editingId}`, payload);
      } else {
        await axiosClient.post('/Attractions', payload);
      }

      resetForm();
      fetchLocations();
    } catch (err) {
      alert('Lỗi khi lưu dữ liệu: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (loc) => {
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      distanceKm: loc.distanceKm || '',
      description: loc.description || '',
      mapEmbedLink: loc.mapEmbedLink || '',
      latitude: loc.latitude || '',
      longitude: loc.longitude || '',
      address: loc.address || '',
      isActive: loc.isActive ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa điểm này?')) return;
    try {
      await axiosClient.delete(`/Attractions/${id}`);
      fetchLocations();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleStatus = async (loc) => {
    try {
      const payload = {
        name: loc.name,
        distanceKm: loc.distanceKm,
        description: loc.description,
        mapEmbedLink: loc.mapEmbedLink,
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
        isActive: !loc.isActive
      };
      await axiosClient.put(`/Attractions/${loc.id}`, payload);
      fetchLocations();
    } catch(err) {
      alert('Lỗi bật tắt trạng thái: ' + err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      distanceKm: '',
      description: '',
      mapEmbedLink: '',
      latitude: '',
      longitude: '',
      address: '',
      isActive: true
    });
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="room-types-page">
      <div className="page-header">
        <h1><MapPin size={28} className="header-icon" /> Quản Lý Địa Điểm</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Thêm Địa Điểm
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? <><Pencil size={20} /> Sửa Địa Điểm</> : <><Plus size={20} /> Thêm Địa Điểm Mới</>}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên địa điểm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Khoảng cách (km)</label>
                <input
                  type="number"
                  step="0.1"
                  name="distanceKm"
                  value={formData.distanceKm}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="0.00000001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="0.00000001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Địa chỉ cụ thể</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Mã nhúng bản đồ Google (Embed Link)</label>
                <input
                  type="text"
                  name="mapEmbedLink"
                  value={formData.mapEmbedLink}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="isActiveCheck"
                />
                <label htmlFor="isActiveCheck" style={{ margin: 0, cursor: 'pointer' }}>Đang hoạt động</label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Cập Nhật' : 'Tạo Mới'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Địa Điểm</th>
              <th>Địa chỉ / Bản đồ</th>
              <th>Trạng thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">Chưa có dữ liệu</td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id}>
                  <td>{loc.id}</td>
                  <td className="name-cell">
                    <strong>{loc.name}</strong><br/>
                    <small>{loc.distanceKm} km</small>
                  </td>
                  <td>
                    {loc.address && <div>{loc.address}</div>}
                    {loc.latitude && <div><MapPin size={12} style={{display: 'inline'}} /> {loc.latitude}, {loc.longitude}</div>}
                    {loc.mapEmbedLink && <div style={{color: '#2563eb'}}>Có bản đồ</div>}
                  </td>
                  <td>
                    <div 
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: loc.isActive ? '#dbeafe' : '#f1f5f9',
                        color: loc.isActive ? '#1d4ed8' : '#64748b'
                      }}
                      onClick={() => toggleStatus(loc)}
                      title="Nhấn để đổi trạng thái"
                    >
                      {loc.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                    </div>
                  </td>
                  <td className="action-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(loc)}><Pencil size={14} /></button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(loc.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
