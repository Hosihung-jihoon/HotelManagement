import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

/**
 * useSignalR - Custom hook cho SignalR realtime notifications.
 * 
 * Cách dùng:
 *   const { notifications, connection, clearNotifications } = useSignalR();
 */
export default function useSignalR() {
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const connectionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5280/hubs/notification', {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('ReceiveNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setLatestNotification(notification);
    });

    connection.onreconnecting(() => setConnectionState('Reconnecting'));
    connection.onreconnected(() => setConnectionState('Connected'));
    connection.onclose(() => setConnectionState('Disconnected'));

    connection.start()
      .then(() => {
        setConnectionState('Connected');
        console.log('SignalR Connected');
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        setConnectionState('Error');
      });

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    latestNotification,
    connection: connectionRef.current,
    connectionState,
    clearNotifications,
    setNotifications,
  };
}
