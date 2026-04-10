import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import './AmenitiesPage.css';

function AmenitiesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/Amenities');
      // Tùy theo API có thể trả về mảng trực tiếp, hoặc một object có chứa mảng data
      const items = Array.isArray(response.data) ? response.data : 
                    Array.isArray(response.data?.data) ? response.data.data : [];
      setData(items);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
         setData([]); // API not ready yet
      } else {
         setError('Không thể tải dữ liệu do lỗi cấu hình, hoặc Backend Controller chưa được viết chính xác.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="amenities-page">
      <div className="page-header">
        <h1>Quản Lý Amenities</h1>
        <button className="btn btn-primary" onClick={() => alert('Chức năng thêm mới đang phát triển')}>+ Thêm Mới</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-card">
        {data.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu, hãy thêm mới! (Hoặc API của Router này chưa hoàn thiện, trả về rỗng)</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).slice(0, 7).map((key) => <th key={key}>{key}</th>)}
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id || index}>
                  {Object.values(item).slice(0, 7).map((val, i) => (
                    <td key={i}>{typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}</td>
                  ))}
                  <td>
                    <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '12px', background: '#eab308'}}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AmenitiesPage;
