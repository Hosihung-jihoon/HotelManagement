import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getRooms, getRoomTypes, getAmenities, UNSPLASH } from '../../api/clientApi';
import {
  SlidersHorizontal, X, Star, Maximize2, Users, ChevronDown,
  ChevronUp, ArrowRight, BedDouble, Search
} from 'lucide-react';
import './RoomListingPage.css';

const PRICE_MAX = 10000000;
const ROOM_IMGS = [UNSPLASH.room, UNSPLASH.roomSuite, UNSPLASH.roomDeluxe, UNSPLASH.roomFamily];

function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p) + '₫'; }

const MOCK_ROOMS = [
  { id:1, name:'Deluxe King Room',   roomTypeName:'Deluxe',   pricePerNight:1800000, maxOccupancy:2, area:32, averageRating:4.8, reviewCount:124, status:'Available', floor:5 },
  { id:2, name:'Premier Suite',      roomTypeName:'Suite',    pricePerNight:3500000, maxOccupancy:3, area:55, averageRating:4.9, reviewCount:87,  status:'Available', floor:8 },
  { id:3, name:'Family Room',        roomTypeName:'Family',   pricePerNight:2200000, maxOccupancy:4, area:48, averageRating:4.7, reviewCount:63,  status:'Available', floor:4 },
  { id:4, name:'Classic Twin',       roomTypeName:'Classic',  pricePerNight:1200000, maxOccupancy:2, area:26, averageRating:4.6, reviewCount:201, status:'Limited',   floor:3 },
  { id:5, name:'Penthouse Suite',    roomTypeName:'Suite',    pricePerNight:6800000, maxOccupancy:4, area:95, averageRating:5.0, reviewCount:32,  status:'Available', floor:12 },
  { id:6, name:'Superior Room',      roomTypeName:'Superior', pricePerNight:1500000, maxOccupancy:2, area:30, averageRating:4.7, reviewCount:156, status:'Available', floor:6 },
  { id:7, name:'Executive Suite',    roomTypeName:'Suite',    pricePerNight:4200000, maxOccupancy:2, area:68, averageRating:4.9, reviewCount:45,  status:'Available', floor:10 },
  { id:8, name:'Standard Room',      roomTypeName:'Standard', pricePerNight:900000,  maxOccupancy:2, area:22, averageRating:4.4, reviewCount:312, status:'Available', floor:2 },
];

