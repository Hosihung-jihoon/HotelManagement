import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getRoomById, getReviewsByRoom, UNSPLASH } from '../../api/clientApi';
import {
  Maximize2, Users, BedDouble, Wifi, Coffee, Car, Tv, Bath,
  ChevronLeft, ChevronRight, Star, X, ArrowRight, Check,
  Wind, Dumbbell, Waves, UtensilsCrossed, ShieldCheck
} from 'lucide-react';
import './RoomDetailPage.css';

const AMENITY_ICONS = {
  'WiFi': <Wifi size={18} strokeWidth={1.5} />,
  'Coffee': <Coffee size={18} strokeWidth={1.5} />,
  'Parking': <Car size={18} strokeWidth={1.5} />,
  'TV': <Tv size={18} strokeWidth={1.5} />,
  'Bathtub': <Bath size={18} strokeWidth={1.5} />,
  'Air Conditioning': <Wind size={18} strokeWidth={1.5} />,
  'Gym': <Dumbbell size={18} strokeWidth={1.5} />,
  'Pool': <Waves size={18} strokeWidth={1.5} />,
  'Restaurant': <UtensilsCrossed size={18} strokeWidth={1.5} />,
  'Safe': <ShieldCheck size={18} strokeWidth={1.5} />,
};

const GALLERY_IMGS = [UNSPLASH.room, UNSPLASH.roomSuite, UNSPLASH.roomDeluxe, UNSPLASH.roomFamily, UNSPLASH.lobby, UNSPLASH.pool];

const MOCK_AMENITIES = ['WiFi','Coffee','Parking','TV','Bathtub','Air Conditioning','Gym','Pool','Restaurant','Safe'];

const MOCK_ROOM = {
  id: 1, name: 'Deluxe King Room', roomTypeName: 'Deluxe',
  pricePerNight: 1800000, maxOccupancy: 2, area: 32, floor: 5,
  averageRating: 4.8, reviewCount: 124, status: 'Available',
  description: 'Our Deluxe King Room offers a sophisticated retreat with stunning city views. Featuring a plush king-sized bed, marble en-suite bathroom with soaking tub, and thoughtfully curated amenities, this room provides the perfect sanctuary for discerning travelers.',
  descriptionVi: 'Phòng Deluxe King của chúng tôi mang đến không gian nghỉ dưỡng tinh tế với tầm nhìn thành phố tuyệt đẹp. Phòng được trang bị giường king-size sang trọng, phòng tắm cẩm thạch với bồn tắm ngâm, và các tiện nghi được lựa chọn cẩn thận.',
  amenities: MOCK_AMENITIES,
};

const MOCK_REVIEWS = [
  { id:1, guestName:'Nguyen Van A', rating:5, comment:'Absolutely wonderful stay! The room was immaculate.', createdAt:'2025-04-15' },
  { id:2, guestName:'Tran Thi B',   rating:4, comment:'Great location and friendly staff. Will come back.', createdAt:'2025-04-10' },
  { id:3, guestName:'John Smith',   rating:5, comment:'Best hotel in the city. The spa was exceptional.', createdAt:'2025-03-28' },
];

function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p) + '₫'; }

