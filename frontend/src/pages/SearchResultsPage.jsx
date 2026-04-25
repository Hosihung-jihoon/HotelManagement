import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import BookingBar from '../components/booking/BookingBar';
import RoomCard from '../components/rooms/RoomCard';
import Button from '../components/ui/Button';
import client from '../api/client';
import styles from './SearchResultsPage.module.css';

const SORT_OPTIONS = [
  { value: 'price_asc',  label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating',     label: 'Đánh giá cao nhất' },
  { value: 'name',       label: 'Tên A → Z' },
];

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: '1 – 3 triệu', min: 1000000, max: 3000000 },
  { label: '3 – 5 triệu', min: 3000000, max: 5000000 },
  { label: 'Trên 5 triệu', min: 5000000, max: Infinity },
];

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const checkIn  = searchParams.get('checkIn')  || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests   = searchParams.get('guests')   || '2';
  const sort     = searchParams.get('sort')     || 'price_asc';
  const priceIdx = parseInt(searchParams.get('priceRange') || '0');
  const priceRange = PRICE_RANGES[priceIdx] || PRICE_RANGES[0];

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageSize: 20, pageNumber: 1 };
      if (checkIn)  params.checkIn  = checkIn;
      if (checkOut) params.checkOut = checkOut;
      if (guests)   params.capacity = guests;

      const { data } = await client.get('/RoomTypes', { params });
      let list = data?.items || data || [];

      // Client-side filter by price
      if (priceRange.max !== Infinity || priceRange.min > 0) {
        list = list.filter(r => {
          const p = r.pricePerNight || r.basePrice || 0;
          return p >= priceRange.min && p <= priceRange.max;
        });
      }

      // Sort
      list = [...list].sort((a, b) => {
        const pa = a.pricePerNight || a.basePrice || 0;
        const pb = b.pricePerNight || b.basePrice || 0;
        if (sort === 'price_asc')  return pa - pb;
        if (sort === 'price_desc') return pb - pa;
        if (sort === 'rating')     return (b.rating || 0) - (a.rating || 0);
        if (sort === 'name')       return (a.typeName || a.name || '').localeCompare(b.typeName || b.name || '');
        return 0;
      });

      setRooms(list);
      setTotal(list.length);
    } catch {
      setRooms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, guests, sort, priceIdx]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, val);
    setSearchParams(next);
  };

  const nights = checkIn && checkOut
    ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 0;

  const currentSort = SORT_OPTIONS.find(o => o.value === sort) || SORT_OPTIONS[0];

  return (
    <main className={styles.page}>
      {/* ── SEARCH BAR ── */}
      <div className={styles.searchSection}>
        <div className="container">
          <BookingBar variant="inline" />
        </div>
      </div>

      <div className={['container', styles.layout].join(' ')}>
        {/* ── SIDEBAR FILTERS ── */}
        <aside className={[styles.sidebar, showFilters ? styles.sidebarOpen : ''].join(' ')}>
          <div className={styles.sidebarHeader}>
            <h2 className={['title-md', styles.filterTitle].join(' ')}>Bộ lọc</h2>
            <button className={styles.closeFilters} onClick={() => setShowFilters(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Price range */}
          <div className={styles.filterGroup}>
            <h3 className={['label-md', styles.filterGroupTitle].join(' ')}>Mức giá / đêm</h3>
            <div className={styles.filterOptions}>
              {PRICE_RANGES.map((r, i) => (
                <button
                  key={r.label}
                  className={[styles.filterChip, priceIdx === i ? styles.filterChipActive : ''].join(' ')}
                  onClick={() => setParam('priceRange', i)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div className={styles.filterGroup}>
            <h3 className={['label-md', styles.filterGroupTitle].join(' ')}>Số khách</h3>
            <div className={styles.filterOptions}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  className={[styles.filterChip, parseInt(guests) === n ? styles.filterChipActive : ''].join(' ')}
                  onClick={() => setParam('guests', n)}
                >
                  {n} khách
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── RESULTS ── */}
        <div className={styles.results}>
          {/* Results header */}
          <div className={styles.resultsHeader}>
            <div className={styles.resultsInfo}>
              <h1 className={['headline-sm', styles.resultsTitle].join(' ')}>
                {loading ? 'Đang tìm kiếm…' : `${total} loại phòng`}
              </h1>
              {nights > 0 && (
                <p className={['body-sm', styles.resultsMeta].join(' ')}>
                  {checkIn} → {checkOut} · {nights} đêm · {guests} khách
                </p>
              )}
            </div>

            <div className={styles.resultsActions}>
              {/* Mobile filter toggle */}
              <Button
                variant="secondary"
                size="sm"
                icon={<SlidersHorizontal size={15} />}
                className={styles.filterToggle}
                onClick={() => setShowFilters(true)}
              >
                Bộ lọc
              </Button>

              {/* Sort dropdown */}
              <div className={styles.sortWrap}>
                <button
                  className={styles.sortBtn}
                  onClick={() => setSortOpen(!sortOpen)}
                >
                  <span>{currentSort.label}</span>
                  <ChevronDown size={14} className={sortOpen ? styles.chevronUp : ''} />
                </button>
                {sortOpen && (
                  <div className={styles.sortDropdown}>
                    {SORT_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        className={[styles.sortOption, sort === o.value ? styles.sortOptionActive : ''].join(' ')}
                        onClick={() => { setParam('sort', o.value); setSortOpen(false); }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Room grid */}
          {loading ? (
            <div className={styles.grid}>
              {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : rooms.length > 0 ? (
            <div className={styles.grid}>
              {rooms.map((room, i) => (
                <RoomCard
                  key={room.roomTypeId || room.id || i}
                  room={room}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={guests}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className="headline-sm">Không tìm thấy phòng phù hợp</h3>
              <p className="body-md">Thử thay đổi ngày hoặc bộ lọc để xem thêm kết quả.</p>
              <Button variant="secondary" onClick={() => setSearchParams({})}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {showFilters && <div className={styles.overlay} onClick={() => setShowFilters(false)} />}
    </main>
  );
}
