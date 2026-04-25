import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Users, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import styles from './BookingConfirmationPage.module.css';

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const { id } = useParams();
  const booking = state?.booking;

  return (
    <main className={styles.page}>
      <div className={['container', styles.inner].join(' ')}>
        <div className={styles.card}>
          {/* Success icon */}
          <div className={styles.iconWrap}>
            <CheckCircle size={56} className={styles.icon} />
          </div>

          <div className={styles.textBlock}>
            <p className={['label-md', styles.eyebrow].join(' ')}>Đặt phòng thành công</p>
            <h1 className={['display-sm', styles.title].join(' ')}>
              Cảm ơn bạn đã chọn<br />Azure Horizon
            </h1>
            <p className={['body-lg', styles.subtitle].join(' ')}>
              Xác nhận đặt phòng đã được gửi đến email của bạn.
              Chúng tôi rất mong được đón tiếp bạn.
            </p>
          </div>

          {/* Booking details */}
          {booking && (
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mã đặt phòng</span>
                <span className={styles.detailValue}>#{booking.bookingId || booking.id || id}</span>
              </div>
              {booking.checkInDate && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}><Calendar size={14} /> Nhận phòng</span>
                  <span className={styles.detailValue}>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {booking.checkOutDate && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}><Calendar size={14} /> Trả phòng</span>
                  <span className={styles.detailValue}>{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {booking.numberOfGuests && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}><Users size={14} /> Số khách</span>
                  <span className={styles.detailValue}>{booking.numberOfGuests} khách</span>
                </div>
              )}
              {booking.totalAmount && (
                <div className={[styles.detailRow, styles.detailTotal].join(' ')}>
                  <span className={styles.detailLabel}>Tổng tiền</span>
                  <span className={styles.detailValue}>{booking.totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.actions}>
            <Link to="/rooms">
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={16} />}>
                Khám phá thêm phòng
              </Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" size="lg">
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
