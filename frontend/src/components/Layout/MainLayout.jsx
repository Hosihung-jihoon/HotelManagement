import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './MainLayout.css';

/**
 * Layout chính của ứng dụng - Sidebar + Header + Content.
 * Tất cả trang admin sẽ render bên trong <Outlet />.
 */
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/room-types', label: 'Loại Phòng', icon: '🏨' },
    { path: '/rooms', label: 'Phòng', icon: '🚪' },
    { path: '/bookings', label: 'Đặt Phòng', icon: '📅' },
    { path: '/invoices', label: 'Hóa Đơn', icon: '💰' },
    { path: '/services', label: 'Dịch Vụ', icon: '🍽️' },
    { path: '/amenities', label: 'Tiện Nghi', icon: '✨' },
    { path: '/articles', label: 'Bài Viết', icon: '📰' },
    { path: '/reviews', label: 'Đánh Giá', icon: '⭐' },
    { path: '/users', label: 'Người Dùng', icon: '👥' },
    { path: '/vouchers', label: 'Voucher', icon: '🎟️' },
    { path: '/memberships', label: 'Membership', icon: '💎' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">
            {sidebarOpen ? '🏨 Hotel Admin' : '🏨'}
          </h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-header">
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="header-right">
            <span className="user-info">👤 Admin</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
