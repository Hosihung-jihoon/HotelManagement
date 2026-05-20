import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../RoomTypes/RoomTypesPage.css';
import './ServicesPage.css';

const initialForm = {
  name: '',
  price: '',
  unit: '',
  categoryId: '',
};

function formatPrice(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        axiosClient.get('/Services'),
        axiosClient.get('/ServiceCategories'),
      ]);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setError(null);
    } catch (err) {
      setError('Khong the tai danh sach services hoac service categories.');
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
        price: Number(form.price || 0),
        unit: form.unit.trim() || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };

      if (editingId) {
        await axiosClient.put(`/Services/${editingId}`, payload);
      } else {
        await axiosClient.post('/Services', payload);
      }

      resetForm();
      await fetchData();
    } catch (err) {
      alert(`Loi luu service: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (service) => {
    let detail = service;
    try {
      const response = await axiosClient.get(`/Services/${service.id}`);
      detail = response.data || service;
    } catch (err) {
      console.warn('Khong tai duoc detail service, dung du lieu list.', err);
    }

    setEditingId(service.id);
    setForm({
      name: detail.name || '',
      price: detail.price ?? '',
      unit: detail.unit || '',
      categoryId: detail.categoryId ?? service.categoryId ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Xoa service "${service.name}"?`)) return;
    try {
      await axiosClient.delete(`/Services/${service.id}`);
      await fetchData();
    } catch (err) {
      alert(`Loi xoa service: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Dang tai...</div>;
  }

  return (
    <div className="services-page">
      <div className="page-header">
        <h1>Quan Ly Services</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={16} /> Lam moi
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Them service
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card service-form-card">
          <h3>{editingId ? 'Sua service' : 'Them service moi'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ten service</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Gia</label>
                <input type="number" min="0" step="1000" name="price" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Don vi</label>
                <input type="text" name="unit" value={form.unit} onChange={handleChange} placeholder="lan, gio, suat..." />
              </div>
              <div className="form-group">
                <label>Danh muc</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                  <option value="">Khong phan loai</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
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
        {services.length === 0 ? (
          <div className="empty-state">Chua co service nao.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ten service</th>
                <th>Danh muc</th>
                <th>Gia</th>
                <th>Don vi</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td><strong>{service.name}</strong></td>
                  <td>{service.categoryName || categoryMap.get(service.categoryId) || 'Khong phan loai'}</td>
                  <td>{formatPrice(service.price)} VND</td>
                  <td>{service.unit || '-'}</td>
                  <td className="action-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(service)}><Pencil size={14} /></button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(service)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">Hien thi {services.length} service</div>
      </div>
    </div>
  );
}
