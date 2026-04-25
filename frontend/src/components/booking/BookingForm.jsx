import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import styles from './BookingForm.module.css';

export default function BookingForm({ room, initialCheckIn, initialCheckOut, initialGuests, onCancel }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dates, setDates] = useState({
    checkIn:  initialCheckIn  ? new Date(initialCheckIn)  : null,
    checkOut: initialCheckOut ? new Date(initialCheckOut) : null,
  });
  const [guests, setGuests] = useState(initialGuests || 2);
  const [guestInfo, setGuestInfo] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!dates.checkIn || !dates.checkOut) {
      setError('Vui lòng chọn ngày nhận và trả phòng.');
      return;
    }
    if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
      setError('Vui lòng điền đầy đủ thông tin liên hệ.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roomTypeId: room.roomTypeId || room.id,
        checkInDate: dates.checkIn.toISOString().split('T')[0],
        checkOutDate: dates.checkOut.toISOString().split('T')[0],
        numberOfGuests: guests,
        guestName: guestInfo.fullName,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        specialRequests: guestInfo.notes || null,
      };

      const { data } = await client.post('/Bookings', payload);
      // Redirect to confirmation page
      navigate(`/booking-confirmation/${data.bookingId || data.id}`, { state: { booking: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt phòng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const nights = dates.checkIn && dates.checkOut
    ? Math.round((dates.checkOut - dates.checkIn) / 86400000)
    : 0;
  const totalPrice = (room.pricePerNight || room.basePrice || 0) * nights;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h3 className={['title-md', styles.title].join(' ')}>Thông tin đặt phòng</h3>
        {onCancel && (
          <button type="button" className={styles.closeBtn} onClick={onCancel} aria-label="Đóng">
            <X size={18} />
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Dates */}
      <DateRangePicker
        checkIn={dates.checkIn}
        checkOut={dates.checkOut}
        onChange={(d) => setDates(d)}
      />

      {/* Guests */}
      <div className={styles.field}>
        <label className={styles.label}>Số khách</label>
        <div className={styles.guestRow}>
          <button type="button" className={styles.guestBtn} onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
          <span className={styles.guestCount}>{guests} khách</span>
          <button type="button" className={styles.guestBtn} onClick={() => setGuests(g => Math.min(room.capacity || 10, g + 1))}>+</button>
        </div>
      </div>

      {/* Guest info */}
      <Input
        label="Họ và tên"
        type="text"
        value={guestInfo.fullName}
        onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
        required
      />
      <Input
        label="Email"
        type="email"
        value={guestInfo.email}
        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
        required
      />
      <Input
        label="Số điện thoại"
        type="tel"
        value={guestInfo.phone}
        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
        required
      />
      <div className={styles.field}>
        <label className={styles.label}>Yêu cầu đặc biệt (tùy chọn)</label>
        <textarea
          className={styles.textarea}
          rows={3}
          value={guestInfo.notes}
          onChange={(e) => setGuestInfo({ ...guestInfo, notes: e.target.value })}
          placeholder="Ví dụ: Tầng cao, giường đôi, không hút thuốc…"
        />
      </div>

      {/* Summary */}
      {nights > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>{(room.pricePerNight || room.basePrice || 0).toLocaleString('vi-VN')}₫ × {nights} đêm</span>
            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className={[styles.summaryRow, styles.summaryTotal].join(' ')}>
            <span>Tổng cộng</span>
            <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
        {loading ? 'Đang xử lý…' : 'Xác nhận đặt phòng'}
      </Button>

      <p className={styles.note}>
        Bằng việc đặt phòng, bạn đồng ý với <a href="/terms" className={styles.link}>Điều khoản sử dụng</a> và <a href="/privacy" className={styles.link}>Chính sách bảo mật</a> của chúng tôi.
      </p>
    </form>
  );
}
