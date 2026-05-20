import { useEffect, useState } from 'react';
import { ImageIcon, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../RoomTypes/RoomTypesPage.css';
import './AmenitiesPage.css';

const initialForm = {
  name: '',
  iconUrl: '',
};

function hasImagePreview(url) {
  return /\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(url || '');
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/Amenities');
      setAmenities(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Khong the tai danh sach amenities.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm(initialForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        iconUrl: form.iconUrl.trim() || null,
      };

      if (editingId) {
        await axiosClient.put(`/Amenities/${editingId}`, payload);
      } else {
        await axiosClient.post('/Amenities', payload);
      }

      resetForm();
      await fetchAmenities();
    } catch (err) {
      alert(`Loi luu amenity: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (amenity) => {
    let detail = amenity;
    try {
      const response = await axiosClient.get(`/Amenities/${amenity.id}`);
      detail = response.data || amenity;
    } catch (err) {
      console.warn('Khong tai duoc detail amenity, dung du lieu list.', err);
    }

    setEditingId(amenity.id);
    setForm({
      name: detail.name || '',
      iconUrl: detail.iconUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (amenity) => {
    if (!window.confirm(`An amenity "${amenity.name}"?`)) return;
    try {
      await axiosClient.delete(`/Amenities/${amenity.id}`);
      await fetchAmenities();
    } catch (err) {
      alert(`Loi xoa amenity: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Dang tai...</div>;
  }

  return (
    <div className="amenities-page">
      <div className="page-header">
        <h1>Quan Ly Amenities</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchAmenities}>
            <RefreshCw size={16} /> Lam moi
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Them amenity
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card amenity-form-card">
          <h3>{editingId ? 'Sua amenity' : 'Them amenity moi'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ten amenity</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Icon / image URL</label>
                <input type="text" name="iconUrl" value={form.iconUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group full-width">
                <label>Xem truoc</label>
                <div className="amenity-preview-box">
                  {form.iconUrl ? (
                    hasImagePreview(form.iconUrl) ? (
                      <img src={form.iconUrl} alt={form.name || 'Amenity preview'} className="amenity-preview-image" />
                    ) : (
                      <div className="amenity-preview-text">{form.iconUrl}</div>
                    )
                  ) : (
                    <div className="amenity-preview-empty">
                      <ImageIcon size={18} /> Chua co icon URL
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Dang luu...' : (editingId ? 'Cap nhat' : 'Tao moi')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Huy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        {amenities.length === 0 ? (
          <div className="empty-state">Chua co amenity nao.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amenity</th>
                <th>Icon / image</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((amenity) => (
                <tr key={amenity.id}>
                  <td>{amenity.id}</td>
                  <td><strong>{amenity.name}</strong></td>
                  <td>
                    {amenity.iconUrl ? (
                      hasImagePreview(amenity.iconUrl) ? (
                        <img src={amenity.iconUrl} alt={amenity.name} className="amenity-table-image" />
                      ) : (
                        <span className="amenity-link-text">{amenity.iconUrl}</span>
                      )
                    ) : (
                      <span className="amenity-link-text">-</span>
                    )}
                  </td>
                  <td className="action-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(amenity)}><Pencil size={14} /></button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(amenity)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">Hien thi {amenities.length} amenity</div>
      </div>
    </div>
  );
}
