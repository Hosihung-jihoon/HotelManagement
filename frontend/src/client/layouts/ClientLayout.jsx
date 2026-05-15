import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../i18n/LangContext';
import {
  Hotel, Menu, X, Search, Globe, User, ChevronDown,
  LogOut, CalendarCheck, Heart, Star, Bell,
} from 'lucide-react';
import ClientFooter from './ClientFooter';
import '../../client/styles/client-design-system.css';
import './ClientLayout.css';

function ClientLayout() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [userMenuOpen,setUserMenuOpen]= useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { lang, t, toggleLang } = useLang();
  const navigate  = useNavigate();
  const location  = useLocation();
  const searchRef = useRef(null);

  // Glassmorphic effect on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { to: '/rooms',       label: t('nav.rooms') },
    { to: '/services',    label: t('nav.services') },
    { to: '/attractions', label: t('nav.attractions') },
    { to: '/blog',        label: t('nav.blog') },
    { to: '/about',       label: t('nav.about') },
    { to: '/contact',     label: t('nav.contact') },
  ];

  const isHeroPage = ['/', '/about'].includes(location.pathname);

  return (
    <div className="client-root">
      {/* ── Navbar ── */}
      <header className={`c-navbar ${scrolled || !isHeroPage ? 'c-navbar--scrolled' : ''} ${menuOpen ? 'c-navbar--open' : ''}`}>
        <div className="c-navbar__inner container">

          {/* Logo */}
          <Link to="/" className="c-navbar__logo" aria-label="Hotel Management Home">
            <Hotel size={26} strokeWidth={1.5} />
            <span className="c-navbar__logo-text">Hotel Management</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="c-navbar__links" aria-label="Main navigation">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `c-nav-link ${isActive ? 'c-nav-link--active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="c-navbar__actions">
            {/* Search */}
            <button
              className="c-navbar__icon-btn"
              onClick={() => setSearchOpen(o => !o)}
              aria-label={t('nav.search')}
              id="navbar-search-btn"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Language toggle */}
            <button
              className="c-navbar__lang-btn"
              onClick={toggleLang}
              aria-label="Toggle language"
              id="navbar-lang-btn"
            >
              <Globe size={16} strokeWidth={1.5} />
              <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
            </button>

            {/* User account */}
            {isAuthenticated ? (
              <div className="c-navbar__user" id="navbar-user-menu">
                <button
                  className="c-navbar__user-btn"
                  onClick={() => setUserMenuOpen(o => !o)}
                  aria-expanded={userMenuOpen}
                  aria-label={t('nav.account')}
                >
                  <div className="c-navbar__avatar">
                    {user?.fullName?.[0]?.toUpperCase() || <User size={16} />}
                  </div>
                  <ChevronDown size={14} className={`c-navbar__chevron ${userMenuOpen ? 'rotated' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="c-navbar__user-dropdown" role="menu">
                    <div className="c-navbar__user-info">
                      <span className="c-navbar__user-name">{user?.fullName}</span>
                      <span className="c-navbar__user-email">{user?.email}</span>
                    </div>
                    <Link to="/account" className="c-navbar__dd-item" role="menuitem">
                      <User size={15} /> {t('nav.account')}
                    </Link>
                    <Link to="/account?tab=bookings" className="c-navbar__dd-item" role="menuitem">
                      <CalendarCheck size={15} /> {t('account.bookings')}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="c-navbar__dd-item c-navbar__dd-item--admin" role="menuitem" target="_blank" rel="noopener noreferrer">
                        <Star size={15} /> Admin Panel
                      </Link>
                    )}
                    <button className="c-navbar__dd-item c-navbar__dd-item--danger" onClick={handleLogout} role="menuitem">
                      <LogOut size={15} /> {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="c-navbar__auth-btns">
                <Link to="/client-login" className="btn btn-ghost btn-sm" id="navbar-login-btn">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="navbar-register-btn">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="c-navbar__hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              id="navbar-hamburger-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar overlay */}
        {searchOpen && (
          <div className="c-navbar__search-bar" role="search">
            <div className="container">
              <form onSubmit={handleSearch} className="c-navbar__search-form">
                <Search size={18} strokeWidth={1.5} />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="c-navbar__search-input"
                  aria-label={t('nav.search')}
                />
                <button type="button" className="c-navbar__search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">
                  <X size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="c-navbar__mobile-menu" role="navigation" aria-label="Mobile navigation">
            <nav>
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `c-mobile-link ${isActive ? 'c-mobile-link--active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="c-mobile-divider" />
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="c-mobile-link">{t('nav.account')}</Link>
                  <button className="c-mobile-link c-mobile-link--danger" onClick={handleLogout}>{t('nav.logout')}</button>
                </>
              ) : (
                <>
                  <Link to="/client-login" className="c-mobile-link">{t('nav.login')}</Link>
                  <Link to="/register" className="c-mobile-link c-mobile-link--cta">{t('nav.register')}</Link>
                </>
              )}
              <div className="c-mobile-lang">
                <button onClick={toggleLang} className="c-mobile-lang-btn">
                  <Globe size={15} /> {lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main id="main-content">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <ClientFooter />
    </div>
  );
}

export default ClientLayout;
