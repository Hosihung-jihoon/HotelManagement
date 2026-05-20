import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { getPublicLocations } from '../../api/clientApi';
import { Globe, MapPin } from 'lucide-react';

export default function AttractionsPage() {
  const { t, lang } = useLang();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Attractions - Hotel Management';
    getPublicLocations({ pageSize: 20 })
      .then((res) => {
        setLocations(res.data || []);
        setError('');
      })
      .catch(() => {
        setLocations([]);
        setError('Khong the tai dia diem tham quan luc nay.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: '72px', paddingBottom: 'var(--sp-80)', background: 'var(--c-surface)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--c-primary),var(--c-primary-container))', padding: 'var(--sp-80) var(--sp-24) var(--sp-64)' }}>
        <div className="container">
          <p className="label-md" style={{ color: 'var(--c-primary-fixed-dim)', marginBottom: 'var(--sp-12)' }}>Explore</p>
          <h1 className="display-md" style={{ color: 'var(--c-on-primary)', marginBottom: 'var(--sp-16)' }}>{t('attractions.title')}</h1>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 560 }}>
            {t('attractions.subtitle')}
          </p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {error && <div className="error-banner">{error}</div>}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-24)' }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card">
                  <div className="skeleton" style={{ height: 220 }} />
                  <div style={{ padding: 'var(--sp-16) var(--sp-20)' }}>
                    <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="c-empty-state">
              <p className="body-lg text-muted">Chua co dia diem tham quan de hien thi.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-24)' }}>
              {locations.map((loc) => (
                <article key={loc.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                    <img src={loc.imageUrl} alt={lang === 'vi' ? (loc.nameVi || loc.name) : loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                  <div style={{ padding: 'var(--sp-16) var(--sp-20)' }}>
                    <h3 className="title-lg" style={{ marginBottom: 'var(--sp-8)', color: 'var(--c-primary)' }}>{lang === 'vi' ? (loc.nameVi || loc.name) : loc.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', color: 'var(--c-on-surface-variant)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', marginBottom: 'var(--sp-8)' }}>
                      <MapPin size={13} strokeWidth={1.5} /> {loc.distance} {t('attractions.distance')}
                    </div>
                    {loc.address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-6)', color: 'var(--c-on-surface-variant)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', marginBottom: 'var(--sp-8)' }}>
                        <MapPin size={13} strokeWidth={1.5} style={{ marginTop: 2 }} /> {loc.address}
                      </div>
                    )}
                    <p className="text-muted body-lg">{loc.description}</p>
                    {(loc.mapEmbedLink || loc.googleMapsUrl) && (
                      <a href={loc.googleMapsUrl || loc.mapEmbedLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--sp-12)' }}>
                        <Globe size={14} /> Google Maps
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
