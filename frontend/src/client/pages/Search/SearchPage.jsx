import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getRooms } from '../../api/clientApi';
import { Search } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

export default function SearchPage() {
  const { lang, t } = useLang();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    document.title = `Search: ${q} — Hotel Management`;
    if (q) {
      getRooms({ search: q, pageSize: 20 })
        .then(res => setRooms(res.data?.items || res.data || []))
        .catch(() => setRooms([]));
    }
  }, [q]);

  return (
    <div style={{ paddingTop:'72px', paddingBottom:'var(--sp-80)', background:'var(--c-surface)', minHeight:'100vh' }}>
      <div className="section">
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-12)', marginBottom:'var(--sp-32)' }}>
            <Search size={24} strokeWidth={1.5} style={{ color:'var(--c-primary)' }} />
            <h1 className="headline-lg" style={{ color:'var(--c-primary)', fontFamily:'var(--font-serif)' }}>
              {lang==='vi'?`Kết quả cho "${q}"`:`Search results for "${q}"`}
            </h1>
          </div>

          {rooms.length === 0 ? (
            <div style={{ textAlign:'center', padding:'var(--sp-64)' }}>
              <p className="headline-md" style={{ color:'var(--c-on-surface-variant)', marginBottom:'var(--sp-24)' }}>
                {lang==='vi'?'Không tìm thấy kết quả.':'No results found.'}
              </p>
              <Link to="/rooms" className="btn btn-primary" id="search-view-all-btn">{t('common.viewAll')}</Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'var(--sp-24)' }}>
              {rooms.map(r => (
                <Link key={r.id} to={`/rooms/${r.id}`} style={{ textDecoration:'none' }} id={`search-result-${r.id}`}>
                  <div className="card" style={{ overflow:'hidden' }}>
                    <img src={r.thumbnailUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=75'} alt={r.name} style={{ width:'100%', height:180, objectFit:'cover' }} />
                    <div style={{ padding:'var(--sp-16) var(--sp-20)' }}>
                      <h3 className="title-lg" style={{ color:'var(--c-on-surface)', marginBottom:'var(--sp-4)' }}>{r.name}</h3>
                      <p className="text-primary-color" style={{ fontWeight:700, fontFamily:'var(--font-sans)' }}>{formatPrice(r.pricePerNight)}/{t('common.night')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