export default function RoomDetailPage() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [room,       setRoom]       = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lightbox,   setLightbox]   = useState(null); // current idx
  const [activeImg,  setActiveImg]  = useState(0);

  // Booking params
  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn,  setCheckIn]  = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));

  useEffect(() => {
    document.title = 'Room Detail — Hotel Management';
    Promise.all([
      getRoomById(id).catch(() => ({ data: MOCK_ROOM })),
      getReviewsByRoom(id).catch(() => ({ data: MOCK_REVIEWS })),
    ]).then(([rRes, revRes]) => {
      const rData = rRes.data || MOCK_ROOM;
      if (!rData.name) { setRoom(MOCK_ROOM); } else { setRoom(rData); }
      setReviews(revRes.data || MOCK_REVIEWS);
    }).finally(() => setLoading(false));
  }, [id]);

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

  if (!room) return null;

  const images = room.images || GALLERY_IMGS;
  const amenities = room.amenities || MOCK_AMENITIES;
  const price  = room.pricePerNight || 1800000;
  const subtotal = price * nights;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="c-room-detail" style={{ paddingTop: '72px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="c-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span>
          <Link to="/rooms">{t('nav.rooms')}</Link><span>/</span>
          <span>{room.name}</span>
        </nav>

        {/* Gallery */}
        <div className="c-rd-gallery">
          <div className="c-rd-gallery__main" onClick={() => setLightbox(activeImg)}>
            <img src={images[activeImg]} alt={room.name} className="c-rd-gallery__main-img" />
            <div className="c-rd-gallery__overlay-hint">Click to expand</div>
          </div>
          <div className="c-rd-gallery__thumbs">
            {images.slice(0, 5).map((img, i) => (
              <button
                key={i}
                className={`c-rd-gallery__thumb ${i === activeImg ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
                id={`gallery-thumb-${i}`}
              >
                <img src={img} alt={`${room.name} - view ${i + 1}`} />
                {i === 4 && images.length > 5 && (
                  <div className="c-rd-gallery__more-overlay">+{images.length - 5}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="c-rd-body">
          {/* Left: Info */}
          <div className="c-rd-info">
            <div className="c-rd-info__header">
              {room.roomTypeName && <span className="badge badge-available c-rd-type">{room.roomTypeName}</span>}
              <h1 className="headline-lg c-rd-info__title">{room.name}</h1>
              <div className="c-rd-info__meta">
                {room.area && <span><Maximize2 size={14} strokeWidth={1.5}/> {room.area} {t('rooms.sqm')}</span>}
                {room.maxOccupancy && <span><Users size={14} strokeWidth={1.5}/> {room.maxOccupancy} {t('rooms.maxGuests')}</span>}
                {room.floor && <span><BedDouble size={14} strokeWidth={1.5}/> {t('rooms.floor')} {room.floor}</span>}
                {room.averageRating > 0 && (
                  <span><Star size={14} fill="#c9a84c" color="#c9a84c"/> {room.averageRating.toFixed(1)} ({room.reviewCount})</span>
                )}
              </div>
            </div>

            <p className="body-lg c-rd-description" style={{ color: 'var(--c-on-surface-variant)', lineHeight: 1.75 }}>
              {lang === 'vi' ? (room.descriptionVi || room.description) : room.description}
            </p>

            {/* Amenities */}
            <div className="c-rd-amenities">
              <h2 className="title-lg c-rd-section-title">{t('rooms.amenities')}</h2>
              <div className="c-rd-amenities__grid">
                {amenities.map((am, i) => {
                  const name = typeof am === 'string' ? am : (am.name || am.amenityName || '');
                  return (
                    <div key={i} className="c-rd-amenity">
                      <span className="c-rd-amenity__icon">{AMENITY_ICONS[name] || <Check size={18} strokeWidth={1.5}/>}</span>
                      <span className="c-rd-amenity__name">{name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="c-rd-reviews">
              <h2 className="title-lg c-rd-section-title">
                {t('booking.step4')} ({reviews.length} {t('common.review')})
              </h2>
              <div className="c-rd-reviews__avg">
                <span className="c-rd-reviews__score display-md text-primary-color">
                  {room.averageRating?.toFixed(1) || '—'}
                </span>
                <div>
                  <div className="c-stars">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={16} fill={s <= Math.round(room.averageRating || 0) ? '#c9a84c' : 'none'} color="#c9a84c" />
                    ))}
                  </div>
                  <p className="text-muted" style={{ fontSize: 'var(--text-label-md)', fontFamily: 'var(--font-sans)' }}>
                    Based on {room.reviewCount || reviews.length} reviews
                  </p>
                </div>
              </div>
              <div className="c-rd-reviews__list">
                {reviews.map(r => (
                  <div key={r.id} className="c-rd-review">
                    <div className="c-rd-review__header">
                      <div className="c-rd-review__avatar">{r.guestName[0]}</div>
                      <div>
                        <p className="c-rd-review__name" style={{ fontWeight:600, fontFamily:'var(--font-sans)' }}>{r.guestName}</p>
                        <p className="text-muted" style={{ fontSize:'var(--text-caption)', fontFamily:'var(--font-sans)' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="c-stars" style={{ marginLeft: 'auto' }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s<=r.rating?'#c9a84c':'none'} color="#c9a84c" />)}
                      </div>
                    </div>
                    <p className="body-lg" style={{ color:'var(--c-on-surface-variant)', marginTop:'var(--sp-10, 0.625rem)' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking panel */}
          <aside className="c-rd-booking-panel">
            <div className="c-rd-booking-panel__inner card">
              <div className="c-rd-booking-panel__price">
                <span className="text-muted" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)' }}>{t('common.from')}</span>
                <span className="display-md text-primary-color">{formatPrice(price)}</span>
                <span className="text-muted" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)' }}>{t('rooms.perNight')}</span>
              </div>

              <div className="c-rd-booking-panel__dates">
                <div className="input-tray">
                  <label htmlFor="rd-checkin">{t('booking.checkIn')}</label>
                  <input id="rd-checkin" type="date" min={today} value={checkIn} onChange={e=>setCheckIn(e.target.value)} />
                </div>
                <div className="input-tray">
                  <label htmlFor="rd-checkout">{t('booking.checkOut')}</label>
                  <input id="rd-checkout" type="date" min={checkIn} value={checkOut} onChange={e=>setCheckOut(e.target.value)} />
                </div>
              </div>

              <div className="c-rd-booking-panel__summary">
                <div className="c-summary-row">
                  <span>{formatPrice(price)} × {nights} {t('booking.nights')}</span>
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
                to={`/booking/${id}?checkIn=${checkIn}&checkOut=${checkOut}`}
                className="btn btn-primary c-rd-booking-btn"
                id="room-detail-book-btn"
              >
                {t('rooms.bookNow')} <ArrowRight size={16} />
              </Link>

              <p className="c-rd-booking-note text-muted">
                {lang === 'vi' ? 'Không tính phí huỷ trong 24 giờ đầu.' : 'Free cancellation within 24 hours.'}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="c-lightbox" role="dialog" aria-modal="true" aria-label="Image gallery">
          <button className="c-lightbox__close" onClick={() => setLightbox(null)} aria-label="Close gallery" id="lightbox-close-btn">
            <X size={24} />
          </button>
          <button className="c-lightbox__nav c-lightbox__nav--prev" onClick={() => setLightbox(i => (i - 1 + images.length) % images.length)} aria-label="Previous image" id="lightbox-prev-btn">
            <ChevronLeft size={28} />
          </button>
          <img src={images[lightbox]} alt={`${room.name} - ${lightbox + 1}`} className="c-lightbox__img" />
          <button className="c-lightbox__nav c-lightbox__nav--next" onClick={() => setLightbox(i => (i + 1) % images.length)} aria-label="Next image" id="lightbox-next-btn">
            <ChevronRight size={28} />
          </button>
          <div className="c-lightbox__counter">{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </div>
  );
}
