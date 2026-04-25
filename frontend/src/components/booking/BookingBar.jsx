import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import Button from '../ui/Button';
import styles from './BookingBar.module.css';

export default function BookingBar({ variant = 'hero' }) {
  const navigate = useNavigate();
  const [dates, setDates] = useState({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(2);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dates.checkIn)  params.set('checkIn',  dates.checkIn.toISOString().split('T')[0]);
    if (dates.checkOut) params.set('checkOut', dates.checkOut.toISOString().split('T')[0]);
    params.set('guests', guests);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <form
      className={[styles.bar, styles[variant]].join(' ')}
      onSubmit={handleSearch}
      aria-label="Tìm kiếm phòng"
    >
      <div className={styles.fields}>
        {/* Date range */}
        <div className={styles.field}>
          <DateRangePicker
            checkIn={dates.checkIn}
            checkOut={dates.checkOut}
            onChange={(d) => setDates(d)}
          />
        </div>

        {/* Guests */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Số khách</span>
          <div className={styles.guestRow}>
            <Users size={16} className={styles.guestIcon} />
            <button type="button" className={styles.guestBtn} onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
            <span className={styles.guestCount}>{guests} khách</span>
            <button type="button" className={styles.guestBtn} onClick={() => setGuests(g => Math.min(10, g + 1))}>+</button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className={styles.cta}
        icon={<Search size={18} />}
      >
        Kiểm tra phòng
      </Button>
    </form>
  );
}
