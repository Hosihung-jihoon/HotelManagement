import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getRoomById, getRoomAvailability, getReviewsByRoom, submitReview, UNSPLASH } from '../../api/clientApi';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import {
  Maximize2, Users, BedDouble, Wifi, Coffee, Car, Tv, Bath,
  Star, X, ArrowRight, Check,
  Wind, Dumbbell, Waves, UtensilsCrossed, ShieldCheck, Sparkles, AlertCircle
} from 'lucide-react';
import './RoomDetailPage.css';

const AMENITY_ICONS = {
  WiFi: <Wifi size={18} strokeWidth={1.5} />,
  Coffee: <Coffee size={18} strokeWidth={1.5} />,
  Parking: <Car size={18} strokeWidth={1.5} />,
  TV: <Tv size={18} strokeWidth={1.5} />,
  Bathtub: <Bath size={18} strokeWidth={1.5} />,
  'Air Conditioning': <Wind size={18} strokeWidth={1.5} />,
  Gym: <Dumbbell size={18} strokeWidth={1.5} />,
  Pool: <Waves size={18} strokeWidth={1.5} />,
  Restaurant: <UtensilsCrossed size={18} strokeWidth={1.5} />,
  Safe: <ShieldCheck size={18} strokeWidth={1.5} />,
};

const GALLERY_FALLBACK = UNSPLASH.room;

