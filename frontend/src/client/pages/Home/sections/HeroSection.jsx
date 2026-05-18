import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { Search, CalendarDays, Users, BedDouble, ChevronDown, ArrowRight } from 'lucide-react';
import { UNSPLASH } from '../../../api/clientApi';
import './HeroSection.css';

function HeroSection() {
  const { t } = useLang();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    checkIn:  today,
    checkOut: tomorrow,
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn:  form.checkIn,
      checkOut: form.checkOut,
      adults:   form.adults,
      children: form.children,
      rooms:    form.rooms,
    });
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <section className="c-hero" aria-label="Hero section">
      {/* Background image */}
      <div
        className="c-hero__bg"
        style={{ backgroundImage: `url('${UNSPLASH.hero}')` }}
        role="img"
        aria-label="Luxury hotel exterior view"
      />
      <div className="c-hero__overlay" />

      {/* Content */}
      <div className="c-hero__content container">
        <div className="c-hero__text">
          <p className="c-hero__eyebrow label-md">Hotel Management</p>
          <h1 className="c-hero__title display-lg">
            {t('hero.title').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p className="c-hero__subtitle body-lg">{t('hero.subtitle')}</p>
          <a href="#rooms-section" className="btn btn-secondary c-hero__scroll-cta" onClick={(e) => { e.preventDefault(); document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
            {t('hero.cta')} <ArrowRight size={16} />
          </a>
        </div>

        {/* Booking Widget */}
        <div className="c-hero__widget glass" role="search" aria-label={t('hero.searchTitle')}>
          <h2 className="c-hero__widget-title title-lg">{t('hero.searchTitle')}</h2>
          <form onSubmit={handleSearch} className="c-hero__form">
            {/* Check-in */}
            <div className="c-hero__field">
              <label htmlFor="hero-checkin" className="c-hero__field-label">
                <CalendarDays size={15} strokeWidth={1.5} />
                {t('hero.checkIn')}
              </label>
              <input
                id="hero-checkin"
                type="date"
                min={today}
                value={form.checkIn}
                onChange={e => set('checkIn', e.target.value)}
                className="c-hero__input"
                required
              />
            </div>

            {/* Check-out */}
            <div className="c-hero__field">
              <label htmlFor="hero-checkout" className="c-hero__field-label">
                <CalendarDays size={15} strokeWidth={1.5} />
                {t('hero.checkOut')}
              </label>
              <input
                id="hero-checkout"
                type="date"
                min={form.checkIn}
                value={form.checkOut}
                onChange={e => set('checkOut', e.target.value)}
                className="c-hero__input"
                required
              />
            </div>

            {/* Guests */}
            <div className="c-hero__field">
              <label className="c-hero__field-label">
                <Users size={15} strokeWidth={1.5} />
                {t('hero.guests')}
              </label>
              <div className="c-hero__counter-row">
                <div className="c-hero__counter">
                  <span className="c-hero__counter-label">{t('hero.adult')}</span>
                  <div className="c-hero__counter-ctrl">
                    <button type="button" onClick={() => set('adults', Math.max(1, form.adults - 1))} aria-label="Decrease adults">−</button>
                    <span>{form.adults}</span>
                    <button type="button" onClick={() => set('adults', Math.min(10, form.adults + 1))} aria-label="Increase adults">+</button>
                  </div>
                </div>
                <div className="c-hero__counter">
                  <span className="c-hero__counter-label">{t('hero.child')}</span>
                  <div className="c-hero__counter-ctrl">
                    <button type="button" onClick={() => set('children', Math.max(0, form.children - 1))} aria-label="Decrease children">−</button>
                    <span>{form.children}</span>
                    <button type="button" onClick={() => set('children', Math.min(6, form.children + 1))} aria-label="Increase children">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="c-hero__field">
              <label htmlFor="hero-rooms" className="c-hero__field-label">
                <BedDouble size={15} strokeWidth={1.5} />
                {t('hero.rooms')}
              </label>
              <div className="c-hero__counter-row">
                <div className="c-hero__counter">
                  <span className="c-hero__counter-label">{t('hero.rooms')}</span>
                  <div className="c-hero__counter-ctrl">
                    <button type="button" onClick={() => set('rooms', Math.max(1, form.rooms - 1))} aria-label="Decrease rooms">−</button>
                    <span>{form.rooms}</span>
                    <button type="button" onClick={() => set('rooms', Math.min(10, form.rooms + 1))} aria-label="Increase rooms">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary c-hero__submit" id="hero-search-btn">
              <Search size={18} strokeWidth={1.5} />
              {t('hero.search')}
            </button>
          </form>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="c-hero__scroll-indicator" aria-hidden="true">
        <div className="c-hero__scroll-dot" />
      </div>
    </section>
  );
}

export default HeroSection;
