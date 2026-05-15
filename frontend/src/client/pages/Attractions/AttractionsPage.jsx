import { useState, useEffect } from 'react';
import { useLang } from '../../i18n/LangContext';
import { getPublicLocations, MOCK_LOCATIONS } from '../../api/clientApi';
import { MapPin } from 'lucide-react';

const CATEGORIES = ['All', 'Shopping', 'History', 'Culture', 'Museum', 'Nightlife', 'Nature'];

export default function AttractionsPage() {
  const { t, lang } = useLang();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('All');

  useEffect(() => {
    document.title = 'Attractions — Hotel Management';
    getPublicLocations({ pageSize: 20 })
      .then(res => setLocations(res.data?.items || res.data || MOCK_LOCATIONS))
      .catch(() => setLocations(MOCK_LOCATIONS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cat === 'All' ? locations : locations.filter(l => l.category === cat);

  return (
    <div style={{ paddingTop:'72px', paddingBottom:'var(--sp-80)', background:'var(--c-surface)', minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,var(--c-primary),var(--c-primary-container))', padding:'var(--sp-80) var(--sp-24) var(--sp-64)' }}>
        <div className="container">
          <p className="label-md" style={{ color:'var(--c-primary-fixed-dim)', marginBottom:'var(--sp-12)' }}>Explore</p>
          <h1 className="display-md" style={{ color:'var(--c-on-primary)', marginBottom:'var(--sp-16)' }}>{t('attractions.title')}</h1>
          <p className="body-lg" style={{ color:'rgba(255,255,255,0.82)', maxWidth:500 }}>{t('attractions.subtitle')}</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Category filter */}
          <div style={{ display:'flex', gap:'var(--sp-8)', flexWrap:'wrap', marginBottom:'var(--sp-32)' }}>
            {CATEGORIES.map(c => (
              <button key={c} className={`c-filter-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)} id={`attr-cat-${c}`}>{c}</button>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'var(--sp-24)' }}>
            {(loading ? MOCK_LOCATIONS : filtered).map(loc => (
              <article key={loc.id} className="card" style={{ overflow:'hidden', cursor:'pointer' }} id={`location-${loc.id}`}>
                <div style={{ position:'relative', height:200, overflow:'hidden' }}>
                  <img src={loc.imageUrl} alt={lang==='vi'?loc.nameVi||loc.name:loc.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                  {loc.category && <span className="badge" style={{ position:'absolute', top:12, left:12, background:'rgba(247,250,252,0.88)', color:'var(--c-primary)' }}>{loc.category}</span>}
                </div>
                <div style={{ padding:'var(--sp-16) var(--sp-20)' }}>
                  <h3 className="title-lg" style={{ marginBottom:'var(--sp-8)', color:'var(--c-primary)' }}>{lang==='vi'?loc.nameVi||loc.name:loc.name}</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-6)', color:'var(--c-on-surface-variant)', fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', marginBottom:'var(--sp-8)' }}>
                    <MapPin size={13} strokeWidth={1.5} /> {loc.distance} {t('attractions.distance')}
                  </div>
                  <p className="text-muted body-lg">{loc.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
