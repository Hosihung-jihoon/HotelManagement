import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../../context/AuthContext';
import { getRoomById, validateVoucher, createBooking } from '../../api/clientApi';
import { Check, AlertCircle, ChevronRight, CreditCard, Banknote, Smartphone, Tag } from 'lucide-react';
import './BookingPage.css';

const STEPS = ['step1','step2','step3','step4'];
const MOCK_ROOM = { id:1, name:'Deluxe King Room', pricePerNight:1800000, thumbnailUrl:null };

function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p) + '₫'; }

export default function BookingPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const { t, lang } = useLang();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Booking state
  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn,  setCheckIn]  = useState(searchParams.get('checkIn')  || today);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || tomorrow);
  const [adults,   setAdults]   = useState(parseInt(searchParams.get('adults') || '2'));
  const [numRooms, setNumRooms] = useState(1);

  // Guest info
  const [guest, setGuest] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || user?.fullName?.split(' ').pop() || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
    note:      '',
  });

  // Voucher
  const [voucherCode,    setVoucherCode]    = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError,   setVoucherError]   = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    document.title = 'Book Room — Hotel Management';
    getRoomById(roomId)
      .then(res => setRoom(res.data || MOCK_ROOM))
      .catch(() => setRoom(MOCK_ROOM))
      .finally(() => setLoading(false));
  }, [roomId]);

  const nights   = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));
  const price    = room?.pricePerNight || 1800000;
  const subtotal = price * nights * numRooms;
  const discount = voucherApplied?.discountAmount || (voucherApplied?.discountPercent ? Math.round(subtotal * voucherApplied.discountPercent / 100) : 0);
  const taxBase  = subtotal - discount;
  const tax      = Math.round(taxBase * 0.1);
  const total    = taxBase + tax;

  const showToast = (msg, dur = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(''), dur);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError('');
    try {
      const res = await validateVoucher(voucherCode.trim());
      setVoucherApplied(res.data);
      showToast(lang === 'vi' ? 'Áp dụng voucher thành công!' : 'Voucher applied successfully!');
    } catch {
      setVoucherError(lang === 'vi' ? 'Mã voucher không hợp lệ hoặc đã hết hạn.' : 'Invalid or expired voucher code.');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
        setError(lang === 'vi' ? 'Vui lòng điền đầy đủ thông tin.' : 'Please fill in all required fields.');
        return;
      }
    }
    if (step === 3) { handleConfirm(); return; }
    setStep(s => s + 1);
  };

  const handleConfirm = async () => {
    if (paymentMethod !== 'cash') {
      showToast(t('booking.paymentUnavailable'), 4000);
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({
        roomId, checkInDate: checkIn, checkOutDate: checkOut,
        adults, numRooms, guestInfo: guest,
        voucherCode: voucherApplied ? voucherCode : null,
        paymentMethod, totalAmount: total,
      });
      navigate('/booking/success', { state: { room, checkIn, checkOut, total, guestEmail: guest.email } });
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'vi' ? 'Đặt phòng thất bại. Vui lòng thử lại.' : 'Booking failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ paddingTop:'72px', height:'80vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="skeleton" style={{ width:600, height:400, borderRadius:'1rem' }} /></div>;

  const PAYMENT_OPTIONS = [
    { key:'cash',     icon: <Banknote size={20} />,    label: t('booking.paymentCash') },
    { key:'transfer', icon: <CreditCard size={20} />,   label: t('booking.paymentTransfer') },
    { key:'vnpay',    icon: <Smartphone size={20} />,   label: t('booking.paymentVnpay') },
  ];

  const STEP_LABELS = [t('booking.step1'), t('booking.step2'), t('booking.step3'), t('booking.step4')];

  return (
    <div className="c-booking" style={{ paddingTop:'72px' }}>
      <div className="container">
        <nav className="c-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/rooms">{t('nav.rooms')}</Link><span>/</span>
          <span>{t('booking.title')}</span>
        </nav>

        <h1 className="headline-lg c-booking__title">{t('booking.title')}</h1>

        {/* Progress bar */}
        <div className="c-booking-progress" role="progressbar" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={4}>
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
          {/* Form area */}
          <div className="c-booking__form-area">
            {error && (
              <div className="c-booking__error">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {/* Step 1 */}
            {step === 0 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step1')}</h2>
                <div className="c-booking__room-summary card">
                  <div style={{ display:'flex', gap:'var(--sp-16)', alignItems:'center', padding:'var(--sp-20) var(--sp-24)' }}>
                    <img src={room?.thumbnailUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&q=80'} alt={room?.name} style={{ width:80, height:80, objectFit:'cover', borderRadius:'var(--r-lg)', flexShrink:0 }} />
                    <div>
                      <p className="text-muted label-md" style={{ marginBottom:4 }}>{room?.roomTypeName}</p>
                      <h3 className="title-lg">{room?.name}</h3>
                      <p className="text-muted body-lg">{formatPrice(room?.pricePerNight || 0)} / {t('common.night')}</p>
                    </div>
                  </div>
                </div>
                <div className="c-booking__date-grid">
                  <div className="input-tray">
                    <label htmlFor="bk-checkin">{t('booking.checkIn')}</label>
                    <input id="bk-checkin" type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="bk-checkout">{t('booking.checkOut')}</label>
                    <input id="bk-checkout" type="date" min={checkIn} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="bk-adults">{t('hero.adult')}</label>
                    <input id="bk-adults" type="number" min={1} max={10} value={adults} onChange={e => setAdults(+e.target.value)} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="bk-rooms">{t('hero.rooms')}</label>
                    <input id="bk-rooms" type="number" min={1} max={10} value={numRooms} onChange={e => setNumRooms(+e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step2')}</h2>
                <div className="c-booking__guest-grid">
                  {[
                    { key:'firstName', label: t('booking.firstName'), type:'text', required:true },
                    { key:'lastName',  label: t('booking.lastName'),  type:'text', required:true },
                    { key:'email',     label: t('booking.email'),     type:'email', required:true },
                    { key:'phone',     label: t('booking.phone'),     type:'tel',   required:true },
                  ].map(f => (
                    <div key={f.key} className="input-tray">
                      <label htmlFor={`bk-${f.key}`}>{f.label} {f.required && '*'}</label>
                      <input
                        id={`bk-${f.key}`}
                        type={f.type}
                        value={guest[f.key]}
                        onChange={e => setGuest(g => ({ ...g, [f.key]: e.target.value }))}
                        required={f.required}
                      />
                    </div>
                  ))}
                  <div className="input-tray" style={{ gridColumn:'1/-1' }}>
                    <label htmlFor="bk-note">{t('booking.note')}</label>
                    <input id="bk-note" type="text" value={guest.note} onChange={e => setGuest(g => ({ ...g, note: e.target.value }))} placeholder={lang === 'vi' ? 'Dị ứng, yêu cầu đặc biệt...' : 'Allergies, special requests...'} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step3')}</h2>
                <div className="c-voucher-area">
                  <div className="c-voucher-input-row">
                    <div className="input-tray" style={{ flex:1 }}>
                      <label htmlFor="bk-voucher"><Tag size={14} /> {t('booking.voucherCode')}</label>
                      <input
                        id="bk-voucher"
                        type="text"
                        value={voucherCode}
                        onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="VD: SUMMER25"
                        disabled={!!voucherApplied}
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading || !!voucherApplied}
                      id="apply-voucher-btn"
                      style={{ alignSelf:'flex-end', height:48 }}
                    >
                      {voucherLoading ? '...' : t('booking.applyVoucher')}
                    </button>
                  </div>
                  {voucherError && <p style={{ color:'var(--c-error)', fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', marginTop:'var(--sp-8)' }}>{voucherError}</p>}
                  {voucherApplied && (
                    <div className="c-voucher-success">
                      <Check size={16} /> {lang === 'vi' ? 'Đã áp dụng mã giảm giá!' : 'Discount applied!'} {voucherApplied.discountPercent && `(−${voucherApplied.discountPercent}%)`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 3 && (
              <div className="c-booking__step-panel">
                <h2 className="title-lg c-booking__step-title">{t('booking.step4')}</h2>
                <div className="c-payment-methods">
                  {PAYMENT_OPTIONS.map(opt => (
                    <label key={opt.key} className={`c-payment-option ${paymentMethod === opt.key ? 'active' : ''}`} id={`payment-${opt.key}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={opt.key}
                        checked={paymentMethod === opt.key}
                        onChange={() => setPaymentMethod(opt.key)}
                        style={{ display:'none' }}
                      />
                      {opt.icon}
                      <span>{opt.label}</span>
                      {paymentMethod === opt.key && <Check size={16} style={{ marginLeft:'auto', color:'var(--c-primary)' }} />}
                    </label>
                  ))}
                </div>

                {paymentMethod !== 'cash' && (
                  <div className="c-payment-unavailable">
                    <AlertCircle size={20} />
                    <p>{t('booking.paymentUnavailable')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="c-booking__nav-btns">
              {step > 0 && (
                <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} id="booking-back-btn">
                  {t('booking.back')}
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={submitting}
                id="booking-next-btn"
                style={{ marginLeft:'auto' }}
              >
                {submitting ? (lang === 'vi' ? 'Đang xử lý...' : 'Processing...') :
                  step === 3 ? t('booking.confirmBooking') : t('booking.next')}
              </button>
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="c-booking__summary">
            <div className="card" style={{ padding:'var(--sp-24)' }}>
              <h3 className="title-lg" style={{ marginBottom:'var(--sp-20)', fontFamily:'var(--font-serif)', color:'var(--c-primary)' }}>
                {lang === 'vi' ? 'Tóm tắt đặt phòng' : 'Booking Summary'}
              </h3>
              <div className="c-summary-row">
                <span>{lang === 'vi' ? 'Phòng' : 'Room'}</span>
                <span style={{ fontWeight:600, textAlign:'right', maxWidth:160 }}>{room?.name}</span>
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
                <span>{lang === 'vi' ? 'Số đêm' : 'Nights'}</span>
                <span>{nights}</span>
              </div>
              <div style={{ height:'1px', background:'rgba(196,198,209,0.3)', margin:'var(--sp-16) 0' }} />
              <div className="c-summary-row">
                <span>{t('booking.subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="c-summary-row" style={{ color:'var(--c-success)' }}>
                  <span>{t('booking.discount')}</span>
                  <span>−{formatPrice(discount)}</span>
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

      {/* Toast */}
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
