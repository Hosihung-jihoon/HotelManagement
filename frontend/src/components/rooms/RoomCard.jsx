import { Link } from 'react-router-dom';
import { Users, Maximize, Star, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import styles from './RoomCard.module.css';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
];

export default function RoomCard({ room, checkIn, checkOut, guests, index = 0 }) {
  const img = room.imageUrl || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  const searchParams = new URLSearchParams();
  if (checkIn)  searchParams.set('checkIn', checkIn);
  if (checkOut) searchParams.set('checkOut', checkOut);
  if (guests)   searchParams.set('guests', guests);

  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 1;

  return (
    <article className={styles.card}>
      {/* Image */}
      <Link to={`/rooms/${room.roomTypeId || room.id}?${searchParams}`} className={styles.imgWrap}>
        <img src={img} alt={room.typeName || room.name} className={styles.img} loading="lazy" />
        {room.isAvailable === false && (
          <div className={styles.unavailableBadge}>Hết phòng</div>
        )}
        {room.tag && <div className={styles.tag}>{room.tag}</div>}
      </Link>

      {/* Content */}
      <div className={styles.body}>
        <div className={styles.meta}>
          {room.rating && (
            <span className={styles.rating}>
              <Star size={12} fill="currentColor" />
              {room.rating.toFixed(1)}
            </span>
          )}
          <span className={styles.category}>{room.category || 'Phòng tiêu chuẩn'}</span>
        </div>

        <h3 className={styles.name}>{room.typeName || room.name}</h3>

        <p className={styles.desc}>
          {room.description
            ? room.description.slice(0, 100) + (room.description.length > 100 ? '…' : '')
            : 'Không gian sang trọng với tầm nhìn tuyệt đẹp, tiện nghi hiện đại.'}
        </p>

        <div className={styles.specs}>
          {room.capacity && (
            <span className={styles.spec}><Users size={13} /> {room.capacity} khách</span>
          )}
          {room.area && (
            <span className={styles.spec}><Maximize size={13} /> {room.area} m²</span>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.priceAmount}>
              {(room.pricePerNight || room.basePrice || 0).toLocaleString('vi-VN')}₫
            </span>
            <span className={styles.priceUnit}>/đêm</span>
            {nights > 1 && (
              <span className={styles.priceTotal}>
                Tổng {((room.pricePerNight || room.basePrice || 0) * nights).toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
          <Link to={`/rooms/${room.roomTypeId || room.id}?${searchParams}`}>
            <Button variant="primary" size="sm" iconRight={<ArrowRight size={14} />}>
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
