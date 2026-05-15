import { Link } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { Bed, Users, Star, ArrowRight, Maximize2 } from 'lucide-react';
import { UNSPLASH } from '../../../api/clientApi';
import './FeaturedRoomsSection.css';

const ROOM_FALLBACK_IMAGES = [
  UNSPLASH.room, UNSPLASH.roomSuite, UNSPLASH.roomDeluxe, UNSPLASH.roomFamily,
  UNSPLASH.room, UNSPLASH.roomSuite,
];

const MOCK_ROOMS = [
  { id:1, name:'Deluxe King Room', roomTypeName:'Deluxe', pricePerNight:1800000, maxOccupancy:2, area:32, averageRating:4.8, reviewCount:124, status:'Available' },
  { id:2, name:'Premier Suite',    roomTypeName:'Suite',  pricePerNight:3500000, maxOccupancy:3, area:55, averageRating:4.9, reviewCount:87,  status:'Available' },
  { id:3, name:'Family Room',      roomTypeName:'Family', pricePerNight:2200000, maxOccupancy:4, area:48, averageRating:4.7, reviewCount:63,  status:'Available' },
  { id:4, name:'Classic Twin',     roomTypeName:'Classic',pricePerNight:1200000, maxOccupancy:2, area:26, averageRating:4.6, reviewCount:201, status:'Limited' },
  { id:5, name:'Penthouse Suite',  roomTypeName:'Suite',  pricePerNight:6800000, maxOccupancy:4, area:95, averageRating:5.0, reviewCount:32,  status:'Available' },
  { id:6, name:'Superior Room',    roomTypeName:'Superior',pricePerNight:1500000, maxOccupancy:2, area:30, averageRating:4.7, reviewCount:156, status:'Available' },
];

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

function RoomCard({ room, index, t }) {
  const img = room.thumbnailUrl || room.imageUrl || ROOM_FALLBACK_IMAGES[index % ROOM_FALLBACK_IMAGES.length];
  const statusClass = {
    Available: 'badge-available',
    Limited:   'badge-limited',
    'Sold Out':'badge-sold-out',
  }[room.status] || 'badge-available';

  const statusLabel = {
    Available: t('rooms.available'),
    Limited:   t('rooms.limited'),
    'Sold Out':t('rooms.soldOut'),
  }[room.status] || t('rooms.available');

  return (
    <article className="c-room-card card" id={`room-card-${room.id}`}>
      <div className="c-room-card__img-wrap">
        <img
          src={img}
          alt={room.name}
          className="c-room-card__img"
          loading="lazy"
        />
        <span className={`badge ${statusClass} c-room-card__badge`}>{statusLabel}</span>
        {room.roomTypeName && (
          <span className="c-room-card__type label-md">{room.roomTypeName}</span>
        )}
      </div>

      <div className="c-room-card__body">
        <h3 className="c-room-card__name headline-md">{room.name}</h3>

        <div className="c-room-card__meta">
          {room.area && (
            <span className="c-room-card__meta-item">
              <Maximize2 size={13} strokeWidth={1.5} />
              {room.area} {t('rooms.sqm')}
            </span>
          )}
          {room.maxOccupancy && (
            <span className="c-room-card__meta-item">
              <Users size={13} strokeWidth={1.5} />
              {room.maxOccupancy} {t('rooms.maxGuests')}
            </span>
          )}
          {room.floor && (
            <span className="c-room-card__meta-item">
              <Bed size={13} strokeWidth={1.5} />
              {t('rooms.floor')} {room.floor}
            </span>
          )}
        </div>

        {(room.averageRating || room.reviewCount) && (
          <div className="c-room-card__rating">
            <Star size={14} fill="#c9a84c" color="#c9a84c" />
            <span className="c-room-card__rating-score">{(room.averageRating || 0).toFixed(1)}</span>
            <span className="c-room-card__rating-count text-muted">
              ({room.reviewCount || 0} {t('common.review')})
            </span>
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
            <Link
              to={`/rooms/${room.id}`}
              className="btn btn-secondary btn-sm"
              id={`room-detail-${room.id}`}
            >
              {t('rooms.viewDetail')}
            </Link>
            <Link
              to={`/booking/${room.id}`}
              className="btn btn-primary btn-sm"
              id={`room-book-${room.id}`}
            >
              {t('rooms.bookNow')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="c-room-card card">
      <div className="skeleton" style={{ height: '220px' }} />
      <div className="c-room-card__body">
        <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '20px' }} />
        <div className="skeleton" style={{ height: '40px' }} />
      </div>
    </div>
  );
}

function FeaturedRoomsSection({ rooms, loading }) {
  const { t } = useLang();
  const displayRooms = (rooms && rooms.length > 0) ? rooms.slice(0, 6) : MOCK_ROOMS;

  return (
    <section className="section c-featured-rooms" id="rooms-section" aria-labelledby="featured-rooms-title">
      <div className="container">
        <div className="c-section-header">
          <p className="label-md text-muted c-section-eyebrow">Our Collection</p>
          <h2 className="display-md c-section-title" id="featured-rooms-title">
            {t('rooms.title')}
          </h2>
          <p className="body-lg text-muted c-section-subtitle">{t('rooms.subtitle')}</p>
        </div>

        <div className="c-featured-rooms__grid">
          {loading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : displayRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} t={t} />
              ))
          }
        </div>

        <div className="c-featured-rooms__cta">
          <Link to="/rooms" className="btn btn-primary btn-lg" id="view-all-rooms-btn">
            {t('common.viewAll')} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedRoomsSection;
