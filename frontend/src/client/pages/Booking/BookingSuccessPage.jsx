import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { CheckCircle, Copy, Check, Calendar, Home } from 'lucide-react';
import './BookingSuccessPage.css';

function generateCode() {
  return 'HM' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function BookingSuccessPage() {
  const { t, lang } = useLang();
  const location = useLocation();
  const state = location.state || {};
  const [copied, setCopied] = useState(false);
  const [bookingCode] = useState(generateCode);

  useEffect(() => {
    document.title = 'Booking Confirmed — Hotel Management';
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="c-success" style={{ paddingTop:'72px' }}>
      <div className="container">
        <div className="c-success__card card">
          {/* Animated check */}
          <div className="c-success__icon-wrap" aria-hidden="true">
            <div className="c-success__icon-ring" />
            <CheckCircle size={64} strokeWidth={1.5} className="c-success__icon" />
          </div>

          <h1 className="display-md c-success__title">{t('booking.successTitle')}</h1>
          <p className="body-lg text-muted c-success__subtitle">{t('booking.successMsg')}</p>

          {/* Booking code */}
          <div className="c-success__code-box">
            <p className="label-md text-muted" style={{ marginBottom:'var(--sp-8)' }}>{t('booking.bookingCode')}</p>
            <div className="c-success__code">
              <span className="display-md">{bookingCode}</span>
              <button
                className="c-success__copy-btn"
                onClick={handleCopy}
                aria-label="Copy booking code"
                id="copy-booking-code-btn"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* VietQR Display */}
          {state.qrUrl && (
            <div className="c-success__qr-box" style={{ textAlign: 'center', marginTop: 'var(--sp-24)', marginBottom: 'var(--sp-24)', background: 'rgba(255,255,255,0.05)', padding: 'var(--sp-16)', borderRadius: 'var(--r-lg)' }}>
              <h3 className="title-md" style={{ marginBottom: 'var(--sp-12)' }}>
                {lang === 'vi' ? 'Quét mã để thanh toán' : 'Scan QR to pay'}
              </h3>
              <img src={state.qrUrl} alt="VietQR" style={{ maxWidth: '100%', height: 'auto', borderRadius: 'var(--r-md)', maxHeight: '350px' }} />
              <p className="text-muted" style={{ marginTop: 'var(--sp-12)' }}>
                {lang === 'vi' ? 'Vui lòng sử dụng App ngân hàng để quét mã này.' : 'Please use your banking app to scan this code.'}
              </p>
            </div>
          )}

          {/* Booking details */}
          {state.room && (
            <div className="c-success__details">
              <div className="c-success__detail-row">
                <span>{lang === 'vi' ? 'Phòng' : 'Room'}</span>
                <strong>{state.room.name}</strong>
              </div>
              {state.checkIn && (
                <div className="c-success__detail-row">
                  <span>{t('booking.checkIn')}</span>
                  <strong>{new Date(state.checkIn).toLocaleDateString()}</strong>
                </div>
              )}
              {state.checkOut && (
                <div className="c-success__detail-row">
                  <span>{t('booking.checkOut')}</span>
                  <strong>{new Date(state.checkOut).toLocaleDateString()}</strong>
                </div>
              )}
              {state.total && (
                <div className="c-success__detail-row">
                  <span>{t('booking.total')}</span>
                  <strong className="text-primary-color">{new Intl.NumberFormat('vi-VN').format(state.total)}₫</strong>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="c-success__actions">
            <Link to="/account?tab=bookings" className="btn btn-secondary btn-lg" id="success-view-bookings-btn">
              <Calendar size={18} /> {t('booking.viewBookings')}
            </Link>
            <Link to="/" className="btn btn-primary btn-lg" id="success-back-home-btn">
              <Home size={18} /> {t('booking.backHome')}
            </Link>
          </div>

          {state.guestEmail && (
            <p className="text-muted" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', marginTop:'var(--sp-16)' }}>
              {lang === 'vi'
                ? `Email xác nhận đã gửi tới ${state.guestEmail}`
                : `Confirmation email sent to ${state.guestEmail}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
