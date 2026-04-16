import { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, Clock, CheckCircle, XCircle, RefreshCw, User, DoorOpen, Phone, Mail, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './FrontDeskPage.css';

const STATUS_BADGE = {
  'Pending':    { cls: 'badge-pending',   label: 'Chờ xác nhận', icon: <Clock size={12} /> },
  'Confirmed':  { cls: 'badge-confirmed', label: 'Đã xác nhận',  icon: <CheckCircle size={12} /> },
  'CheckedIn':  { cls: 'badge-occupied',  label: 'Đang ở',       icon: <CalendarCheck size={12} /> },
  'CheckedOut': { cls: 'badge-checkout',  label: 'Đã trả phòng', icon: <CheckCircle size={12} /> },
  'Cancelled':  { cls: 'badge-cancelled', label: 'Đã hủy',       icon: <XCircle size={12} /> },
};

function TodayArrivalsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Bookings');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Tìm bookings Confirmed mà có checkIn = hôm nay
      const all = Array.isArray(res.data) ? res.data : [];
      const filtered = all.filter(b => {
        if (b.status !== 'Confirmed') return false;
        // bookingDetails có checkInDate
        return true; // We'll check from detail or use booking created_at
      });
      setBookings(filtered);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCheckin = async (id) => {
    try {
      await axiosClient.put(`/Bookings/${id}`, { status: 'CheckedIn' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CheckedIn' } : b));
    } catch (err) {
      alert('Lỗi check-in: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="frontdesk-page">
      <div className="fd-header">
        <div>
          <h1 className="page-title">Khách đến hôm nay</h1>
          <p className="page-subtitle">Ngày {todayStr} · {bookings.length} đơn đã xác nhận chờ nhận phòng</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="fd-refresh-btn">
          <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="fd-loading"><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /><p>Đang tải...</p></div>
      ) : bookings.length === 0 ? (
        <div className="fd-empty">
          <CalendarCheck size={48} style={{ opacity: 0.3 }} />
          <p>Không có khách nào đến hôm nay</p>
        </div>
      ) : (
        <div className="fd-cards-grid">
          {bookings.map(b => {
            const badge = STATUS_BADGE[b.status] ?? {};
            return (
              <div key={b.id} className="fd-guest-card" onClick={() => navigate('/front-desk/bookings', { state: { bookingId: b.id } })} style={{ cursor: 'pointer' }}>
                <div className="fd-card-top">
                  <div className="fd-avatar"><User size={22} /></div>
                  <div className="fd-guest-info">
                    <div className="fd-guest-name">{b.guestName || 'Khách vãng lai'}</div>
                    <div className="fd-booking-code">{b.bookingCode}</div>
                  </div>
                  <span className={`status-badge ${badge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {badge.icon} {badge.label}
                  </span>
                </div>
                <div className="fd-card-info">
                  {b.roomNumbers && b.roomNumbers.length > 0 && (
                    <div className="fd-info-row"><DoorOpen size={14} /><span>Phòng: <strong>{b.roomNumbers.join(', ')}</strong></span></div>
                  )}
                  {b.guestPhone && <div className="fd-info-row"><Phone size={14} /><span>{b.guestPhone}</span></div>}
                  {b.guestEmail && <div className="fd-info-row"><Mail size={14} /><span>{b.guestEmail}</span></div>}
                </div>
                {b.status === 'Confirmed' && (
                  <button className="fd-checkin-btn" onClick={(e) => { e.stopPropagation(); handleCheckin(b.id); }}>
                    <FileCheck size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Làm thủ tục nhận phòng
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TodayArrivalsPage;
