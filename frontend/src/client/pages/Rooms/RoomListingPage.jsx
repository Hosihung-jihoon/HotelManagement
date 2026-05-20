import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getRooms, getRoomTypes, UNSPLASH } from '../../api/clientApi';
import { formatPrice } from '../../utils/formatPrice';
import {
  SlidersHorizontal, Star, Maximize2, Users,
  ArrowRight, BedDouble
} from 'lucide-react';
import './RoomListingPage.css';

const PRICE_MAX = 10000000;
const ROOM_IMGS = [UNSPLASH.room, UNSPLASH.roomSuite, UNSPLASH.roomDeluxe, UNSPLASH.roomFamily];

export default function RoomListingPage() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    type: '',
    minPrice: 0,
    maxPrice: PRICE_MAX,
    guests: 1,
    sortBy: 'price_asc',
  });

  useEffect(() => {
    document.title = 'Rooms - Hotel Management';
    Promise.all([
      getRooms({ pageSize: 50 }),
      getRoomTypes().catch(() => ({ data: [] })),
    ])
      .then(([roomRes, typeRes]) => {
        const roomData = roomRes.data?.items || roomRes.data || [];
        setRooms(roomData);
        setRoomTypes(typeRes.data?.items || typeRes.data || []);
        setError('');
      })
      .catch(() => {
        setRooms([]);
        setRoomTypes([]);
        setError('Khong the tai danh sach phong luc nay.');
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const filtered = rooms
    .filter((room) => !filters.type || room.roomTypeName === filters.type || room.roomTypeId === filters.type)
    .filter((room) => room.pricePerNight >= filters.minPrice && room.pricePerNight <= filters.maxPrice)
    .filter((room) => (room.maxOccupancy || 1) >= filters.guests)
    .sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (filters.sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
      return 0;
    });

  const clearFilters = () => setFilters({ type: '', minPrice: 0, maxPrice: PRICE_MAX, guests: 1, sortBy: 'price_asc' });
  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const SORT_OPTIONS = [
    { value: 'price_asc', label: t('rooms.sortPrice') },
    { value: 'price_desc', label: t('rooms.sortPriceDesc') },
  ];

  const statusClass = { Available: 'badge-available', Limited: 'badge-limited', 'Sold Out': 'badge-sold-out' };
  const statusLabel = { Available: t('rooms.available'), Limited: t('rooms.limited'), 'Sold Out': t('rooms.soldOut') };

  return (
    <div className="c-room-listing" style={{ paddingTop: '72px' }}>
      <div className="container">
        <nav className="c-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{t('nav.rooms')}</span>
        </nav>

        <div className="c-room-listing__layout">
          <aside className={`c-filters ${filtersOpen ? 'c-filters--open' : ''}`} aria-label="Room filters">
            <div className="c-filters__header">
              <h2 className="title-lg">{t('rooms.filters')}</h2>
              <button className="c-filters__clear btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn">
                {t('rooms.clearFilters')}
              </button>
            </div>

            <div className="c-filter-group">
              <label className="c-filter-label label-md">{t('rooms.roomType')}</label>
              <div className="c-filter-chips">
                <button
                  className={`c-filter-chip ${!filters.type ? 'active' : ''}`}
                  onClick={() => setFilter('type', '')}
                  id="filter-type-all"
                >
                  All
                </button>
                {roomTypes.map((rt) => (
                  <button
                    key={rt.id || rt.name}
                    className={`c-filter-chip ${filters.type === (rt.name || rt.id) ? 'active' : ''}`}
                    onClick={() => setFilter('type', rt.name || rt.id)}
                    id={`filter-type-${rt.id || rt.name}`}
                  >
                    {rt.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="c-filter-group">
              <label className="c-filter-label label-md">{t('rooms.priceRange')}</label>
              <div className="c-filter-price-display">
                <span>{formatPrice(filters.minPrice)}</span>
                <span>-</span>
                <span>{filters.maxPrice >= PRICE_MAX ? '10M+' : formatPrice(filters.maxPrice)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={PRICE_MAX}
                step={100000}
                value={filters.maxPrice}
                onChange={(e) => setFilter('maxPrice', +e.target.value)}
                className="c-filter-range"
                aria-label="Maximum price"
              />
            </div>

            <div className="c-filter-group">
              <label className="c-filter-label label-md">{t('hero.guests')}</label>
              <div className="c-filter-guests">
                {[1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    className={`c-filter-chip ${filters.guests === g ? 'active' : ''}`}
                    onClick={() => setFilter('guests', g)}
                    id={`filter-guests-${g}`}
                  >
                    {g}+
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="c-room-listing__main">
            <div className="c-room-toolbar">
              <p className="c-room-toolbar__count body-lg text-muted">
                <strong>{filtered.length}</strong> {t('rooms.results')}
              </p>
              <div className="c-room-toolbar__right">
                <select
                  className="c-sort-select"
                  value={filters.sortBy}
                  onChange={(e) => setFilter('sortBy', e.target.value)}
                  aria-label={t('rooms.sortBy')}
                  id="room-sort-select"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  className="btn btn-secondary btn-sm c-filter-toggle-btn"
                  onClick={() => setFiltersOpen((open) => !open)}
                  id="toggle-filters-btn"
                >
                  <SlidersHorizontal size={16} /> {t('rooms.filters')}
                </button>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
              <div className="c-room-listing__grid">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="card">
                    <div className="skeleton" style={{ height: 220 }} />
                    <div style={{ padding: '20px 24px 24px' }}>
                      <div className="skeleton" style={{ height: 24, width: '70%', marginBottom: 12 }} />
                      <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 40, marginTop: 20 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="c-room-listing__empty">
                <BedDouble size={48} strokeWidth={1} style={{ color: 'var(--c-outline)', marginBottom: 16 }} />
                <p className="headline-md" style={{ color: 'var(--c-on-surface-variant)' }}>{t('rooms.noRooms')}</p>
                <button className="btn btn-primary" onClick={clearFilters}>{t('rooms.clearFilters')}</button>
              </div>
            ) : (
              <div className="c-room-listing__grid">
                {filtered.map((room, i) => {
                  const img = room.thumbnailUrl || room.imageUrl || ROOM_IMGS[i % ROOM_IMGS.length];
                  const sc = statusClass[room.status] || 'badge-available';
                  const sl = statusLabel[room.status] || t('rooms.available');
                  return (
                    <article key={room.id} className="c-room-card card" id={`listing-room-${room.id}`}>
                      <div className="c-room-card__img-wrap">
                        <img src={img} alt={room.name} className="c-room-card__img" loading="lazy" />
                        <span className={`badge ${sc} c-room-card__badge`}>{sl}</span>
                        {room.roomTypeName && <span className="c-room-card__type label-md">{room.roomTypeName}</span>}
                      </div>
                      <div className="c-room-card__body">
                        <h3 className="c-room-card__name headline-md">{room.name}</h3>
                        <div className="c-room-card__meta">
                          {room.area && <span className="c-room-card__meta-item"><Maximize2 size={13} strokeWidth={1.5} /> {room.area} {t('rooms.sqm')}</span>}
                          {room.maxOccupancy && <span className="c-room-card__meta-item"><Users size={13} strokeWidth={1.5} /> {room.maxOccupancy} {t('rooms.maxGuests')}</span>}
                          {room.floor && <span className="c-room-card__meta-item"><BedDouble size={13} strokeWidth={1.5} /> {t('rooms.floor')} {room.floor}</span>}
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
                            <span className="c-room-card__amount headline-md text-primary-color">{formatPrice(room.pricePerNight)}</span>
                            <span className="c-room-card__per text-muted">{t('rooms.perNight')}</span>
                          </div>
                          <div className="c-room-card__actions">
                            <Link to={`/rooms/${room.id}`} className="btn btn-secondary btn-sm" id={`detail-btn-${room.id}`}>{t('rooms.viewDetail')}</Link>
                            <Link to={`/booking/${room.id}?adults=1`} className="btn btn-primary btn-sm" id={`book-btn-${room.id}`}>{t('rooms.bookNow')}</Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