export default function RoomDetailPage() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [availability, setAvailability] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));

  useEffect(() => {
    document.title = 'Room Detail - Hotel Management';
    setLoading(true);
    getRoomById(id)
      .then((res) => setRoom(res.data || null))
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));

    setReviewLoading(true);
    getReviewsByRoom(id)
      .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !checkIn || !checkOut) return;
    getRoomAvailability({ roomId: id, checkInDate: checkIn, checkOutDate: checkOut, adults: room?.capacityAdults || 1 })
      .then((res) => setAvailability(res.data))
      .catch(() => setAvailability({ isAvailable: false, room: null, alternatives: [] }));
  }, [id, checkIn, checkOut, room?.capacityAdults]);

  if (loading) {
    return (
      <div style={{ paddingTop: '72px', padding: '72px 24px' }}>
        <div className="container">
          <div className="skeleton" style={{ height: 480, borderRadius: '1rem', marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
            <div>
              <div className="skeleton" style={{ height: 40, width: '60%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 120, marginBottom: 24 }} />
            </div>
            <div className="skeleton" style={{ height: 320, borderRadius: '1rem' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!room) return <div style={{ paddingTop: '72px' }} className="c-empty-state"><p>Khong tim thay phong.</p></div>;

  const mainImage = room.thumbnailUrl || room.images?.[0] || GALLERY_FALLBACK;
  const amenities = room.amenities || [];
  const recommendedServices = Array.isArray(room.recommendedServices) ? room.recommendedServices : [];
  const price = room.pricePerNight || 0;
  const subtotal = price * nights;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="c-room-detail" style={{ paddingTop: '72px' }}>
      <div className="container">
        <nav className="c-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/rooms">{t('nav.rooms')}</Link><span>/</span>
          <span>{room.name}</span>
        </nav>

        <div className="c-rd-gallery">
          <div className="c-rd-gallery__main" onClick={() => setLightboxOpen(true)}>
            <img src={mainImage} alt={room.name} className="c-rd-gallery__main-img" />
            <div className="c-rd-gallery__overlay-hint">Click to expand</div>
          </div>
        </div>

        <div className="c-rd-body">
          <div className="c-rd-info">
            <div className="c-rd-info__header">
              {room.roomTypeName && <span className="badge badge-available c-rd-type">{room.roomTypeName}</span>}
              <h1 className="headline-lg c-rd-info__title">{room.name}</h1>
              <div className="c-rd-info__meta">
                {room.area && <span><Maximize2 size={14} strokeWidth={1.5} /> {room.area} {t('rooms.sqm')}</span>}
                {room.capacityAdults && <span><Users size={14} strokeWidth={1.5} /> {room.capacityAdults} {t('rooms.maxGuests')}</span>}
                {room.floor && <span><BedDouble size={14} strokeWidth={1.5} /> {t('rooms.floor')} {room.floor}</span>}
              </div>
            </div>

            <p className="body-lg c-rd-description" style={{ color: 'var(--c-on-surface-variant)', lineHeight: 1.75 }}>
              {lang === 'vi' ? (room.descriptionVi || room.description) : room.description}
            </p>

            <div className="c-rd-amenities">
              <h2 className="title-lg c-rd-section-title">{t('rooms.amenities')}</h2>
              <div className="c-rd-amenities__grid">
                {amenities.length > 0 ? amenities.map((am, i) => {
                  const name = typeof am === 'string' ? am : (am.name || am.amenityName || '');
                  return (
                    <div key={i} className="c-rd-amenity">
                      <span className="c-rd-amenity__icon">{AMENITY_ICONS[name] || <Check size={18} strokeWidth={1.5} />}</span>
                      <span className="c-rd-amenity__name">{name}</span>
                    </div>
                  );
                }) : <p className="text-muted">Chua co tien nghi duoc cau hinh.</p>}
              </div>
            </div>

            {recommendedServices.length > 0 && (
              <div className="c-rd-amenities">
                <h2 className="title-lg c-rd-section-title">
                  {lang === 'vi' ? 'Dich vu de xuat' : 'Recommended services'}
                </h2>
                <div className="c-rd-amenities__grid">
                  {recommendedServices.map((service) => (
                    <div key={service.id} className="c-rd-amenity">
                      <span className="c-rd-amenity__icon"><Sparkles size={18} strokeWidth={1.5} /></span>
                      <span className="c-rd-amenity__name">
                        {service.name}
                        {(service.price || service.unit) && (
                          <small style={{ display: 'block', color: 'var(--c-on-surface-variant)' }}>
                            {service.price ? formatPrice(service.price) : ''}{service.unit ? ` / ${service.unit}` : ''}
                          </small>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="c-rd-reviews">
              <h2 className="title-lg c-rd-section-title">
                Reviews ({reviews.length})
              </h2>
              {isAuthenticated && (
                <div className="card" style={{ padding: 'var(--sp-20)', marginBottom: 'var(--sp-20)' }}>
                  <h3 className="title-lg" style={{ marginBottom: 'var(--sp-12)' }}>{lang === 'vi' ? 'Gui danh gia cua ban' : 'Share your review'}</h3>
                  <div className="input-tray" style={{ marginBottom: 'var(--sp-12)' }}>
                    <label htmlFor="review-rating">{lang === 'vi' ? 'So sao' : 'Rating'}</label>
                    <select id="review-rating" value={reviewForm.rating} onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}>
                      {[5, 4, 3, 2, 1].map((star) => <option key={star} value={star}>{star} / 5</option>)}
                    </select>
                  </div>
                  <div className="input-tray" style={{ marginBottom: 'var(--sp-12)' }}>
                    <label htmlFor="review-comment">{lang === 'vi' ? 'Noi dung danh gia' : 'Review comment'}</label>
                    <textarea id="review-comment" rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} />
                  </div>
                  {reviewError && <p style={{ color: 'var(--c-error)', marginBottom: 'var(--sp-12)' }}>{reviewError}</p>}
                  <button
                    className="btn btn-primary"
                    disabled={reviewSaving}
                    onClick={async () => {
                      setReviewSaving(true);
                      setReviewError('');
                      try {
                        const res = await submitReview({ roomId: room.id, rating: reviewForm.rating, comment: reviewForm.comment });
                        setReviews((prev) => [res.data, ...prev.filter((item) => item.id !== res.data.id)]);
                        setReviewForm({ rating: 5, comment: '' });
                      } catch (err) {
                        setReviewError(err.response?.data?.message || (lang === 'vi' ? 'Khong the gui danh gia.' : 'Unable to submit review.'));
                      } finally {
                        setReviewSaving(false);
                      }
                    }}
                  >
                    {reviewSaving ? (lang === 'vi' ? 'Dang gui...' : 'Submitting...') : (lang === 'vi' ? 'Gui danh gia' : 'Submit Review')}
                  </button>
                </div>
              )}

              {reviewLoading ? (
                <div className="skeleton" style={{ height: 120, borderRadius: '1rem' }} />
              ) : reviews.length > 0 ? (
                <div className="c-rd-reviews__list">
                  {reviews.map((review) => (
                    <div key={review.id} className="c-rd-review">
                      <div className="c-rd-review__header">
                        <div className="c-rd-review__avatar">{review.guestName?.[0]}</div>
                        <div>
                          <p className="c-rd-review__name" style={{ fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{review.guestName}</p>
                          <p className="text-muted" style={{ fontSize: 'var(--text-caption)', fontFamily: 'var(--font-sans)' }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="c-stars" style={{ marginLeft: 'auto' }}>
                          {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill={star <= review.rating ? '#c9a84c' : 'none'} color="#c9a84c" />)}
                        </div>
                      </div>
                      <p className="body-lg" style={{ color: 'var(--c-on-surface-variant)', marginTop: 'var(--sp-10, 0.625rem)' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="c-empty-state">
                  <p className="body-lg text-muted">Chua co danh gia nao cho hang phong nay.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="c-rd-booking-panel">
            <div className="c-rd-booking-panel__inner card">
              <div className="c-rd-booking-panel__price">
                <span className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)' }}>{t('common.from')}</span>
                <span className="display-md text-primary-color">{formatPrice(price)}</span>
                <span className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)' }}>{t('rooms.perNight')}</span>
              </div>

              <div className="c-rd-booking-panel__dates">
                <div className="input-tray">
                  <label htmlFor="rd-checkin">{t('booking.checkIn')}</label>
                  <input id="rd-checkin" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="input-tray">
                  <label htmlFor="rd-checkout">{t('booking.checkOut')}</label>
                  <input id="rd-checkout" type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>

              {availability && (
                <div className="c-payment-unavailable" style={{ background: availability.isAvailable ? '#dcfce7' : '#fff7ed', color: availability.isAvailable ? '#166534' : '#9a3412' }}>
                  <AlertCircle size={20} />
                  <p>{availability.isAvailable ? (lang === 'vi' ? 'Phong con kha dung cho khoang ngay nay.' : 'Room is available for these dates.') : (lang === 'vi' ? 'Phong khong kha dung cho khoang ngay nay.' : 'Room is unavailable for these dates.')}</p>
                </div>
              )}

              <div className="c-rd-booking-panel__summary">
                <div className="c-summary-row">
                  <span>{formatPrice(price)} x {nights} {t('booking.nights')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="c-summary-row">
                  <span>{t('booking.tax')}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="c-summary-row c-summary-row--total">
                  <span>{t('booking.total')}</span>
                  <span className="text-primary-color">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to={availability?.isAvailable === false ? '#' : `/booking/${id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${room?.capacityAdults || 1}`}
                className="btn btn-primary c-rd-booking-btn"
                id="room-detail-book-btn"
                onClick={(event) => {
                  if (availability?.isAvailable === false) {
                    event.preventDefault();
                  }
                }}
              >
                {t('rooms.bookNow')} <ArrowRight size={16} />
              </Link>

              <p className="c-rd-booking-note text-muted">
                {lang === 'vi' ? 'Phong san sang cho khach khi dat trang thai Available va clean.' : 'Rooms are guest-ready only when marked Available and clean.'}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {lightboxOpen && (
        <div className="c-lightbox" role="dialog" aria-modal="true" aria-label="Image gallery">
          <button className="c-lightbox__close" onClick={() => setLightboxOpen(false)} aria-label="Close gallery" id="lightbox-close-btn">
            <X size={24} />
          </button>
          <img src={mainImage} alt={room.name} className="c-lightbox__img" />
        </div>
      )}
    </div>
  );
}
