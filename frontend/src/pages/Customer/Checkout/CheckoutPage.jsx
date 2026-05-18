import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../../api/paymentService';
import axiosClient from '../../../api/axiosClient';
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

  const [paymentMethod, setPaymentMethod] = useState(''); // 'vietqr', 'momo' hoặc 'cash'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState({ amount: 0, code: '', qrUrl: '' });

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsVerifying(true);
    setVoucherError('');
    try {
      const res = await axiosClient.post('/Vouchers/validate', { code: voucherCode.trim() });
      setVoucherApplied(res.data);
    } catch (err) {
      setVoucherError('Mã voucher không hợp lệ hoặc đã hết hạn.');
      setVoucherApplied(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const removeVoucher = () => {
    setVoucherApplied(null);
    setVoucherCode('');
    setVoucherError('');
  };

  // Tính toán
  const roomTotal = cart.pricePerNight * cart.nights;
  const vat = roomTotal * 0.08; // VAT 8%
  const subTotalBeforeDiscount = roomTotal + vat;
  const discount = voucherApplied 
    ? (voucherApplied.discountAmount || Math.round(subTotalBeforeDiscount * voucherApplied.discountPercent / 100)) 
    : 0;
  const finalTotal = Math.max(0, subTotalBeforeDiscount - discount);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create real booking via API
      const bookingPayload = {
        guestName: formData.fullName,
        guestPhone: formData.phone,
        guestEmail: formData.email,
        paymentMethod: paymentMethod === 'cash' ? 'Cash' : (paymentMethod === 'momo' ? 'MoMo' : 'VietQR'),
        voucherId: voucherApplied ? voucherApplied.id : null,
        details: [{
          roomId: 1, // Mock room ID for demonstration
          checkInDate: new Date(cart.checkIn).toISOString(),
          checkOutDate: new Date(cart.checkOut).toISOString(),
          pricePerNight: cart.pricePerNight
        }]
      };

      const bookingRes = await axiosClient.post('/Bookings/advanced-create', bookingPayload);
      const bookingId = bookingRes.data.id;

      if (paymentMethod === 'momo') {
        const res = await paymentService.createMomoPayment(finalTotal, `Thanh toán phòng ${cart.roomName}`, bookingId);
        if (res.payUrl) {
          window.location.href = res.payUrl;
          return;
        }
      } else if (paymentMethod === 'vietqr') {
        const res = await paymentService.createVietQR(finalTotal, bookingRes.data.bookingCode);
        setQrData({ 
          amount: finalTotal, 
          code: bookingRes.data.bookingCode, 
          qrUrl: res.data.qrDataURL 
        });
        setShowQR(true);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        alert('Đặt phòng thành công! Mã Code: ' + bookingRes.data.bookingCode);
        navigate('/my-bookings');
      }
    } catch (err) {
      alert('Lỗi xử lý đặt phòng: ' + (err.response?.data?.message || err.message));
      setIsProcessing(false);
    }
  };

  const processBooking = (method, status) => {
    // Giữ nguyên logic processBooking cho thanh toán tiền mặt
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

      const existingBookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
      existingBookings.push(newBooking);
      localStorage.setItem('mockBookings', JSON.stringify(existingBookings));

      setIsProcessing(false);
      alert('Đặt phòng thành công! Mã Code: ' + newBooking.bookingCode);
      navigate('/bookings'); // Redirect to bookings list
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
                <label className={`payment-option momo ${paymentMethod === 'momo' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="momo" onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="payment-info">
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="payment-logo" />
                    <div>
                      <span className="payment-name">Ví điện tử MoMo</span>
                      <span className="payment-desc">Thanh toán nhanh chóng qua ứng dụng MoMo.</span>
                    </div>
                  </div>
                </label>

                <label className={`payment-option vietqr ${paymentMethod === 'vietqr' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="vietqr" onChange={(e) => setPaymentMethod(e.target.value)} />
                  <div className="payment-info">
                    <img src="https://api.vietqr.io/img/vietqr_light.png" alt="VietQR" className="payment-logo" />
                    <div>
                      <span className="payment-name">Chuyển khoản VietQR</span>
                      <span className="payment-desc">Quét mã QR để chuyển khoản ngân hàng nhanh chóng.</span>
                    </div>
                  </div>
                </label>
                
                <label className={`payment-option cash ${paymentMethod === 'cash' ? 'selected' : ''}`}>
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

            <div className="voucher-section" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="text" 
                  value={voucherCode} 
                  onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá..."
                  disabled={!!voucherApplied}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'inherit' }}
                />
                {!voucherApplied ? (
                  <button 
                    type="button" 
                    onClick={handleApplyVoucher}
                    disabled={isVerifying || !!voucherApplied}
                    style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--c-primary, #2563eb)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isVerifying ? 'Đang xét...' : 'Áp dụng'}
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={removeVoucher}
                    style={{ padding: '10px 20px', borderRadius: 8, background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              {voucherError && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 8 }}>{voucherError}</div>}
              {voucherApplied && (
                <div style={{ color: '#059669', fontSize: '0.88rem', marginTop: 8, fontWeight: 500 }}>
                  ✓ Đã áp dụng mã giảm giá {voucherApplied.discountPercent ? `${voucherApplied.discountPercent}%` : formatCurrency(voucherApplied.discountAmount)}
                </div>
              )}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Tiền phòng ({cart.nights} đêm)</span>
                <span>{formatCurrency(roomTotal)}</span>
              </div>
              <div className="price-row vat">
                <span>Thuế giá trị gia tăng (8%)</span>
                <span>{formatCurrency(vat)}</span>
              </div>
              {voucherApplied && (
                <div className="price-row" style={{ color: '#059669', fontWeight: 600 }}>
                  <span>Giảm giá ({voucherApplied.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
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

      {/* VietQR Modal */}
      {showQR && (
        <div className="vietqr-overlay">
          <div className="vietqr-modal">
            <div className="vietqr-header">
              <h3>Thanh toán VietQR</h3>
              <button className="btn-close-modal" onClick={() => navigate('/my-bookings')}>×</button>
            </div>
            <div className="vietqr-body">
              <p className="qr-guide">Vui lòng dùng ứng dụng Ngân hàng quét mã bên dưới</p>
              <div className="qr-container">
                {qrData.qrUrl ? (
                  <img src={qrData.qrUrl} alt="VietQR Code" className="qr-image" />
                ) : (
                  <div className="qr-loading">Đang tải mã QR...</div>
                )}
              </div>
              <div className="payment-details">
                <div className="detail-row">
                  <span>Số tiền:</span>
                  <strong className="amount">{formatCurrency(qrData.amount)}</strong>
                </div>
                <div className="detail-row">
                  <span>Nội dung:</span>
                  <strong>Thanh toan phong {qrData.code}</strong>
                </div>
              </div>
              <button className="btn-done" onClick={() => navigate('/my-bookings')}>
                Tôi đã chuyển khoản thành công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
