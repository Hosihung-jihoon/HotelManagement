import React, { useState } from 'react';
import './NotificationsPage.css';

const mockNotifications = [
  {
    id: 1,
    title: 'New Booking Request',
    message: 'John Doe has requested a Deluxe Room for 3 nights.',
    time: '2 mins ago',
    type: 'booking',
    isRead: false,
    avatar: '🛎️'
  },
  {
    id: 2,
    title: 'New 5-Star Review',
    message: 'Jane Smith left a glowing review for the Spa Service.',
    time: '1 hour ago',
    type: 'review',
    isRead: false,
    avatar: '⭐'
  },
  {
    id: 3,
    title: 'System Update',
    message: 'Server maintenance scheduled for tonight at 2:00 AM.',
    time: '3 hours ago',
    type: 'system',
    isRead: true,
    avatar: '⚙️'
  },
  {
    id: 4,
    title: 'Low Inventory Alert',
    message: 'Shampoo and Soap supplies are running low in Main Storage.',
    time: 'Yesterday',
    type: 'alert',
    isRead: true,
    avatar: '⚠️'
  },
  {
    id: 5,
    title: 'Payment Received',
    message: 'Payment of $450 received from Booking #1024.',
    time: 'Yesterday',
    type: 'payment',
    isRead: true,
    avatar: '💳'
  }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="notifications-page">
      <div className="notifications-header-section">
        <div className="title-group">
          <span className="page-icon">🔔</span>
          <h1 className="page-title">Notification Center</h1>
          <span className="unread-badge">
            {notifications.filter(n => !n.isRead).length} New
          </span>
        </div>
        <div className="action-group">
          <div className="filter-tabs">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>
          <button className="mark-read-btn" onClick={handleMarkAllRead}>
            ✓ Mark all as read
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notification-card ${notif.isRead ? 'read' : 'unread'} type-${notif.type}`}
            >
              <div className="notif-avatar">{notif.avatar}</div>
              <div className="notif-content">
                <div className="notif-title-row">
                  <h3 className="notif-title">{notif.title}</h3>
                  <span className="notif-time">{notif.time}</span>
                </div>
                <p className="notif-message">{notif.message}</p>
              </div>
              <div className="notif-actions">
                <button 
                  className="toggle-read-btn"
                  onClick={() => handleToggleRead(notif.id)}
                  title={notif.isRead ? "Mark as unread" : "Mark as read"}
                >
                  {notif.isRead ? '🟢' : '⚪'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
