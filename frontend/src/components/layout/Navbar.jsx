import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Phòng & Hạng', href: '/rooms' },
  { label: 'Dịch vụ', href: '/services' },
  { label: 'Ưu đãi', href: '/offers' },
  { label: 'Về chúng tôi', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const transparent = isHome && !scrolled && !open;

  return (
    <header className={[styles.nav, transparent ? styles.transparent : styles.solid].join(' ')}>
      <div className={[styles.inner, 'container'].join(' ')}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>✦</span>
          <span className={styles.logoText}>Azure Horizon</span>
        </Link>

        {/* Desktop links */}
        <nav className={styles.links} aria-label="Main navigation">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={[styles.link, location.pathname === l.href ? styles.active : ''].join(' ')}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userWrap}>
              <button className={styles.userBtn} onClick={() => setUserMenu(!userMenu)} aria-label="User menu">
                <User size={18} />
                <span>{user.firstName || user.email}</span>
              </button>
              {userMenu && (
                <div className={styles.userDropdown}>
                  <Link to="/my-bookings" className={styles.dropItem} onClick={() => setUserMenu(false)}>
                    Đặt phòng của tôi
                  </Link>
                  <button className={styles.dropItem} onClick={() => { logout(); setUserMenu(false); }}>
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className={styles.hamburger} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.drawer}>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} to={l.href} className={styles.drawerLink}>{l.label}</Link>
          ))}
          <div className={styles.drawerActions}>
            {user ? (
              <button className={styles.drawerLink} onClick={logout}>Đăng xuất</button>
            ) : (
              <>
                <Link to="/login" className={styles.drawerLink}>Đăng nhập</Link>
                <Link to="/register">
                  <Button variant="primary" size="md" className={styles.drawerCta}>Đăng ký ngay</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
