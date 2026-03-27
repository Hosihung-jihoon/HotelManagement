import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import './CustomerLayout.css';

/**
 * Layout Khách Hàng - Thanh Header đơn giản với các trang của Customer.
 */
function CustomerLayout() {
  const navigate = useNavigate();

  return (
    <div className="customer-layout">
      {/* Top Header */}
      <header className="customer-header">
        <div className="header-container">
          <Link to="/" className="customer-logo">
            🏨 <span>Hotel Booking</span>
          </Link>
          
          <nav className="customer-nav">
            {/* <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Trang Chủ
            </NavLink> */}
            <NavLink to="/checkout" className={({ isActive }) => (isActive ? 'active' : '')}>
              Giỏ Hàng / Thanh Toán
            </NavLink>
            <NavLink to="/my-bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Lịch Sử Đặt Phòng
            </NavLink>
          </nav>
          
          <div className="header-actions">
            <button className="btn-customer-login" onClick={() => navigate('/users')}>
              👩‍💼 Góc Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="customer-content">
        <Outlet />
      </main>

      {/* Footer (Optional) */}
      <footer className="customer-footer">
        <p>© 2026 Hotel Booking System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default CustomerLayout;
