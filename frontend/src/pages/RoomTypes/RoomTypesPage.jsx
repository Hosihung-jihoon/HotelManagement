import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import './RoomTypesPage.css';

/**
 * Trang mẫu CRUD cho RoomTypes - Team copy cấu trúc này cho module khác.
 * 
 * Luồng:  Component -> axiosClient -> Backend API -> Database
 */
function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    capacityAdults: '',
    capacityChildren: '',
    description: '',
  });

  // ========== Load data khi component mount ==========
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/RoomTypes');
      setRoomTypes(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu. Hãy kiểm tra Backend đã chạy chưa.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========== Xử lý form ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        capacityAdults: parseInt(formData.capacityAdults),
        capacityChildren: parseInt(formData.capacityChildren),
      };

      if (editingId) {
        await axiosClient.put(`/RoomTypes/${editingId}`, payload);
      } else {
        await axiosClient.post('/RoomTypes', payload);
      }

      resetForm();
      fetchRoomTypes();
    } catch (err) {
      alert('Lỗi khi lưu dữ liệu: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (roomType) => {
    setEditingId(roomType.id);
    setFormData({
      name: roomType.name,
      basePrice: roomType.basePrice,
      capacityAdults: roomType.capacityAdults,
      capacityChildren: roomType.capacityChildren,
      description: roomType.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại phòng này?')) return;
    try {
      await axiosClient.delete(`/RoomTypes/${id}`);
      fetchRoomTypes();
    } catch (err) {
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      basePrice: '',
      capacityAdults: '',
      capacityChildren: '',
      description: '',
    });
  };

  // ========== Format tiền VNĐ ==========
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // ========== Render ==========
  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="room-types-page">
      <div className="page-header">
        <h1>🏨 Quản Lý Loại Phòng</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Thêm Loại Phòng
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Form tạo/sửa */}
      {showForm && (
        <div className="form-card">
          <h3>{editingId ? '✏️ Sửa Loại Phòng' : '➕ Thêm Loại Phòng Mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên loại phòng</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: Standard Double"
                />
              </div>
              <div className="form-group">
                <label>Giá cơ bản (VNĐ)</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: 500000"
                />
              </div>
              <div className="form-group">
                <label>Sức chứa người lớn</label>
                <input
                  type="number"
                  name="capacityAdults"
                  value={formData.capacityAdults}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Sức chứa trẻ em</label>
                <input
                  type="number"
                  name="capacityChildren"
                  value={formData.capacityChildren}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group full-width">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Mô tả loại phòng..."
                />
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

      {/* Bảng dữ liệu */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Loại Phòng</th>
              <th>Giá / Đêm</th>
              <th>Người Lớn</th>
              <th>Trẻ Em</th>
              <th>Mô Tả</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  Chưa có dữ liệu loại phòng
                </td>
              </tr>
            ) : (
              roomTypes.map((rt) => (
                <tr key={rt.id}>
                  <td>{rt.id}</td>
                  <td className="name-cell">{rt.name}</td>
                  <td className="price-cell">{formatPrice(rt.basePrice)}</td>
                  <td>{rt.capacityAdults}</td>
                  <td>{rt.capacityChildren}</td>
                  <td className="desc-cell">{rt.description || '—'}</td>
                  <td className="action-cell">
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(rt)}>
                      ✏️
                    </button>
                    <button className="btn btn-sm btn-delete" onClick={() => handleDelete(rt.id)}>
                      🗑️
                    </button>
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

export default RoomTypesPage;
