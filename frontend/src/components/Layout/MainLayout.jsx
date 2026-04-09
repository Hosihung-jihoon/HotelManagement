import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useSignalR from '../../hooks/useSignalR';
import './MainLayout.css';
import { 
  LayoutDashboard, BedDouble, Package, AlertTriangle,
  Sparkles, CalendarCheck, Users, ShieldCheck,
  Menu, Bell, User as UserIcon, Sun, Moon, Hotel
} from 'lucide-react';

/**
 * Layout chính của ứng dụng - Sidebar + Header + Content.
 * Tất cả trang admin sẽ render bên trong <Outlet />.
 */
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { user, logout } = useAuth();
  const { notifications } = useSignalR();
  const navigate = useNavigate();

  const unreadCount = notifications.length;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/rooms', label: 'Quản lý phòng', icon: <BedDouble size={20} /> },
    { path: '/inventory', label: 'Kho vật tư', icon: <Package size={20} /> },
    { path: '/losses', label: 'Thất thoát & đền bù', icon: <AlertTriangle size={20} /> },
    { path: '/housekeeping', label: 'Dọn phòng', icon: <Sparkles size={20} /> },
    { path: '/bookings', label: 'Booking & Voucher', icon: <CalendarCheck size={20} /> },
    { path: '/users', label: 'Danh sách nhân sự', icon: <Users size={20} /> },
    { path: '/roles', label: 'Vai trò & phân quyền', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
            <Hotel size={24} />
            {sidebarOpen && <span>Hotel Admin</span>}
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
              end={item.path === '/'}
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
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Menu size={24} />
          </button>
          <div className="header-right">
            {/* Theme Toggle */}
            <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? "Chuyển giao diện Sáng" : "Chuyển giao diện Tối"}>
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="notification-wrapper">
              <button 
                className="notification-bell"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <strong>Thông báo</strong>
                    <span className="notification-count">{unreadCount} mới</span>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">Không có thông báo mới</div>
                    ) : (
                      notifications.slice(0, 10).map((n, i) => (
                        <div key={i} className={`notification-item type-${n.type || 'info'}`}>
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserIcon size={18} /> {user?.fullName || 'Admin'}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
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
