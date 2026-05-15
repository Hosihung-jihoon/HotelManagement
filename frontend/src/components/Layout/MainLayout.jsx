import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useSignalR from '../../hooks/useSignalR';
import axiosClient from '../../api/axiosClient';
import './MainLayout.css';
import {
  LayoutDashboard, BedDouble, Package, AlertTriangle,
  Sparkles, CalendarCheck, Users, ShieldCheck,
  Menu, Bell, User as UserIcon, Sun, Moon, Hotel,
  MapPin, FileText, Layers, Target, X, CheckCheck,
  ConciergeBell, UserCheck, LogOut, History, Tag, ChevronDown,
  Coffee, Wifi,
} from 'lucide-react';

/**
 * Layout chính của ứng dụng - Sidebar + Header + Content.
 * Tất cả trang admin sẽ render bên trong <Outlet />.
 */
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [receptionOpen, setReceptionOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, setNotifications, latestNotification } = useSignalR();
  const navigate = useNavigate();
  const location = useLocation();
  const [toasts, setToasts] = useState([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Auto-expand reception group when on front-desk routes
  useEffect(() => {
    if (location.pathname.startsWith('/admin/front-desk')) {
      setReceptionOpen(true);
    }
  }, [location.pathname]);

  // Hiện toast khi có thông báo SignalR mới
  useEffect(() => {
    if (latestNotification) {
      const newToast = { ...latestNotification, toastId: Date.now() };
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.toastId !== newToast.toastId));
      }, 5000);
    }
  }, [latestNotification]);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.put(`/Notifications/${id}`, { isRead: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => axiosClient.put(`/Notifications/${n.id}`, { isRead: true })));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosClient.get('/Notifications');
        if (response.data) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchNotifications();
  }, [setNotifications]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Front-desk sub-items
  const receptionItems = [
    { path: '/admin/front-desk/bookings',       label: 'Quản lý đặt phòng',  icon: <CalendarCheck size={16} /> },
    { path: '/admin/front-desk/today-arrivals', label: 'Khách đến hôm nay',  icon: <UserCheck size={16} /> },
    { path: '/admin/front-desk/current-guests', label: 'Khách đang lưu trú', icon: <Users size={16} /> },
    { path: '/admin/front-desk/checkout',       label: 'Thủ tục trả phòng',  icon: <LogOut size={16} /> },
  ];

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    // Reception group (accordion)
    {
      type: 'group',
      label: 'Quầy lễ tân',
      icon: <ConciergeBell size={20} />,
      items: receptionItems,
    },
    { path: '/admin/rooms',       label: 'Quản lý phòng',        icon: <BedDouble size={20} /> },
    { path: '/admin/room-types',  label: 'Hạng phòng',           icon: <Layers size={20} /> },
    { path: '/admin/inventory',   label: 'Kho vật tư',           icon: <Package size={20} /> },
    { path: '/admin/losses',      label: 'Thất thoát & đền bù',  icon: <AlertTriangle size={20} /> },
    { path: '/admin/housekeeping',label: 'Dọn phòng',            icon: <Sparkles size={20} /> },
    { path: '/admin/vouchers',    label: 'Voucher',              icon: <Tag size={20} /> },
    { path: '/admin/locations',   label: 'Địa điểm',             icon: <MapPin size={20} /> },
    { path: '/admin/services',    label: 'Dịch vụ',              icon: <Coffee size={20} /> },
    { path: '/admin/amenities',   label: 'Tiện nghi',            icon: <Wifi size={20} /> },
    { path: '/admin/articles',    label: 'Bài viết',             icon: <FileText size={20} /> },
    { path: '/admin/members',     label: 'Khách hàng',           icon: <Target size={20} /> },
    { path: '/admin/users',       label: 'Danh sách nhân sự',    icon: <Users size={20} /> },
    { path: '/admin/roles',       label: 'Vai trò & phân quyền', icon: <ShieldCheck size={20} /> },
    { path: '/admin/audit-logs',  label: 'Nhật ký hệ thống',     icon: <History size={20} /> },
  ];

  const isReceptionActive = location.pathname.startsWith('/admin/front-desk');

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
          {menuItems.map((item, idx) => {
            if (item.type === 'group') {
              return (
                <div key={`group-${idx}`} className="nav-group">
                  {/* Group header */}
                  <button
                    className={`nav-group-header ${isReceptionActive ? 'group-active' : ''}`}
                    onClick={() => setReceptionOpen(o => !o)}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        <ChevronDown
                          size={15}
                          className={`nav-chevron ${receptionOpen ? 'rotated' : ''}`}
                        />
                      </>
                    )}
                  </button>
                  {/* Sub-items */}
                  {(receptionOpen || isReceptionActive) && sidebarOpen && (
                    <div className="nav-group-body">
                      {item.items.map(sub => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) =>
                            `nav-sub-item ${isActive ? 'active' : ''}`
                          }
                        >
                          <span className="nav-sub-icon">{sub.icon}</span>
                          <span className="nav-label">{sub.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                end={item.path === '/admin'}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </NavLink>
            );
          })}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {unreadCount > 0 && (
                        <button
                          className="mark-all-read-btn"
                          onClick={handleMarkAllAsRead}
                          title="Đánh dấu tất cả đã đọc"
                        >
                          <CheckCheck size={14} /> Đọc tất cả
                        </button>
                      )}
                      <span className="notification-count">{unreadCount} mới</span>
                    </div>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">Không có thông báo mới</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className={`notification-item type-${n.type || 'info'} ${n.isRead ? 'read' : ''}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <strong>{n.title}</strong>
                            {!n.isRead && (
                              <button
                                className="mark-read-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(n.id);
                                }}
                                title="Đánh dấu đã đọc"
                              >
                                <CheckCheck size={16} />
                              </button>
                            )}
                          </div>
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

      {/* Floating Toasts — góc trên phải */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.toastId} className={`toast-item type-${t.type || 'info'}`}>
            <div className="toast-content">
              <strong>{t.title}</strong>
              <p>{t.message}</p>
            </div>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.toastId !== t.toastId))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainLayout;
