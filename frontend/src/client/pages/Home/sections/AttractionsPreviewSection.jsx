import { Link } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { MapPin, ArrowRight } from 'lucide-react';
import { MOCK_LOCATIONS } from '../../../api/clientApi';
import './AttractionsPreviewSection.css';

function AttractionsPreviewSection({ locations }) {
  const { t, lang } = useLang();
  const items = (locations && locations.length > 0) ? locations.slice(0, 6) : MOCK_LOCATIONS;

  return (
    <section className="section c-attractions-preview" aria-labelledby="attractions-title">
      <div className="container">
        <div className="c-section-header">
          <p className="label-md text-muted c-section-eyebrow">Explore More</p>
          <h2 className="display-md c-section-title" id="attractions-title">
            {t('attractions.title')}
          </h2>
          <p className="body-lg text-muted c-section-subtitle">{t('attractions.subtitle')}</p>
        </div>

        <div className="c-attractions-preview__grid">
          {items.map((loc, i) => (
            <article key={loc.id} className="c-attr-card" id={`attraction-${loc.id}`}>
              <div className="c-attr-card__img-wrap">
                <img
                  src={loc.imageUrl || `https://images.unsplash.com/photo-1555217851-6141535bd771?w=600&q=75`}
                  alt={lang === 'vi' ? (loc.nameVi || loc.name) : loc.name}
                  className="c-attr-card__img"
                  loading="lazy"
                />
                <div className="c-attr-card__overlay">
                  <div className="c-attr-card__info">
                    <h3 className="c-attr-card__name title-lg">
                      {lang === 'vi' ? (loc.nameVi || loc.name) : loc.name}
                    </h3>
                    <p className="c-attr-card__distance">
                      <MapPin size={13} strokeWidth={1.5} />
                      {loc.distance} {t('attractions.distance')}
                    </p>
                  </div>
                </div>
                {loc.category && (
                  <span className="c-attr-card__category badge">{loc.category}</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="c-attractions-preview__cta" style={{ textAlign: 'center', marginTop: 'var(--sp-40)' }}>
          <Link to="/attractions" className="btn btn-primary btn-lg" id="view-all-attractions-btn">
            {t('common.viewAll')} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AttractionsPreviewSection;
