import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ReactQuill from 'react-quill';
import { FileText, Plus, Pencil, Trash2, LayoutList, Image as ImageIcon, MapPin as MapPinIcon } from 'lucide-react';
import 'react-quill/dist/quill.snow.css'; // ES6
import './ArticlesPage.css';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]); // Attractions
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    attractionId: '',
    thumbnailUrl: '',
    content: '',
    isActive: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [artRes, catRes, locRes] = await Promise.all([
        axiosClient.get('/Articles'),
        axiosClient.get('/ArticleCategories'),
        axiosClient.get('/Attractions')
      ]);
      setArticles(artRes.data);
      setCategories(catRes.data);
      setLocations(locRes.data);
      setError(null);
    } catch (err) {
      setError('Lỗi tải dữ liệu. API chưa sẵn sàng hoặc gặp lỗi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========== Xử lý form ==========
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const res = await axiosClient.post('/Upload/image?folder=hotel/articles', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, thumbnailUrl: res.data.url }));
    } catch (err) {
       alert('Upload ảnh thất bại: ' + err.message);
    } finally {
       setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        attractionId: formData.attractionId ? parseInt(formData.attractionId) : null,
      };

      if (editingId) {
        await axiosClient.put(`/Articles/${editingId}`, payload);
      } else {
        await axiosClient.post('/Articles', payload);
      }

      resetForm();
      fetchInitialData();
    } catch (err) {
      alert('Lỗi lưu bài viết: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = async (article) => {
    // API có thể cần gọi chi tiết để lấy content (GetById) thay vì lấy mảng không chứa full content
    try {
      setLoading(true);
      const detailRes = await axiosClient.get(`/Articles/${article.slug || article.id}`);
      const detail = detailRes.data;
      
      setEditingId(detail.id);
      setFormData({
        title: detail.title || '',
        categoryId: detail.categoryId || '',
        attractionId: detail.attractionId || '',
        thumbnailUrl: detail.thumbnailUrl || '',
        content: detail.content || '',
        isActive: detail.isActive ?? true
      });
      setShowForm(true);
    } catch (err) {
      alert('Không thể tải chi tiết bài viết: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await axiosClient.delete(`/Articles/${id}`);
      fetchInitialData();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      categoryId: '',
      attractionId: '',
      thumbnailUrl: '',
      content: '',
      isActive: true
    });
  };

  if (loading && !showForm) return <div className="loading">Đang tải...</div>;

  return (
    <div className="articles-page">
      <div className="page-header">
        <h1><FileText size={28} className="header-icon" /> Quản Lý Bài Viết</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/articles/categories" className="btn btn-secondary">
            <LayoutList size={18} /> Danh Mục Bài Viết
          </Link>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} /> Thêm Bài Viết
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Editor Form */}
      {showForm && (
        <div className="form-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3>{editingId ? <><Pencil size={20} /> Sửa Bài Viết</> : <><Plus size={20} /> Tạo Bài Viết Mới</>}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Tiêu đề bài viết</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Danh mục</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Gắn với Địa điểm / Ưu đãi</label>
                <select name="attractionId" value={formData.attractionId} onChange={handleInputChange}>
                  <option value="">-- Thuộc địa điểm (Tùy chọn) --</option>
                  {locations.map(l => (
                     <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>Ảnh bìa (Thumbnail)</label>
                {formData.thumbnailUrl && (
                  <img src={formData.thumbnailUrl} alt="Cover" style={{ width: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                {isUploading && <span style={{color: 'blue'}}>Đang upload...</span>}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="isActiveCheck"
                />
                <label htmlFor="isActiveCheck" style={{ margin: 0, cursor: 'pointer' }}>Đăng công khai (Active)</label>
              </div>

              <div className="form-group full-width">
                <label style={{ marginBottom: '10px', display: 'block' }}>Nội dung bài viết</label>
                <div style={{ background: '#fff', color: '#000' }}>
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={handleQuillChange} 
                    style={{ height: '300px', marginBottom: '40px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={isUploading}>
                {editingId ? 'Cập Nhật Bài Viết' : 'Đăng Bài'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bài viết List */}
      {!showForm && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">Chưa có bài viết.</td>
                </tr>
              ) : (
                articles.map(art => (
                  <tr key={art.id}>
                    <td>
                      {art.thumbnailUrl ? (
                         <img src={art.thumbnailUrl} alt="thumb" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                         <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px' }}></div>
                      )}
                    </td>
                    <td><strong title={art.title}>{art.title}</strong><br/><small>{art.attractionName && <><MapPinIcon size={12} style={{display: 'inline'}} /> {art.attractionName}</>}</small></td>
                    <td>{art.categoryName || '—'}</td>
                    <td>{art.authorName || '—'}</td>
                    <td>{new Date(art.publishedAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      {art.isActive ? <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Đã đăng</span> : <span style={{ color: '#64748b' }}>Nháp</span>}
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(art)}><Pencil size={14} /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(art.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
