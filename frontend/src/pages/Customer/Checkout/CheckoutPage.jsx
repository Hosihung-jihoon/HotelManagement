import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

/**
 * Trang Checkout (Giỏ hàng & Thanh toán) cho Khách hàng.
 * Cho phép nhập thông tin khách, chọn phương thức thanh toán, và hiển thị Modal VNPay giả lập.
 */
function CheckoutPage() {
  const navigate = useNavigate();

  // Mock data giỏ hàng (trong thực tế sẽ lấy từ Context/Redux/LocalStorage)
  const [cart] = useState({
    roomName: 'Deluxe Ocean View',
    roomType: 'Deluxe',
    checkIn: '2026-04-01',
    checkOut: '2026-04-03',
    nights: 2,
    pricePerNight: 1500000,
    capacity: '2 Người lớn, 1 Trẻ em'
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState(''); // 'vnpay' hoặc 'cash'
  const [showVnPayModal, setShowVnPayModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tính toán
  const roomTotal = cart.pricePerNight * cart.nights;
  const vat = roomTotal * 0.08; // VAT 8%
  const finalTotal = roomTotal + vat;

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán.');
      return;
    }

    if (paymentMethod === 'vnpay') {
      setShowVnPayModal(true);
    } else {
      processBooking('Cash', 'Pending');
    }
  };

  const processBooking = (method, status) => {
    setIsProcessing(true);
    
    // Giả lập call API lưu booking
    setTimeout(() => {
      const newBooking = {
        id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
        bookingCode: 'VN' + Date.now().toString().slice(-6),
        checkInDate: cart.checkIn,
        checkOutDate: cart.checkOut,
        roomName: cart.roomName,
        totalAmount: finalTotal,
        paymentMethod: method,
        status: status, // Pending hoặc Paid
        createdAt: new Date().toISOString(),
      };

      // Lưu tạm vào LocalStorage để trang Booking History có thể đọc
      const existingBookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      existingBookings.push(newBooking);
      localStorage.setItem('mockBookings', JSON.stringify(existingBookings));

      setIsProcessing(false);
      setShowVnPayModal(false);
      
      alert('Đặt phòng thành công! Mã Code: ' + newBooking.bookingCode);
      navigate('/my-bookings');
    }, 1500);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Xác nhận đặt phòng & Thanh toán</h1>
        <p>Vui lòng điền thông tin và hoàn tất thanh toán để giữ chỗ.</p>
      </div>

      <div className="checkout-container">
        {/* Left Form */}
        <div className="checkout-left">
          <form id="checkoutForm" onSubmit={handleCheckout}>
            <div className="form-section">
              <h3 className="section-title">1. Thông tin người đặt</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Họ và tên *</label>
                  <input type="text" name="fullName" required placeholder="Nhập họ và tên..." onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email liên hệ *</label>
                  <input type="email" name="email" required placeholder="example@email.com" onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input type="tel" name="phone" required placeholder="0912..." onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label>Ghi chú đặc biệt</label>
                  <textarea name="notes" rows="3" placeholder="Yêu cầu riêng..." onChange={handleInputChange}></textarea>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">2. Phương thức thanh toán</h3>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'vnpay' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="vnpay" onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="payment-info">
                    <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/11/qr-vnpay-331.png" alt="VNPay" className="payment-logo" />
                    <div>
                      <span className="payment-name">Thanh toán qua VNPAY</span>
                      <span className="payment-desc">Quét mã QR qua ứng dụng ngân hàng hoặc ví VNPAY.</span>
                    </div>
                  </div>
                </label>
                
                <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="cash" onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="payment-info">
                    <span className="payment-icon">💵</span>
                    <div>
                      <span className="payment-name">Thanh toán trả sau / Tại quầy</span>
                      <span className="payment-desc">Giữ chỗ trước, thanh toán khi nhận phòng.</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Details */}
        <div className="checkout-right">
          <div className="summary-card">
            <h3 className="section-title">Chi tiết đặt phòng</h3>
            
            <div className="room-summary">
              <h4>{cart.roomName}</h4>
              <p className="room-type">{cart.roomType}</p>
              
              <div className="booking-dates">
                <div className="date-box">
                  <span className="date-label">Nhận phòng</span>
                  <span className="date-val">{new Date(cart.checkIn).toLocaleDateString('vi-VN')}</span>
                  <span className="time-val">Từ 14:00</span>
                </div>
                <div className="date-divider">→</div>
                <div className="date-box">
                  <span className="date-label">Trả phòng</span>
                  <span className="date-val">{new Date(cart.checkOut).toLocaleDateString('vi-VN')}</span>
                  <span className="time-val">Trước 12:00</span>
                </div>
              </div>
              <p className="stay-duration">Tổng thời gian lưu trú: <strong>{cart.nights} đêm</strong></p>
            </div>

            <hr className="summary-divider"/>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Tiền phòng ({cart.nights} đêm)</span>
                <span>{formatCurrency(roomTotal)}</span>
              </div>
              <div className="price-row vat">
                <span>Thuế giá trị gia tăng (8%)</span>
                <span>{formatCurrency(vat)}</span>
              </div>
              <div className="price-row total">
                <span>Tổng cộng</span>
                <span className="total-amount">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <button type="submit" form="checkoutForm" className="btn-confirm-booking" disabled={isProcessing}>
              {isProcessing ? 'Đang xử lý...' : 'Xác Nhận & Thanh Toán'}
            </button>
            <p className="policy-text">
              Bằng cách nhấn nút Xác nhận, bạn đồng ý với Điều khoản và chính sách hủy phòng.
            </p>
          </div>
        </div>
      </div>

      {/* VNPay Mock Modal */}
      {showVnPayModal && (
        <div className="vnpay-overlay">
          <div className="vnpay-modal">
            <div className="vnpay-header">
              <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/11/qr-vnpay-331.png" alt="VNPay Logo" />
              <button className="btn-close-vnpay" onClick={() => setShowVnPayModal(false)} disabled={isProcessing}>✕</button>
            </div>
            
            <div className="vnpay-body">
              <div className="vnpay-invoice-info">
                <div className="vnpay-row">
                  <span>Đơn hàng:</span>
                  <strong>{cart.roomName} x {cart.nights} đêm</strong>
                </div>
                <div className="vnpay-row highlight">
                  <span>Số tiền:</span>
                  <strong className="vnpay-amount">{formatCurrency(finalTotal)}</strong>
                </div>
              </div>

              {isProcessing ? (
                <div className="vnpay-processing">
                  <div className="spinner"></div>
                  <p>Đang xử lý giao dịch...</p>
                </div>
              ) : (
                <div className="vnpay-methods">
                  <div className="qr-section">
                    <h4>Quét mã QR để thanh toán</h4>
                    <div className="qr-code-box">
                      {/* Fake QR via an svg or image placeholder */}
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=vnpay_mock_data" alt="QR" />
                    </div>
                    <p>Mở ứng dụng Mobile Banking để quét mã</p>
                  </div>
                  <div className="card-section">
                    <h4>Hoặc thanh toán qua thẻ ATM/Nội địa</h4>
                    <button className="btn-mock-pay" onClick={() => processBooking('VNPAY', 'Paid')}>
                      Mô phỏng Thanh toán thành công ✅
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="vnpay-footer">
              <p>Mã giao dịch có hiệu lực trong: <strong>14:59</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
