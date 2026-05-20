import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../../context/AuthContext';
import { getRoomById, getRoomAvailability, getAvailableVouchers, getMyMembership, createBooking } from '../../api/clientApi';
import { Check, AlertCircle, ChevronRight, Banknote, Tag } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import './BookingPage.css';

export default function BookingPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || today);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || tomorrow);
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '1', 10));
  const [numRooms, setNumRooms] = useState(1);

  const [guest, setGuest] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    note: '',
  });

  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const splitFullName = (userInfo) => {
    const fullName = String(userInfo?.fullName || '').trim();
    if (userInfo?.firstName || userInfo?.lastName) {
      return {
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
      };
    }
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return {
      firstName: parts.slice(0, -1).join(' '),
      lastName: parts[parts.length - 1],
    };
  };

  useEffect(() => {
    document.title = 'Book Room - Hotel Management';
    getRoomById(roomId)
      .then((res) => setRoom(res.data || null))
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!user) return;
    const { firstName, lastName } = splitFullName(user);
    setGuest((current) => ({
      ...current,
      firstName: current.firstName || firstName,
      lastName: current.lastName || lastName,
      email: current.email || user.email || '',
      phone: current.phone || user.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    let ignore = false;
    const loadVouchers = async () => {
      try {
        const membershipRes = user
          ? await getMyMembership().catch(() => ({ data: null }))
          : { data: null };
        const membershipTier = membershipRes?.data?.tier || membershipRes?.data?.membershipName || '';
        const voucherRes = await getAvailableVouchers(membershipTier);
        if (!ignore) {
          setAvailableVouchers(Array.isArray(voucherRes.data) ? voucherRes.data : []);
        }
      } catch {
        if (!ignore) setAvailableVouchers([]);
      }
    };
    loadVouchers();
    return () => { ignore = true; };
  }, [user]);

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) return;
    setAvailabilityLoading(true);
    getRoomAvailability({ roomId, checkInDate: checkIn, checkOutDate: checkOut, adults })
      .then((res) => setAvailability(res.data))
      .catch(() => setAvailability({ isAvailable: false, room: null, alternatives: [] }))
      .finally(() => setAvailabilityLoading(false));
  }, [roomId, checkIn, checkOut, adults]);

  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const price = room?.pricePerNight || 0;
  const subtotal = price * nights * numRooms;
  const discount = voucherApplied?.discountAmount || (voucherApplied?.discountPercent ? Math.round(subtotal * voucherApplied.discountPercent / 100) : 0);
  const taxBase = subtotal - discount;
  const tax = Math.round(taxBase * 0.1);
  const total = taxBase + tax;

  const showToast = (msg, dur = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(''), dur);
  };

  useEffect(() => {
    if (!selectedVoucherId) {
      setVoucherApplied(null);
      return;
    }
    const selectedVoucher = availableVouchers.find((voucher) => String(voucher.id) === String(selectedVoucherId));
    setVoucherApplied(selectedVoucher || null);
    if (selectedVoucher) {
      showToast(lang === 'vi' ? `Da chon voucher ${selectedVoucher.code}.` : `Voucher ${selectedVoucher.code} selected.`);
    }
  }, [selectedVoucherId, availableVouchers, lang]);

  const handleNext = () => {
    setError('');
    if (step === 0 && availability && !availability.isAvailable) {
      setError(lang === 'vi' ? 'Phong nay khong con kha dung cho khoang ngay da chon.' : 'This room is not available for the selected dates.');
      return;
    }
    if (step === 1) {
      if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
        setError(lang === 'vi' ? 'Vui long dien day du thong tin.' : 'Please fill in all required fields.');
        return;
      }
    }
    if (step === 2 && voucherApplied?.minBookingValue && subtotal < voucherApplied.minBookingValue) {
      setError(
        lang === 'vi'
          ? `Voucher nay yeu cau don toi thieu ${formatPrice(voucherApplied.minBookingValue)}.`
          : `This voucher requires a minimum booking value of ${formatPrice(voucherApplied.minBookingValue)}.`
      );
      return;
    }
    if (step === 3) {
      handleConfirm();
      return;
    }
    setStep((current) => current + 1);
  };

  const handleConfirm = async () => {
    if (availability && !availability.isAvailable) {
      setError(lang === 'vi' ? 'Phong nay khong con kha dung cho khoang ngay da chon.' : 'This room is not available for the selected dates.');
      return;
    }
    if (voucherApplied?.minBookingValue && subtotal < voucherApplied.minBookingValue) {
      setError(
        lang === 'vi'
          ? `Voucher nay yeu cau don toi thieu ${formatPrice(voucherApplied.minBookingValue)}.`
          : `This voucher requires a minimum booking value of ${formatPrice(voucherApplied.minBookingValue)}.`
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBooking({
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        numRooms,
        guestInfo: guest,
        userId: user ? user.id : null,
        voucherId: voucherApplied ? voucherApplied.id : null,
        paymentMethod,
        totalAmount: total,
        pricePerNight: room?.pricePerNight || 0,
      });
      navigate('/booking/success', { state: { room, checkIn, checkOut, total, guestEmail: guest.email, bookingCode: res.data?.bookingCode } });
    } catch (submitError) {
      setError(submitError.response?.data?.message || (lang === 'vi' ? 'Dat phong that bai. Vui long thu lai.' : 'Booking failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ paddingTop: '72px', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="skeleton" style={{ width: 600, height: 400, borderRadius: '1rem' }} /></div>;
  if (!room) return <div style={{ paddingTop: '72px', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="c-empty-state"><p>Khong tim thay phong.</p></div></div>;

  const PAYMENT_OPTIONS = [
    { key: 'cash', icon: <Banknote size={20} />, label: t('booking.paymentCash') },
  ];

  const STEP_LABELS = [t('booking.step1'), t('booking.step2'), t('booking.step3'), t('booking.step4')];

  return (
    <div className="c-booking" style={{ paddingTop: '72px' }}>
      <div className="container">
        <nav className="c-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/rooms">{t('nav.rooms')}</Link><span>/</span>
          <span>{t('booking.title')}</span>
        </nav>

        <h1 className="headline-lg c-booking__title">{t('booking.title')}</h1>

        <div className="c-booking-progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} className={`c-booking-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="c-booking-step__circle">
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="c-booking-step__label">{label}</span>
              {i < 3 && <ChevronRight size={16} className="c-booking-step__sep" />}
            </div>
          ))}
        </div>

        <div className="c-booking__layout">
          <div className="c-booking__form-area">
            {error && (
              <div className="c-booking__error">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {step === 0 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step1')}</h2>
                <div className="c-booking__room-summary card">
                  <div style={{ display: 'flex', gap: 'var(--sp-16)', alignItems: 'center', padding: 'var(--sp-20) var(--sp-24)' }}>
                    <img src={room?.thumbnailUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=80'} alt={room?.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--r-lg)', flexShrink: 0 }} />
                    <div>
                      <p className="text-muted label-md" style={{ marginBottom: 4 }}>{room?.roomTypeName}</p>
                      <h3 className="title-lg">{room?.name}</h3>
                      <p className="text-muted body-lg">{formatPrice(room?.pricePerNight || 0)} / {t('common.night')}</p>
                    </div>
                  </div>
                </div>
                <div className="c-booking__date-grid">
                  <div className="input-tray">
                    <label htmlFor="bk-checkin">{t('booking.checkIn')}</label>
                    <input id="bk-checkin" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="bk-checkout">{t('booking.checkOut')}</label>
                    <input id="bk-checkout" type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="bk-adults">{t('hero.adult')}</label>
                    <input id="bk-adults" type="number" min={1} max={10} value={adults} onChange={(e) => setAdults(+e.target.value)} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="bk-rooms">{t('hero.rooms')}</label>
                    <input id="bk-rooms" type="number" min={1} max={10} value={numRooms} onChange={(e) => setNumRooms(+e.target.value)} />
                  </div>
                </div>
                {availability && (
                  <div className="c-booking__error" style={{ background: availability.isAvailable ? '#dcfce7' : undefined, color: availability.isAvailable ? '#166534' : undefined, borderColor: availability.isAvailable ? '#bbf7d0' : undefined }}>
                    <AlertCircle size={18} /> {availabilityLoading ? 'Dang kiem tra phong...' : (availability.isAvailable ? (lang === 'vi' ? 'Phong con kha dung cho khoang ngay da chon.' : 'Room is available for the selected dates.') : (lang === 'vi' ? 'Phong khong con kha dung cho khoang ngay da chon.' : 'Room is unavailable for the selected dates.'))}
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step2')}</h2>
                <div className="c-booking__guest-grid">
                  {[
                    { key: 'firstName', label: t('booking.firstName'), type: 'text', required: true },
                    { key: 'lastName', label: t('booking.lastName'), type: 'text', required: true },
                    { key: 'email', label: t('booking.email'), type: 'email', required: true },
                    { key: 'phone', label: t('booking.phone'), type: 'tel', required: true },
                  ].map((field) => (
                    <div key={field.key} className="input-tray">
                      <label htmlFor={`bk-${field.key}`}>{field.label} {field.required && '*'}</label>
                      <input
                        id={`bk-${field.key}`}
                        type={field.type}
                        value={guest[field.key]}
                        onChange={(e) => setGuest((current) => ({ ...current, [field.key]: e.target.value }))}
                        required={field.required}
                      />
                    </div>
                  ))}
                  <div className="input-tray" style={{ gridColumn: '1/-1' }}>
                    <label htmlFor="bk-note">{t('booking.note')}</label>
                    <input id="bk-note" type="text" value={guest.note} onChange={(e) => setGuest((current) => ({ ...current, note: e.target.value }))} placeholder={lang === 'vi' ? 'Di ung, yeu cau dac biet...' : 'Allergies, special requests...'} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step3')}</h2>
                <div className="c-voucher-area">
                  <div className="input-tray" style={{ flex: 1 }}>
                    <label htmlFor="bk-voucher"><Tag size={14} /> {t('booking.voucherCode')}</label>
                    <select
                      id="bk-voucher"
                      value={selectedVoucherId}
                      onChange={(e) => setSelectedVoucherId(e.target.value)}
                    >
                      <option value="">{lang === 'vi' ? '-- Khong su dung voucher --' : '-- No voucher --'}</option>
                      {availableVouchers.map((voucher) => (
                        <option key={voucher.id} value={voucher.id}>
                          {voucher.code} · {voucher.discountType === 'Percentage'
                            ? `${voucher.discountValue}%`
                            : formatPrice(voucher.discountValue || 0)}
                          {voucher.minBookingValue ? ` · Min ${formatPrice(voucher.minBookingValue)}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {availableVouchers.length === 0 && (
                    <p style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', marginTop: 'var(--sp-8)' }}>
                      {lang === 'vi' ? 'Hien tai khong co voucher phu hop de ap dung.' : 'There are no eligible vouchers available right now.'}
                    </p>
                  )}
                  {voucherApplied && (
                    <div className="c-voucher-success">
                      <Check size={16} />
                      {lang === 'vi' ? `Da chon voucher ${voucherApplied.code}.` : `Selected voucher ${voucherApplied.code}.`}
                      {voucherApplied.discountPercent && ` (-${voucherApplied.discountPercent}%)`}
                      {!voucherApplied.discountPercent && voucherApplied.discountAmount ? ` (-${formatPrice(voucherApplied.discountAmount)})` : ''}
                    </div>
                  )}
                  {voucherApplied?.minBookingValue && subtotal < voucherApplied.minBookingValue && (
                    <div className="c-booking__error" style={{ marginTop: 'var(--sp-12)' }}>
                      <AlertCircle size={18} />
                      {lang === 'vi'
                        ? `Voucher nay yeu cau don toi thieu ${formatPrice(voucherApplied.minBookingValue)}.`
                        : `This voucher requires a minimum booking value of ${formatPrice(voucherApplied.minBookingValue)}.`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step4')}</h2>
                <div className="c-payment-methods">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label key={opt.key} className={`c-payment-option ${paymentMethod === opt.key ? 'active' : ''}`} id={`payment-${opt.key}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={opt.key}
                        checked={paymentMethod === opt.key}
                        onChange={() => setPaymentMethod(opt.key)}
                        style={{ display: 'none' }}
                      />
                      {opt.icon}
                      <span>{opt.label}</span>
                      {paymentMethod === opt.key && <Check size={16} style={{ marginLeft: 'auto', color: 'var(--c-primary)' }} />}
                    </label>
                  ))}
                </div>

                <div className="c-payment-unavailable">
                  <AlertCircle size={20} />
                  <p>{lang === 'vi' ? 'Hien tai client site chi ho tro dat phong va thanh toan tai khach san.' : 'The client site currently supports on-property payment only.'}</p>
                </div>
              </div>
            )}

            <div className="c-booking__nav-btns">
              {step > 0 && (
                <button className="btn btn-secondary" onClick={() => setStep((current) => current - 1)} id="booking-back-btn">
                  {t('booking.back')}
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={submitting}
                id="booking-next-btn"
                style={{ marginLeft: 'auto' }}
              >
                {submitting ? (lang === 'vi' ? 'Dang xu ly...' : 'Processing...') :
                  step === 3 ? t('booking.confirmBooking') : t('booking.next')}
              </button>
            </div>
          </div>

          <aside className="c-booking__summary">
            <div className="card" style={{ padding: 'var(--sp-24)' }}>
              <h3 className="title-lg" style={{ marginBottom: 'var(--sp-20)', fontFamily: 'var(--font-serif)', color: 'var(--c-primary)' }}>
                {lang === 'vi' ? 'Tom tat dat phong' : 'Booking Summary'}
              </h3>
              <div className="c-summary-row">
                <span>{lang === 'vi' ? 'Phong' : 'Room'}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: 160 }}>{room?.name}</span>
              </div>
              <div className="c-summary-row">
                <span>{t('booking.checkIn')}</span>
                <span>{new Date(checkIn).toLocaleDateString()}</span>
              </div>
              <div className="c-summary-row">
                <span>{t('booking.checkOut')}</span>
                <span>{new Date(checkOut).toLocaleDateString()}</span>
              </div>
              <div className="c-summary-row">
                <span>{lang === 'vi' ? 'So dem' : 'Nights'}</span>
                <span>{nights}</span>
              </div>
              <div className="c-summary-row">
                <span>{lang === 'vi' ? 'Trang thai phong' : 'Room status'}</span>
                <span>{room.status}{room.cleanStatus ? ` / ${room.cleanStatus}` : ''}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(196,198,209,0.3)', margin: 'var(--sp-16) 0' }} />
              <div className="c-summary-row">
                <span>{t('booking.subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {voucherApplied && (
                <div className="c-summary-row">
                  <span>{lang === 'vi' ? 'Voucher' : 'Voucher'}</span>
                  <span>{voucherApplied.code}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="c-summary-row" style={{ color: 'var(--c-success)' }}>
                  <span>{t('booking.discount')}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="c-summary-row">
                <span>{t('booking.tax')}</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="c-summary-row c-summary-row--total">
                <span>{t('booking.total')}</span>
                <span className="text-primary-color headline-md">{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {toast && (
        <div className="client-toast-container">
          <div className="client-toast toast-info">
            <div><p className="client-toast-title">{toast}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
