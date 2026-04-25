import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import styles from './DateRangePicker.module.css';

const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DAYS_VI = ['CN','T2','T3','T4','T5','T6','T7'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}
function isBetween(date, start, end) {
  if (!start || !end) return false;
  return date > start && date < end;
}
function formatDate(d) {
  if (!d) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DateRangePicker({ checkIn, checkOut, onChange, label = true }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hovered, setHovered] = useState(null);
  const [selecting, setSelecting] = useState('checkin'); // 'checkin' | 'checkout'
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (date) => {
    if (date < today) return;
    if (selecting === 'checkin' || (checkIn && date <= checkIn)) {
      onChange({ checkIn: date, checkOut: null });
      setSelecting('checkout');
    } else {
      onChange({ checkIn, checkOut: date });
      setSelecting('checkin');
      setOpen(false);
    }
  };

  const renderCalendar = (year, month) => {
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);

    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const isPast = date < today;
      const isStart = isSameDay(date, checkIn);
      const isEnd = isSameDay(date, checkOut);
      const inRange = isBetween(date, checkIn, checkOut || hovered);
      const isHoverEnd = isSameDay(date, hovered) && checkIn && !checkOut && date > checkIn;

      cells.push(
        <button
          key={d}
          className={[
            styles.day,
            isPast ? styles.past : '',
            isStart ? styles.start : '',
            isEnd ? styles.end : '',
            inRange ? styles.inRange : '',
            isHoverEnd ? styles.hoverEnd : '',
          ].filter(Boolean).join(' ')}
          onClick={() => !isPast && handleDayClick(date)}
          onMouseEnter={() => setHovered(date)}
          onMouseLeave={() => setHovered(null)}
          disabled={isPast}
          type="button"
        >
          {d}
        </button>
      );
    }
    return cells;
  };

  const displayText = checkIn && checkOut
    ? `${formatDate(checkIn)} → ${formatDate(checkOut)}`
    : checkIn
    ? `${formatDate(checkIn)} → Chọn ngày trả`
    : 'Chọn ngày nhận & trả phòng';

  const nights = checkIn && checkOut
    ? Math.round((checkOut - checkIn) / 86400000)
    : 0;

  return (
    <div className={styles.wrap} ref={ref}>
      {label && <span className={styles.label}>Ngày lưu trú</span>}
      <button
        type="button"
        className={[styles.trigger, open ? styles.triggerOpen : ''].join(' ')}
        onClick={() => setOpen(!open)}
      >
        <Calendar size={16} className={styles.calIcon} />
        <span className={checkIn ? styles.triggerFilled : styles.triggerPlaceholder}>
          {displayText}
        </span>
        {nights > 0 && <span className={styles.nights}>{nights} đêm</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <button type="button" className={styles.navBtn} onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthLabel}>
              {MONTHS_VI[viewMonth]} {viewYear}
            </span>
            <button type="button" className={styles.navBtn} onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {DAYS_VI.map(d => <span key={d} className={styles.weekday}>{d}</span>)}
          </div>

          <div className={styles.grid}>
            {renderCalendar(viewYear, viewMonth)}
          </div>

          <div className={styles.footer}>
            {selecting === 'checkin'
              ? <span>Chọn ngày <strong>nhận phòng</strong></span>
              : <span>Chọn ngày <strong>trả phòng</strong></span>
            }
            {(checkIn || checkOut) && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => { onChange({ checkIn: null, checkOut: null }); setSelecting('checkin'); }}
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
