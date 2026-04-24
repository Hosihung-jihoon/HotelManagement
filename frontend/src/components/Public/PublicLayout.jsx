import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BedDouble, ChevronRight, Hotel, MapPin, Phone, Sparkles, User, LogOut } from 'lucide-react';
import { siteBrand } from '../../config/siteBrand';
import { useAuth } from '../../context/AuthContext';
import './PublicLayout.css';

function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-brand">
          <div className="public-brand-mark">
            <Hotel size={22} />
          </div>
          <div className="public-brand-copy">
            <strong>{siteBrand.name}</strong>
            <span>{siteBrand.tagline}</span>
          </div>
        </div>

        <nav className="public-nav">
          <NavLink to="/site" end>Trang chủ</NavLink>
          <NavLink to="/site/rooms">Phòng nghỉ</NavLink>
          {user && (user.role === 'admin' || user.role === 'manager') && (
            <NavLink to="/">Quản trị</NavLink>
          )}
        </nav>

        <div className="public-header-actions">
          <a className="public-mini-link" href="tel:+842812345678">
            <Phone size={16} />
            <span>028 1234 5678</span>
          </a>
          
          {user ? (
            <div className="user-nav-dropdown">
              <button className="user-profile-btn">
                <User size={16} />
                <span>{user.fullName || 'Tài khoản'}</span>
              </button>
              <button className="public-logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <NavLink className="public-book-button" to="/login">
              <User size={16} />
              <span>Đăng nhập</span>
            </NavLink>
          )}
        </div>
      </header>

      <Outlet />

      <footer className="public-footer">
        <div className="public-footer-grid">
          <section>
            <div className="public-footer-brand">
              <div className="public-brand-mark">
                <Hotel size={20} />
              </div>
              <div>
                <strong>{siteBrand.name}</strong>
                <p>Không gian lưu trú chỉn chu cho khách gia đình, khách công tác và kỳ nghỉ cuối tuần.</p>
              </div>
            </div>
          </section>

          <section>
            <h3>Điểm nổi bật</h3>
            <ul>
              <li><Sparkles size={14} /> Không gian sang trọng, ấm cúng</li>
              <li><MapPin size={14} /> Vị trí thuận tiện, dễ di chuyển</li>
              <li><ChevronRight size={14} /> Phòng đẹp, giá rõ ràng, tiện nghi đầy đủ</li>
            </ul>
          </section>

          <section>
            <h3>Điều hướng</h3>
            <ul>
              <li><NavLink to="/site">Trang chủ</NavLink></li>
              <li><NavLink to="/site/rooms">Danh sách phòng</NavLink></li>
              <li><NavLink to="/login">Đăng nhập</NavLink></li>
            </ul>
          </section>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
