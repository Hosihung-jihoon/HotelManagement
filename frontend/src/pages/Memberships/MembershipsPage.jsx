import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import './MembershipsPage.css';

function MembershipsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ tierName: '', minPoints: 0, discountPercent: 0, amenities: '', services: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/Memberships');
      const items = Array.isArray(response.data) ? response.data : 
                    Array.isArray(response.data?.data) ? response.data.data : [];
      setData(items);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
         setData([]); // API not ready yet
      } else {
         setError('Không thể tải dữ liệu do lỗi cấu hình, hoặc thiếu bảng trong Database.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      tierName: item.tierName || '',
      minPoints: item.minPoints || 0,
      discountPercent: item.discountPercent || 0,
      amenities: item.amenities || '',
      services: item.services || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await axiosClient.put(`/Memberships/${editingItem.id}`, formData);
      } else {
        await axiosClient.post('/Memberships', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Lỗi khi lưu dữ liệu!');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="memberships-page">
      <div className="page-header">
        <h1>Quản Lý Hạng Thành Viên</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingItem(null);
          setFormData({ tierName: '', minPoints: 0, discountPercent: 0, amenities: '', services: '' });
          setIsModalOpen(true);
        }}>+ Thêm Mới</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-card">
        {data.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu hạng thành viên.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Hạng</th>
                <th>Điểm Tối Thiểu</th>
                <th>Giảm Giá (%)</th>
                <th>Tiện Nghi (Amenities)</th>
                <th>Dịch Vụ (Services)</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td><strong>{item.tierName}</strong></td>
                  <td>{item.minPoints}</td>
                  <td>{item.discountPercent}%</td>
                  <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {item.amenities || '-'}
                  </td>
                  <td style={{maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {item.services || '-'}
                  </td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleEdit(item)} style={{padding: '4px 12px', fontSize: '12px', background: '#eab308', border: 'none'}}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '500px'}}>
            <h2>{editingItem ? 'Sửa Hạng Thành Viên' : 'Thêm Hạng Mới'}</h2>
            
            <div className="form-group" style={{marginTop: '15px'}}>
              <label>Tên hạng (Tier Name)</label>
              <input type="text" className="form-control" value={formData.tierName} onChange={e => setFormData({...formData, tierName: e.target.value})} />
            </div>

            <div style={{display: 'flex', gap: '15px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Điểm tối thiểu</label>
                <input type="number" className="form-control" value={formData.minPoints} onChange={e => setFormData({...formData, minPoints: parseInt(e.target.value) || 0})} />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Giảm giá (%)</label>
                <input type="number" className="form-control" value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: parseFloat(e.target.value) || 0})} />
              </div>
            </div>

            <div className="form-group">
              <label>Tiện Nghi (Cách nhau bởi dấu phẩy)</label>
              <textarea className="form-control" rows="3" placeholder="VD: Wi-Fi miễn phí, Dọn phòng hàng ngày..." value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})}></textarea>
            </div>

            <div className="form-group">
              <label>Dịch Vụ (Cách nhau bởi dấu phẩy)</label>
              <textarea className="form-control" rows="3" placeholder="VD: Đưa đón sân bay, Spa miễn phí..." value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})}></textarea>
            </div>

            <div className="modal-actions" style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>Lưu Lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembershipsPage;
