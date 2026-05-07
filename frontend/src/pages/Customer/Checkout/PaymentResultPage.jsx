import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, CreditCard, Calendar, User, ArrowRight, RefreshCcw } from 'lucide-react';
import './PaymentResultPage.css';

/**
 * PaymentResultPage - Handles callback from MoMo and VNPay
 */
function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'failed'
  const [data, setData] = useState({});

  useEffect(() => {
    // Simulate a brief delay for a "smooth" verification feel
    const timer = setTimeout(() => {
      parsePaymentResult();
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const parsePaymentResult = () => {
    // 1. Detect MoMo callback (uses 'resultCode' or 'message')
    const momoResultCode = searchParams.get('resultCode');
    if (momoResultCode !== null) {
      const isSuccess = momoResultCode === '0';
      setStatus(isSuccess ? 'success' : 'failed');
      setData({
        method: 'MoMo',
        amount: searchParams.get('amount'),
        orderId: searchParams.get('orderId'),
        message: isSuccess ? 'Thanh toán MoMo thành công' : 'Thanh toán MoMo thất bại',
        transId: searchParams.get('transId')
      });
      return;
    }

    // Default fallback
    setStatus('failed');
    setData({ message: 'Không tìm thấy thông tin giao dịch.' });
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  if (loading) {
    return (
      <div className="payment-result-loading">
        <div className="loading-content">
          <div className="payment-spinner"></div>
          <h2>Đang xác thực giao dịch...</h2>
          <p>Vui lòng không đóng trình duyệt hoặc tải lại trang.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className={`result-card ${status}`}>
        <div className="result-header">
          {status === 'success' ? (
            <div className="icon-wrapper success">
              <CheckCircle size={64} />
            </div>
          ) : (
            <div className="icon-wrapper failed">
              <XCircle size={64} />
            </div>
          )}
          <h1>{status === 'success' ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}</h1>
          <p className="result-message">{data.message}</p>
        </div>

        <div className="result-details">
          <div className="detail-item">
            <span className="label">Mã giao dịch:</span>
            <span className="value">#{data.transId || data.orderId || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phương thức:</span>
            <span className="value method-badge">{data.method || 'Unknown'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Số tiền:</span>
            <span className="value amount">{formatCurrency(data.amount)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Thời gian:</span>
            <span className="value">{new Date().toLocaleString('vi-VN')}</span>
          </div>
        </div>

        <div className="result-actions">
          {status === 'success' ? (
            <button className="btn-primary" onClick={() => navigate('/my-bookings')}>
              Xem lịch sử đặt phòng <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => navigate('/front-desk/checkout')}>
              Thử thanh toán lại <RefreshCcw size={18} />
            </button>
          )}
          <button className="btn-ghost" onClick={() => navigate('/')}>Quay lại trang chủ</button>
        </div>
      </div>
    </div>
  );
}

export default PaymentResultPage;
