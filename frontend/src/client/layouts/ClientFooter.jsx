import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import { Hotel, MapPin, Phone, Mail, Share2, Send, ExternalLink } from 'lucide-react';
import './ClientFooter.css';

function ClientFooter() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const quickLinks = [
    { to: '/',            label: t('nav.home') },
    { to: '/rooms',       label: t('nav.rooms') },
    { to: '/services',    label: t('nav.services') },
    { to: '/attractions', label: t('nav.attractions') },
    { to: '/blog',        label: t('nav.blog') },
    { to: '/about',       label: t('nav.about') },
    { to: '/contact',     label: t('nav.contact') },
  ];

  return (
    <footer className="c-footer">
      <div className="c-footer__top">
        <div className="container c-footer__grid">

          {/* Brand column */}
          <div className="c-footer__brand">
            <Link to="/" className="c-footer__logo" aria-label="Hotel Management">
              <Hotel size={28} strokeWidth={1.5} />
              <span>Hotel Management</span>
            </Link>
            <p className="c-footer__tagline">{t('footer.tagline')}</p>
            <div className="c-footer__socials">
              <a href="#" className="c-footer__social-btn" aria-label="Facebook" id="footer-facebook">
                <Share2 size={18} />
              </a>
              <a href="#" className="c-footer__social-btn" aria-label="Instagram" id="footer-instagram">
                <ExternalLink size={18} />
              </a>
              <a href="#" className="c-footer__social-btn" aria-label="Youtube" id="footer-youtube">
                <Share2 size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="c-footer__col">
            <h3 className="c-footer__col-title">{t('footer.quickLinks')}</h3>
            <ul className="c-footer__links">
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="c-footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="c-footer__col">
            <h3 className="c-footer__col-title">{t('footer.contact')}</h3>
            <ul className="c-footer__contact-list">
              <li>
                <MapPin size={15} strokeWidth={1.5} />
                <span>{t('footer.address')}</span>
              </li>
              <li>
                <Phone size={15} strokeWidth={1.5} />
                <a href={`tel:${t('footer.phone')}`} className="c-footer__contact-link">
                  {t('footer.phone')}
                </a>
              </li>
              <li>
                <Mail size={15} strokeWidth={1.5} />
                <a href={`mailto:${t('footer.email')}`} className="c-footer__contact-link">
                  {t('footer.email')}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="c-footer__col">
            <h3 className="c-footer__col-title">{t('footer.newsletter')}</h3>
            <p className="c-footer__newsletter-desc">
              {t('lang') === 'vi'
                ? 'Nhận ưu đãi và tin tức mới nhất từ chúng tôi.'
                : 'Get the latest offers and news from us.'}
            </p>
            <form onSubmit={handleSubscribe} className="c-footer__newsletter-form" id="footer-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('footer.newsletterPlaceholder')}
                className="c-footer__newsletter-input"
                required
                aria-label={t('footer.newsletterPlaceholder')}
              />
              <button type="submit" className="c-footer__newsletter-btn" aria-label={t('footer.subscribe')}>
                <Send size={16} />
              </button>
            </form>
            {subscribed && (
              <p className="c-footer__subscribed">
                ✓ {t('lang') === 'vi' ? 'Đăng ký thành công!' : 'Successfully subscribed!'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="c-footer__bottom">
        <div className="container c-footer__bottom-inner">
          <p className="c-footer__copyright">{t('footer.copyright')}</p>
          <div className="c-footer__policies">
            <Link to="/privacy" className="c-footer__policy-link">{t('footer.privacyPolicy')}</Link>
            <span>·</span>
            <Link to="/terms" className="c-footer__policy-link">{t('footer.termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ClientFooter;
