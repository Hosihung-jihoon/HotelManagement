import { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';
import './BookingHistoryPage.css';

/**
 * Trang Lịch sử đặt phòng (Customer)
 * Lấy lịch sử đặt phòng từ API
 */
function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/Bookings');
        // Sort by newest
        const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sorted);
      } catch (err) {
        console.error('Lỗi tải lịch sử đặt phòng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handlePayNow = (bookingId) => {
    alert(`Chức năng thanh toán lại cho mã ${bookingId} sẽ được chuyển đến trang VNPay...`);
  };

  const StatusBadge = ({ status }) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <span className="b-badge b-paid">✅ Đã Thanh Toán</span>;
      case 'pending':
        return <span className="b-badge b-pending">⏳ Chờ Thanh Toán</span>;
      case 'failed':
        return <span className="b-badge b-cancelled">🚫 Thất Bại</span>;
      case 'cancelled':
        return <span className="b-badge b-cancelled">🚫 Đã Hủy</span>;
      case 'completed':
        return <span className="b-badge b-completed">🏨 Đã Hoàn Thành</span>;
      default:
        return <span className="b-badge">{status}</span>;
    }
  };

  return (
    <div className="booking-history-page">
      <div className="bh-header">
        <h1>📅 Lịch Sử Đặt Phòng Của Bạn</h1>
        <p>Quản lý các chuyến đi và thanh toán.</p>
      </div>

      <div className="bh-list">
        {loading ? (
          <div className="bh-empty">
            <h3>Đang tải...</h3>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bh-empty">
            <div className="bh-empty-icon">🧳</div>
            <h3>Bạn chưa có chuyến đi nào</h3>
            <p>Hãy khám phá các phòng nghỉ tuyệt vời của chúng tôi ngay hôm nay!</p>
            <a href="/" className="btn-explore">Trang Chủ</a>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="bh-card">
              <div className="bh-card-header">
                <div>
                  <span className="bh-code">Mã: {b.bookingCode}</span>
                  <span className="bh-date-booked">
                    Đặt lúc: {new Date(b.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <StatusBadge status={b.status} />
              </div>
              
              <div className="bh-card-body">
                <div className="bh-room-img">
                  {/* Fake room image */}
                  <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32" alt="Room" />
                </div>
                
                <div className="bh-room-info">
                  <h3 className="bh-room-title">{b.roomName}</h3>
                  <div className="bh-dates-row">
                    <div className="bh-date-item">
                      <span className="b-lbl">Nhận phòng</span>
                      <strong className="b-val">{new Date(b.checkInDate).toLocaleDateString('vi-VN')}</strong>
                    </div>
                    <div className="bh-date-divider">🔜</div>
                    <div className="bh-date-item">
                      <span className="b-lbl">Trả phòng</span>
                      <strong className="b-val">{new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</strong>
                    </div>
                  </div>
                  <div className="bh-payment-method">
                    <span className="b-lbl">Thanh toán qua:</span>
                    <strong className="b-val">{b.paymentMethod}</strong>
                  </div>
                </div>

                <div className="bh-price-info">
                  <span className="b-lbl">Tổng cộng</span>
                  <strong className="bh-total-price">{formatCurrency(b.totalAmount)}</strong>
                  
                  <div className="bh-actions">
                    {b.status === 'Pending' && (
                      <button className="btn-pay-now" onClick={() => handlePayNow(b.id)}>
                        Thanh Toán Ngay
                      </button>
                    )}
                    <button className="btn-view-details">Xem Chi Tiết</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookingHistoryPage;
