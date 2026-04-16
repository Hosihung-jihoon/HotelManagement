import { useState, useEffect, useCallback } from 'react';
import { BedDouble, RefreshCw, User, Clock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './FrontDeskPage.css';

function CurrentGuestsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Bookings');
      const all = Array.isArray(res.data) ? res.data : [];
      setBookings(all.filter(b => b.status === 'CheckedIn'));
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="frontdesk-page">
      <div className="fd-header">
        <div>
          <h1 className="page-title">Khách đang lưu trú</h1>
          <p className="page-subtitle">{bookings.length} đơn đang check-in</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="fd-refresh-btn">
          <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="fd-loading"><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /><p>Đang tải...</p></div>
      ) : bookings.length === 0 ? (
        <div className="fd-empty">
          <BedDouble size={48} style={{ opacity: 0.3 }} />
          <p>Hiện không có khách nào đang lưu trú</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Mã booking</th>
                <th>Phòng</th>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#2563eb' }}>
                      {b.bookingCode}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{b.roomNumbers && b.roomNumbers.length > 0 ? b.roomNumbers.join(', ') : '—'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="fd-avatar sm"><User size={14} /></div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{b.guestName || 'Khách vãng lai'}</div>
                        {b.guestEmail && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{b.guestEmail}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{b.guestPhone || '—'}</td>
                  <td>
                    <span className="status-badge badge-occupied" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> Đang lưu trú
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">Hiển thị {bookings.length} khách đang lưu trú</div>
        </div>
      )}
    </div>
  );
}

export default CurrentGuestsPage;