export default function RoomListingPage() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const [rooms,      setRooms]      = useState([]);
  const [roomTypes,  setRoomTypes]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtersOpen,setFiltersOpen]= useState(true);

  const [filters, setFilters] = useState({
    type:      '',
    minPrice:  0,
    maxPrice:  PRICE_MAX,
    minRating: 0,
    guests:    1,
    sortBy:    'price_asc',
  });

  useEffect(() => {
    document.title = 'Rooms — Hotel Management';
    Promise.all([
      getRooms({ pageSize: 50 }).catch(() => ({ data: MOCK_ROOMS })),
      getRoomTypes().catch(() => ({ data: [] })),
    ]).then(([rRes, tRes]) => {
      const rData = rRes.data?.items || rRes.data || MOCK_ROOMS;
      setRooms(rData.length ? rData : MOCK_ROOMS);
      setRoomTypes(tRes.data?.items || tRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = rooms
    .filter(r => !filters.type || r.roomTypeName === filters.type || r.roomTypeId === filters.type)
    .filter(r => r.pricePerNight >= filters.minPrice && r.pricePerNight <= filters.maxPrice)
    .filter(r => (r.averageRating || 0) >= filters.minRating)
    .filter(r => (r.maxOccupancy || 1) >= filters.guests)
    .sort((a, b) => {
      if (filters.sortBy === 'price_asc')  return a.pricePerNight - b.pricePerNight;
      if (filters.sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
      if (filters.sortBy === 'rating')     return (b.averageRating || 0) - (a.averageRating || 0);
      return 0;
    });

  const clearFilters = () => setFilters({ type:'', minPrice:0, maxPrice:PRICE_MAX, minRating:0, guests:1, sortBy:'price_asc' });
  const setFilter   = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));

  const SORT_OPTIONS = [
    { value: 'price_asc',  label: t('rooms.sortPrice') },
    { value: 'price_desc', label: t('rooms.sortPriceDesc') },
    { value: 'rating',     label: t('rooms.sortRating') },
  ];

  const statusClass = { Available:'badge-available', Limited:'badge-limited', 'Sold Out':'badge-sold-out' };
  const statusLabel = { Available: t('rooms.available'), Limited: t('rooms.limited'), 'Sold Out': t('rooms.soldOut') };

  return (
    <div className="c-room-listing" style={{ paddingTop: '72px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="c-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{t('nav.rooms')}</span>
        </nav>

        <div className="c-room-listing__layout">
          {/* ── Filter Sidebar ── */}
          <aside className={`c-filters ${filtersOpen ? 'c-filters--open' : ''}`} aria-label="Room filters">
            <div className="c-filters__header">
              <h2 className="title-lg">{t('rooms.filters')}</h2>
              <button className="c-filters__clear btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn">
                {t('rooms.clearFilters')}
              </button>
            </div>

            {/* Room type */}
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
                {(roomTypes.length > 0 ? roomTypes : [
                  {id:'Deluxe',name:'Deluxe'},{id:'Suite',name:'Suite'},
                  {id:'Classic',name:'Classic'},{id:'Family',name:'Family'},
                  {id:'Superior',name:'Superior'},{id:'Standard',name:'Standard'},
                ]).map(rt => (
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

            {/* Price range */}
            <div className="c-filter-group">
              <label className="c-filter-label label-md">{t('rooms.priceRange')}</label>
              <div className="c-filter-price-display">
                <span>{formatPrice(filters.minPrice)}</span>
                <span>–</span>
                <span>{filters.maxPrice >= PRICE_MAX ? '10M+' : formatPrice(filters.maxPrice)}₫</span>
              </div>
              <input
                type="range"
                min={0}
                max={PRICE_MAX}
                step={100000}
                value={filters.maxPrice}
                onChange={e => setFilter('maxPrice', +e.target.value)}
                className="c-filter-range"
                aria-label="Maximum price"
              />
            </div>

            {/* Min rating */}
            <div className="c-filter-group">
              <label className="c-filter-label label-md">{t('rooms.rating')}</label>
              <div className="c-filter-stars">
                {[0,3,3.5,4,4.5].map(r => (
                  <button
                    key={r}
                    className={`c-filter-chip ${filters.minRating === r ? 'active' : ''}`}
                    onClick={() => setFilter('minRating', r)}
                    id={`filter-rating-${r}`}
                  >
                    {r === 0 ? 'All' : <><Star size={12} fill="#c9a84c" color="#c9a84c" /> {r}+</>}
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="c-filter-group">
              <label className="c-filter-label label-md">{t('hero.guests')}</label>
              <div className="c-filter-guests">
                {[1,2,3,4].map(g => (
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

          {/* ── Room Grid ── */}
          <div className="c-room-listing__main">
            {/* Toolbar */}
            <div className="c-room-toolbar">
              <p className="c-room-toolbar__count body-lg text-muted">
                <strong>{filtered.length}</strong> {t('rooms.results')}
              </p>
              <div className="c-room-toolbar__right">
                <select
                  className="c-sort-select"
                  value={filters.sortBy}
                  onChange={e => setFilter('sortBy', e.target.value)}
                  aria-label={t('rooms.sortBy')}
                  id="room-sort-select"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  className="btn btn-secondary btn-sm c-filter-toggle-btn"
                  onClick={() => setFiltersOpen(o => !o)}
                  id="toggle-filters-btn"
                >
                  <SlidersHorizontal size={16} /> {t('rooms.filters')}
                </button>
              </div>
            </div>

            {/* Grid */}
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
                  const sc  = statusClass[room.status] || 'badge-available';
                  const sl  = statusLabel[room.status] || t('rooms.available');
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
                          {room.area && <span className="c-room-card__meta-item"><Maximize2 size={13} strokeWidth={1.5}/> {room.area} {t('rooms.sqm')}</span>}
                          {room.maxOccupancy && <span className="c-room-card__meta-item"><Users size={13} strokeWidth={1.5}/> {room.maxOccupancy} {t('rooms.maxGuests')}</span>}
                          {room.floor && <span className="c-room-card__meta-item"><BedDouble size={13} strokeWidth={1.5}/> {t('rooms.floor')} {room.floor}</span>}
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
                            <Link to={`/booking/${room.id}`} className="btn btn-primary btn-sm" id={`book-btn-${room.id}`}>{t('rooms.bookNow')}</Link>
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
