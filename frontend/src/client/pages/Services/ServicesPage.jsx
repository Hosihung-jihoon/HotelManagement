import { useState, useEffect } from 'react';
import { useLang } from '../../i18n/LangContext';
import { getPublicServices, MOCK_SERVICES } from '../../api/clientApi';
import { ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const { t, lang } = useLang();
  const [services, setServices] = useState([]);

  useEffect(() => {
    document.title = 'Services — Hotel Management';
    getPublicServices()
      .then(res => setServices(res.data?.items || res.data || MOCK_SERVICES))
      .catch(() => setServices(MOCK_SERVICES));
  }, []);

  const items = services.length > 0 ? services : MOCK_SERVICES;

  return (
    <div style={{ paddingTop:'72px', paddingBottom:'var(--sp-80)', background:'var(--c-surface)', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(135deg,var(--c-primary),var(--c-primary-container))', padding:'var(--sp-80) var(--sp-24) var(--sp-64)' }}>
        <div className="container">
          <p className="label-md" style={{ color:'var(--c-primary-fixed-dim)', marginBottom:'var(--sp-12)' }}>Premium Services</p>
          <h1 className="display-md" style={{ color:'var(--c-on-primary)', marginBottom:'var(--sp-16)' }}>{t('services.title')}</h1>
          <p className="body-lg" style={{ color:'rgba(255,255,255,0.82)', maxWidth:500 }}>{t('services.subtitle')}</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'var(--sp-24)' }}>
            {items.map(s => (
              <article key={s.id} className="card" style={{ overflow:'hidden', cursor:'pointer' }} id={`service-${s.id}`}>
                <div style={{ height:200, overflow:'hidden' }}>
                  <img src={s.imageUrl} alt={lang==='vi'?s.nameVi||s.name:s.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }} loading="lazy" />
                </div>
                <div style={{ padding:'var(--sp-24)' }}>
                  <h3 className="title-lg" style={{ marginBottom:'var(--sp-8)', color:'var(--c-primary)', fontFamily:'var(--font-serif)' }}>{lang==='vi'?s.nameVi||s.name:s.name}</h3>
                  <p className="text-muted body-lg" style={{ marginBottom:'var(--sp-16)' }}>{lang==='vi'?s.descriptionVi||s.description:s.description}</p>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--c-primary)' }} id={`enquire-${s.id}`}>
                    {t('services.enquire')} <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
