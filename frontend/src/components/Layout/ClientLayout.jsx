import { Outlet, NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './ClientLayout.css';

function ClientLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="client-layout">
      {/* Glassmorphism Navigation */}
      <nav className={`client-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="brand-logo" onClick={closeMenu}>
            L'Horizon
          </Link>

          {/* Desktop Menu */}
          <div className="nav-links desktop-only">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink>
            <NavLink to="/attractions" className={({ isActive }) => isActive ? 'active' : ''}>Khám phá</NavLink>
            <NavLink to="/news" className={({ isActive }) => isActive ? 'active' : ''}>Tạp chí</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Liên hệ</NavLink>
          </div>

          <div className="nav-actions desktop-only">
            <Link to="/client/login" className="btn-secondary">Đăng nhập</Link>
            <Link to="/" className="btn-primary">Đặt phòng</Link>
          </div>

          {/* Mobile Toggle */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>Trang chủ</NavLink>
          <NavLink to="/attractions" onClick={closeMenu}>Khám phá</NavLink>
          <NavLink to="/news" onClick={closeMenu}>Tạp chí</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Liên hệ</NavLink>
          <Link to="/client/login" onClick={closeMenu} className="mobile-login">Đăng nhập</Link>
          <Link to="/" onClick={closeMenu} className="btn-primary mobile-book">Đặt phòng</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="client-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="client-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h2>L'Horizon</h2>
            <p>Nơi chân trời hòa quyện cùng nghệ thuật lưu trú.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h3>Về chúng tôi</h3>
              <Link to="/news">Tạp chí</Link>
              <Link to="/attractions">Khám phá</Link>
            </div>
            <div className="link-group">
              <h3>Hỗ trợ</h3>
              <Link to="/contact">Liên hệ</Link>
              <Link to="/faq">Câu hỏi thường gặp</Link>
            </div>
            <div className="link-group">
              <h3>Pháp lý</h3>
              <Link to="/terms">Điều khoản sử dụng</Link>
              <Link to="/privacy-policy">Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} L'Horizon Hotel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ClientLayout;
