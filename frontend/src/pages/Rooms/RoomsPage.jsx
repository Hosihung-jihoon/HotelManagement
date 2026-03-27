import { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import axiosClient from '../../api/axiosClient';
import './RoomsPage.css';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();

    // Khởi tạo SignalR connection
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5280/roomHub")
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log('Connected to SignalR RoomHub');
        connection.on("ReceiveRoomStatusUpdate", (roomId, status) => {
          console.log(`SignalR: Room ${roomId} changed to ${status}`);
          setRooms(prevRooms => prevRooms.map(room => 
            room.id === roomId ? { ...room, status: status } : room
          ));
        });
      })
      .catch(e => console.log('SignalR Connection Error: ', e));

    return () => {
      if(connection) {
        connection.stop();
      }
    };
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Rooms');
      setRooms(res.data);
      setError(null);
    } catch (err) {
      setError('Lỗi tải danh sách phòng.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (roomId, newStatus) => {
    try {
      await axiosClient.put('/Rooms/status', {
        roomId: roomId,
        status: newStatus
      });
      console.log('Update status via API completed. Waiting for SignalR update...');
    } catch (err) {
      alert('Cập nhật trạng thái thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Đang tải sơ đồ phòng...</div>;

  return (
    <div className="rooms-page">
      <div className="page-header">
        <h1>Sơ Đồ Quản Lý Phòng</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="room-grid">
        {rooms.map(room => (
          <div key={room.id} className={`room-card status-${room.status}`}>
            <h3>{room.roomNumber}</h3>
            <p>Tầng: {room.floor} | {room.roomTypeName}</p>
            <div className="room-status">{room.status}</div>
            
            <div className="action-buttons">
              <button className="btn-status" onClick={() => handleUpdateStatus(room.id, 'Available')}>Sẵn Sàng</button>
              <button className="btn-status" onClick={() => handleUpdateStatus(room.id, 'Occupied')}>Đã Đặt</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomsPage;
