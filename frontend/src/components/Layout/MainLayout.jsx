import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './MainLayout.css';

/**
 * Layout chính của ứng dụng - Sidebar + Header + Content.
 * Tất cả trang admin sẽ render bên trong <Outlet />.
 */
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup notification dropdown click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mockHeaderNotifications = [
    { id: 1, title: 'New Booking', time: '2m', unread: true },
    { id: 2, title: '5-Star Review', time: '1h', unread: true },
    { id: 3, title: 'System Warning', time: '3h', unread: false }
  ];

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/room-types', label: 'Loại Phòng', icon: '🏨' },
    { path: '/rooms', label: 'Phòng', icon: '🚪' },
    { path: '/bookings', label: 'Đặt Phòng', icon: '📅' },
    { path: '/invoices', label: 'Hóa Đơn', icon: '💰' },
    { path: '/services', label: 'Dịch Vụ', icon: '🍽️' },
    { path: '/amenities', label: 'Tiện Nghi', icon: '✨' },
    { path: '/articles', label: 'Bài Viết', icon: '📰' },
    { path: '/attractions', label: 'Địa Điểm', icon: '🗺️' },
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
            {/* Notification Bell */}
            <div className="notification-wrapper" ref={notifRef}>
              <button 
                className="notification-btn" 
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <span className="bell-icon">🔔</span>
                <span className="notif-badge">2</span>
              </button>

              {/* Dropdown Menu */}
              {notifOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <span className="mark-read">Mark all as read</span>
                  </div>
                  <div className="dropdown-list">
                    {mockHeaderNotifications.map(n => (
                      <div key={n.id} className={`dropdown-item ${n.unread ? 'unread' : ''}`}>
                        <div className="dropdown-item-content">
                          <strong>{n.title}</strong>
                        </div>
                        <span className="dropdown-time">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button 
                      className="view-all-btn" 
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/notifications');
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

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
