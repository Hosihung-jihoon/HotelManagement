import { useState, useEffect } from 'react';
import { useLang } from '../../i18n/LangContext';
import { getPublicServices } from '../../api/clientApi';
import { ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const { t, lang } = useLang();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Services â€” Hotel Management';
    getPublicServices()
      .then((res) => {
        setServices(res.data || []);
        setError('');
      })
      .catch(() => {
        setServices([]);
        setError('Khong the tai danh sach dich vu luc nay.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: '72px', paddingBottom: 'var(--sp-80)', background: 'var(--c-surface)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--c-primary),var(--c-primary-container))', padding: 'var(--sp-80) var(--sp-24) var(--sp-64)' }}>
        <div className="container">
          <p className="label-md" style={{ color: 'var(--c-primary-fixed-dim)', marginBottom: 'var(--sp-12)' }}>Premium Services</p>
          <h1 className="display-md" style={{ color: 'var(--c-on-primary)', marginBottom: 'var(--sp-16)' }}>{t('services.title')}</h1>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 500 }}>{t('services.subtitle')}</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-24)' }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card">
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: 'var(--sp-24)' }}>
                    <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="c-empty-state">
              <p className="body-lg text-muted">Chua co dich vu nao de hien thi.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-24)' }}>
              {services.map((service) => (
                <article key={service.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }} id={`service-${service.id}`}>
                  <div style={{ height: 200, overflow: 'hidden' }}>
                    <img src={service.imageUrl} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} loading="lazy" />
                  </div>
                  <div style={{ padding: 'var(--sp-24)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 'var(--sp-8)', flexWrap: 'wrap' }}>
                      <h3 className="title-lg" style={{ marginBottom: 0, color: 'var(--c-primary)', fontFamily: 'var(--font-serif)' }}>{lang === 'vi' ? service.nameVi || service.name : service.name}</h3>
                      {service.categoryName && <span className="badge badge-silver">{service.categoryName}</span>}
                    </div>
                    <p className="text-muted body-lg" style={{ marginBottom: 'var(--sp-16)' }}>{lang === 'vi' ? service.descriptionVi || service.description : service.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <span className="text-primary-color" style={{ fontWeight: 700 }}>
                        {Number(service.price || 0).toLocaleString('vi-VN')}d{service.unit ? ` / ${service.unit}` : ''}
                      </span>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--c-primary)' }} id={`enquire-${service.id}`}>
                        {t('services.enquire')} <ArrowRight size={14} />
                      </button>
                    </div>
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
