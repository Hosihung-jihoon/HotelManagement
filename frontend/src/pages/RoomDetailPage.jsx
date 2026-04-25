import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Users, Maximize, Star, Check, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import BookingForm from '../components/booking/BookingForm';
import Button from '../components/ui/Button';
import client from '../api/client';
import styles from './RoomDetailPage.module.css';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=85',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=85',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=85',
];

export default function RoomDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  const checkIn  = searchParams.get('checkIn')  || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests   = searchParams.get('guests')   || '2';

  useEffect(() => {
    setLoading(true);
    client.get(`/RoomTypes/${id}`)
      .then(r => setRoom(r.data))
      .catch(() => setRoom(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingSpinner} />
      <p>Đang tải thông tin phòng…</p>
    </div>
  );

  if (!room) return (
    <div className={styles.errorPage}>
      <h2 className="headline-md">Không tìm thấy phòng</h2>
      <p className="body-md">Phòng này không tồn tại hoặc đã bị xóa.</p>
      <Button variant="primary" onClick={() => navigate('/rooms')}>
        Quay lại danh sách
      </Button>
    </div>
  );

  const images = room.images?.length
    ? room.images
    : PLACEHOLDER_IMAGES;

  const amenities = room.amenities || [];
  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 1;
  const totalPrice = (room.pricePerNight || room.basePrice || 0) * nights;

  return (
    <main className={styles.page}>
      {/* ── BACK ── */}
      <div className={['container', styles.backRow].join(' ')}>
        <Link to={`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Quay lại kết quả</span>
        </Link>
      </div>

      {/* ── GALLERY ── */}
      <div className={styles.gallery}>
        <div className={styles.galleryMain}>
          <img
            src={images[imgIdx]}
            alt={`${room.typeName || room.name} - ảnh ${imgIdx + 1}`}
            className={styles.galleryImg}
          />
          {images.length > 1 && (
            <>
              <button
                className={[styles.galleryNav, styles.galleryPrev].join(' ')}
                onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                aria-label="Ảnh trước"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className={[styles.galleryNav, styles.galleryNext].join(' ')}
                onClick={() => setImgIdx(i => (i + 1) % images.length)}
                aria-label="Ảnh tiếp"
              >
                <ChevronRight size={20} />
              </button>
              <div className={styles.galleryDots}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={[styles.dot, i === imgIdx ? styles.dotActive : ''].join(' ')}
                    onClick={() => setImgIdx(i)}
                    aria-label={`Ảnh ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className={styles.thumbs}>
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                className={[styles.thumb, i === imgIdx ? styles.thumbActive : ''].join(' ')}
                onClick={() => setImgIdx(i)}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className={['container', styles.content].join(' ')}>
        {/* Left: Details */}
        <div className={styles.details}>
          <div className={styles.detailsHeader}>
            <div>
              <p className={['label-md', styles.category].join(' ')}>
                {room.category || 'Phòng cao cấp'}
              </p>
              <h1 className={['display-sm', styles.roomName].join(' ')}>
                {room.typeName || room.name}
              </h1>
            </div>
            {room.rating && (
              <div className={styles.rating}>
                <Star size={16} fill="currentColor" />
                <span>{room.rating.toFixed(1)}</span>
                <span className={styles.ratingCount}>({room.reviewCount || 0} đánh giá)</span>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className={styles.specs}>
            {room.capacity && (
              <div className={styles.spec}>
                <Users size={18} />
                <div>
                  <span className={styles.specLabel}>Sức chứa</span>
                  <span className={styles.specValue}>{room.capacity} khách</span>
                </div>
              </div>
            )}
            {room.area && (
              <div className={styles.spec}>
                <Maximize size={18} />
                <div>
                  <span className={styles.specLabel}>Diện tích</span>
                  <span className={styles.specValue}>{room.area} m²</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h2 className={['headline-sm', styles.sectionTitle].join(' ')}>Mô tả</h2>
            <p className={['body-lg', styles.desc].join(' ')}>
              {room.description || 'Không gian sang trọng được thiết kế tỉ mỉ, mang đến trải nghiệm nghỉ dưỡng đẳng cấp với tầm nhìn tuyệt đẹp và tiện nghi hiện đại.'}
            </p>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className={styles.section}>
              <h2 className={['headline-sm', styles.sectionTitle].join(' ')}>Tiện nghi</h2>
              <div className={styles.amenitiesGrid}>
                {amenities.map((a, i) => (
                  <div key={i} className={styles.amenity}>
                    <Check size={14} className={styles.amenityCheck} />
                    <span>{a.name || a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policies */}
          <div className={styles.section}>
            <h2 className={['headline-sm', styles.sectionTitle].join(' ')}>Chính sách</h2>
            <div className={styles.policies}>
              <div className={styles.policy}>
                <span className={styles.policyLabel}>Nhận phòng</span>
                <span className={styles.policyValue}>Từ 14:00</span>
              </div>
              <div className={styles.policy}>
                <span className={styles.policyLabel}>Trả phòng</span>
                <span className={styles.policyValue}>Trước 12:00</span>
              </div>
              <div className={styles.policy}>
                <span className={styles.policyLabel}>Hủy phòng</span>
                <span className={styles.policyValue}>Miễn phí trước 24 giờ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking panel */}
        <div className={styles.bookingPanel}>
          <div className={styles.bookingCard}>
            <div className={styles.priceRow}>
              <div>
                <span className={styles.price}>
                  {(room.pricePerNight || room.basePrice || 0).toLocaleString('vi-VN')}₫
                </span>
                <span className={styles.priceUnit}> / đêm</span>
              </div>
              {room.rating && (
                <div className={styles.ratingSmall}>
                  <Star size={13} fill="currentColor" />
                  {room.rating.toFixed(1)}
                </div>
              )}
            </div>

            {nights > 1 && (
              <div className={styles.priceBreakdown}>
                <span>{(room.pricePerNight || room.basePrice || 0).toLocaleString('vi-VN')}₫ × {nights} đêm</span>
                <span className={styles.priceTotal}>{totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
            )}

            {!showBooking ? (
              <Button
                variant="primary"
                size="lg"
                className={styles.bookBtn}
                onClick={() => setShowBooking(true)}
              >
                {checkIn && checkOut ? 'Đặt phòng ngay' : 'Chọn ngày & Đặt phòng'}
              </Button>
            ) : (
              <BookingForm
                room={room}
                initialCheckIn={checkIn}
                initialCheckOut={checkOut}
                initialGuests={parseInt(guests)}
                onCancel={() => setShowBooking(false)}
              />
            )}

            <p className={styles.bookNote}>
              Không tính phí cho đến khi xác nhận. Hủy miễn phí trong 24 giờ.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
