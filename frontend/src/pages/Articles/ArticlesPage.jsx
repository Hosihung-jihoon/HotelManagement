import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LayoutList, MapPin as MapPinIcon, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './ArticlesPage.css';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/Articles');
      setArticles(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Khong the tai danh sach bai viet.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xoa bai viet nay?')) return;
    try {
      await axiosClient.delete(`/Articles/${id}`);
      await fetchArticles();
    } catch (err) {
      alert(`Loi xoa bai viet: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="articles-page">
      <div className="page-header">
        <h1><FileText size={28} className="header-icon" /> Quan Ly Bai Viet</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/articles/categories" className="btn btn-secondary">
            <LayoutList size={18} /> Danh muc bai viet
          </Link>
          <button className="btn btn-secondary" onClick={fetchArticles} disabled={loading}>
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Lam moi
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/articles/editor')}>
            <Plus size={18} /> Them bai viet
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Dang tai bai viet...</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Anh</th>
                <th>Tieu de</th>
                <th>Danh muc</th>
                <th>Tac gia</th>
                <th>Ngay dang</th>
                <th>Trang thai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <FileText size={36} style={{ opacity: 0.3 }} />
                      <span>Chua co bai viet nao.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      {article.thumbnailUrl ? (
                        <img
                          src={article.thumbnailUrl}
                          alt="thumb"
                          style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '52px', height: '52px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={20} style={{ opacity: 0.3 }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong title={article.title}>{article.title}</strong>
                      <br />
                      <small style={{ color: '#64748b' }}>/ {article.slug || 'draft-slug'}</small>
                      <br />
                      <small>
                        {article.attractionName && (
                          <><MapPinIcon size={12} style={{ display: 'inline' }} /> {article.attractionName}</>
                        )}
                      </small>
                    </td>
                    <td>{article.categoryName || '-'}</td>
                    <td>{article.authorName || '-'}</td>
                    <td>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'Chua dang'}</td>
                    <td>
                      {article.isActive ? (
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>Hien tren client</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Ban nhap / an tren client</span>
                      )}
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => navigate(`/admin/articles/editor/${article.id}`)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(article.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-footer">Hien thi {articles.length} bai viet</div>
        </div>
      )}
    </div>
  );
}
