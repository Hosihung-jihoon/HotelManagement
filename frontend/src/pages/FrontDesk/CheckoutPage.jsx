import { useState, useEffect, useCallback } from 'react';
import { LogOut, RefreshCw, User, CheckCircle, DoorOpen, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './FrontDeskPage.css';

function CheckoutPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  const navigate = useNavigate();

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

  const handleCheckout = async (id) => {
    if (!window.confirm('Xác nhận làm thủ tục trả phòng cho đơn này?')) return;
    setProcessing(id);
    try {
      await axiosClient.put(`/Bookings/${id}`, { status: 'CheckedOut' });
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message) {
         setErrorModal(err.response.data.message);
      } else {
         setErrorModal('Lỗi trả phòng: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="frontdesk-page">
      <div className="fd-header">
        <div>
          <h1 className="page-title">Thủ tục trả phòng</h1>
          <p className="page-subtitle">{bookings.length} đơn cần trả phòng</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="fd-refresh-btn">
          <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="fd-loading"><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /><p>Đang tải...</p></div>
      ) : bookings.length === 0 ? (
        <div className="fd-empty">
          <CheckCircle size={48} style={{ opacity: 0.3, color: '#22c55e' }} />
          <p>Không có đơn nào cần trả phòng</p>
        </div>
      ) : (
        <div className="fd-cards-grid">
          {bookings.map(b => (
            <div key={b.id} className="fd-guest-card checkout-card" onClick={() => navigate('/admin/front-desk/bookings', { state: { bookingId: b.id } })} style={{ cursor: 'pointer' }}>
              <div className="fd-card-top">
                <div className="fd-avatar checkout-avatar"><User size={22} /></div>
                <div className="fd-guest-info">
                  <div className="fd-guest-name">{b.guestName || 'Khách vãng lai'}</div>
                  <div className="fd-booking-code">{b.bookingCode}</div>
                </div>
                <span className="status-badge badge-occupied" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                  Đang lưu trú
                </span>
              </div>
              <div className="fd-card-info">
                {b.roomNumbers && b.roomNumbers.length > 0 && (
                  <div className="fd-info-row"><DoorOpen size={14} /><span>Phòng: <strong>{b.roomNumbers.join(', ')}</strong></span></div>
                )}
                {b.guestPhone && <div className="fd-info-row"><Phone size={14} /><span>{b.guestPhone}</span></div>}
                {b.guestEmail && <div className="fd-info-row"><Mail size={14} /><span>{b.guestEmail}</span></div>}
              </div>
              <button
                className="fd-checkout-btn"
                onClick={(e) => { e.stopPropagation(); handleCheckout(b.id); }}
                disabled={processing === b.id}
              >
                <LogOut size={15} />
                {processing === b.id ? 'Đang xử lý...' : 'Làm thủ tục trả phòng'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal báo lỗi Checkout */}
      {errorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 30px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ background: '#fee2e2', color: '#dc2626', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} style={{ display: 'none' }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>!</span>
              </div>
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: '#1f2937' }}>Thông báo trả phòng</h3>
            <p style={{ margin: '0 0 20px', color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5 }}>{errorModal}</p>
            <button 
              onClick={() => setErrorModal(null)}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
