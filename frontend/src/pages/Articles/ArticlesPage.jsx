import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  FileText, Plus, Pencil, Trash2, LayoutList,
  MapPin as MapPinIcon, RefreshCw,
} from 'lucide-react';
import './ArticlesPage.css';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Articles');
      setArticles(res.data || []);
      setError(null);
    } catch (err) {
      setError('Lỗi tải dữ liệu. API chưa sẵn sàng hoặc gặp lỗi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await axiosClient.delete(`/Articles/${id}`);
      fetchArticles();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="articles-page">
      <div className="page-header">
        <h1><FileText size={28} className="header-icon" /> Quản Lý Bài Viết</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/articles/categories" className="btn btn-secondary">
            <LayoutList size={18} /> Danh Mục Bài Viết
          </Link>
          <button className="btn btn-secondary" onClick={fetchArticles} disabled={loading}>
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/articles/editor')}>
            <Plus size={18} /> Thêm Bài Viết
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Đang tải bài viết...</p>
        </div>
      ) : (
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
                  <td colSpan="7" className="empty-row">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <FileText size={36} style={{ opacity: 0.3 }} />
                      <span>Chưa có bài viết nào — nhấn "Thêm Bài Viết" để bắt đầu</span>
                    </div>
                  </td>
                </tr>
              ) : articles.map(art => (
                <tr key={art.id}>
                  <td>
                    {art.thumbnailUrl ? (
                      <img src={art.thumbnailUrl} alt="thumb"
                        style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '52px', height: '52px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} style={{ opacity: 0.3 }} />
                      </div>
                    )}
                  </td>
                  <td>
                    <strong title={art.title}>{art.title}</strong>
                    <br />
                    <small>
                      {art.attractionName && (
                        <><MapPinIcon size={12} style={{ display: 'inline' }} /> {art.attractionName}</>
                      )}
                    </small>
                  </td>
                  <td>{art.categoryName || '—'}</td>
                  <td>{art.authorName || '—'}</td>
                  <td>{new Date(art.publishedAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    {art.isActive
                      ? <span style={{ color: '#2563eb', fontWeight: 700 }}>Đã đăng</span>
                      : <span style={{ color: '#94a3b8' }}>Nháp</span>}
                  </td>
                  <td className="action-cell">
                    <button className="btn btn-sm btn-edit"
                      onClick={() => navigate(`/articles/editor/${art.slug || art.id}`)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(art.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && <div className="table-footer">Hiển thị {articles.length} bài viết</div>}
        </div>
      )}
    </div>
  );
}
