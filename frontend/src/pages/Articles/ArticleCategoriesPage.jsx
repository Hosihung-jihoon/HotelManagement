import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Pencil, Trash2, LayoutList } from 'lucide-react';
import '../RoomTypes/RoomTypesPage.css';

export default function ArticleCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/ArticleCategories');
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Lỗi tải danh mục bài viết.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/ArticleCategories/${editingId}`, formData);
      } else {
        await axiosClient.post('/ArticleCategories', formData);
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      alert('Lỗi lưu danh mục: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await axiosClient.delete(`/ArticleCategories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '' });
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="room-types-page">
      <div className="page-header">
        <h1><LayoutList size={28} className="header-icon" /> Danh Mục Bài Viết</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> Thêm Danh Mục</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? <><Pencil size={20} /> Sửa Danh Mục</> : <><Plus size={20} /> Thêm Danh Mục</>}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên danh mục</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Slug URL (Tùy chọn)</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingId ? 'Cập Nhật' : 'Tạo Mới'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Danh Mục</th>
              <th>Slug</th>
              <th>Mô Tả</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="5" className="empty-row">Chưa có danh mục nào.</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.slug || '-'}</td>
                  <td>{cat.description || '-'}</td>
                  <td className="action-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(cat)}><Pencil size={14} /></button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(cat.id)}><Trash2 size={14} /></button>
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
