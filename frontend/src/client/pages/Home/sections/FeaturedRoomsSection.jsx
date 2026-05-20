import { Link } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { Bed, Users, Star, ArrowRight, Maximize2 } from 'lucide-react';
import { UNSPLASH } from '../../../api/clientApi';
import { formatPrice } from '../../../utils/formatPrice';
import './FeaturedRoomsSection.css';

const ROOM_FALLBACK_IMAGES = [
  UNSPLASH.room, UNSPLASH.roomSuite, UNSPLASH.roomDeluxe, UNSPLASH.roomFamily,
  UNSPLASH.room, UNSPLASH.roomSuite,
];

function RoomCard({ room, index, t }) {
  const img = room.thumbnailUrl || room.imageUrl || ROOM_FALLBACK_IMAGES[index % ROOM_FALLBACK_IMAGES.length];
  const statusClass = {
    Available: 'badge-available',
    Limited: 'badge-limited',
    'Sold Out': 'badge-sold-out',
  };
  const badgeClass = statusClass[room.status] || 'badge-available';

  return (
    <article className="c-room-card card">
      <div className="c-room-card__img-wrap">
        <img src={img} alt={room.name} className="c-room-card__img" loading="lazy" />
        <span className={`badge ${badgeClass} c-room-card__badge`}>{room.status || t('rooms.available')}</span>
        {room.roomTypeName && <span className="c-room-card__type label-md">{room.roomTypeName}</span>}
      </div>

      <div className="c-room-card__body">
        <h3 className="c-room-card__name headline-md">{room.name}</h3>

        <div className="c-room-card__meta">
          {room.area && (
            <span className="c-room-card__meta-item">
              <Maximize2 size={13} strokeWidth={1.5} /> {room.area} {t('rooms.sqm')}
            </span>
          )}
          {room.maxOccupancy && (
            <span className="c-room-card__meta-item">
              <Users size={13} strokeWidth={1.5} /> {room.maxOccupancy} {t('rooms.maxGuests')}
            </span>
          )}
          {room.floor && (
            <span className="c-room-card__meta-item">
              <Bed size={13} strokeWidth={1.5} /> {t('rooms.floor')} {room.floor}
            </span>
          )}
        </div>

        {room.averageRating > 0 && (
          <div className="c-room-card__rating">
            <Star size={14} fill="#c9a84c" color="#c9a84c" />
            <span className="c-room-card__rating-score">{room.averageRating.toFixed(1)}</span>
            <span className="c-room-card__rating-count text-muted">({room.reviewCount || 0} {t('common.review')})</span>
          </div>
        )}

        <div className="c-room-card__footer">
          <div className="c-room-card__price">
            <span className="c-room-card__from text-muted">{t('common.from')}</span>
            <span className="c-room-card__amount headline-md text-primary-color">
              {formatPrice(room.pricePerNight)}
            </span>
            <span className="c-room-card__per text-muted">{t('rooms.perNight')}</span>
          </div>

          <div className="c-room-card__actions">
            <Link to={`/rooms/${room.id}`} className="btn btn-secondary btn-sm">
              {t('rooms.viewDetail')}
            </Link>
            <Link to={`/booking/${room.id}?adults=1`} className="btn btn-primary btn-sm">
              {t('rooms.bookNow')} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedRoomsSection({ rooms = [] }) {
  const { t } = useLang();
  const items = rooms.slice(0, 6);

  return (
    <section className="section c-featured-rooms" aria-labelledby="featured-rooms-title">
      <div className="container">
        <div className="c-section-head">
          <div>
            <p className="eyebrow">{t('home.roomsEyebrow')}</p>
            <h2 className="display-md c-section-title" id="featured-rooms-title">{t('home.roomsTitle')}</h2>
          </div>
          <Link to="/rooms" className="btn btn-secondary btn-lg">
            {t('common.viewAll')}
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="c-empty-state">
            <p>{t('rooms.noRooms')}</p>
          </div>
        ) : (
          <div className="c-featured-rooms__grid">
            {items.map((room, index) => (
              <RoomCard key={room.id} room={room} index={index} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
