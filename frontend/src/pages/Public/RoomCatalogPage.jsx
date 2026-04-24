import { useEffect, useMemo, useState } from 'react';
import { BedDouble, ChevronRight, ConciergeBell, Filter, Users, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import RoomGallery from '../../components/Public/RoomGallery';
import { getFallbackRooms, normalizeRoom, pickFallbackRoom } from '../../utils/publicRoomData';
import './RoomCatalogPage.css';

function RoomCatalogPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter') === 'available' ? 'available' : 'all';

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [occupancyFilter, setOccupancyFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState(initialFilter);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomResponse = await axiosClient.get('/RoomTypes');
        const roomTypes = Array.isArray(roomResponse.data) ? roomResponse.data : [];

        if (!roomTypes.length) {
          setRooms(getFallbackRooms());
          return;
        }

        const detailResponses = await Promise.allSettled(
          roomTypes.map((room) => axiosClient.get(`/RoomTypes/${room.id}`))
        );

        const normalized = roomTypes.map((room, index) => {
          const detail = detailResponses[index]?.status === 'fulfilled' ? detailResponses[index].value.data : null;
          return normalizeRoom(room, detail, pickFallbackRoom(index));
        });

        setRooms(normalized);
      } catch (error) {
        console.error(error);
        setRooms(getFallbackRooms());
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    let result = rooms;
    
    // Filter by occupancy
    if (occupancyFilter !== 'all') {
      result = result.filter((room) => (room.capacityAdults + room.capacityChildren) >= Number(occupancyFilter));
    }
    
    // Filter by availability (Mock logic for demo: available if totalRooms > 0)
    if (availabilityFilter === 'available') {
      result = result.filter(room => room.totalRooms > 0);
    }
    
    return result;
  }, [occupancyFilter, availabilityFilter, rooms]);

  return (
    <div className="room-catalog-page">
      <section className="room-catalog-hero">
        <div>
          <span className="hotel-kicker">Danh sách phòng</span>
          <h1>Chọn phòng theo nhu cầu lưu trú</h1>
          <p>
            Xem nhanh hình ảnh, sức chứa, giá tham khảo và tiện nghi trước khi vào trang chi tiết để đặt phòng.
          </p>
        </div>
        <div className="room-catalog-filter">
          <div className="filter-group">
            <label htmlFor="availability-filter">
              <Sparkles size={16} />
              <span>Trạng thái</span>
            </label>
            <select
              id="availability-filter"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">Tất cả phòng</option>
              <option value="available">Chỉ phòng còn trống</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="occupancy-filter">
              <Users size={16} />
              <span>Sức chứa</span>
            </label>
            <select
              id="occupancy-filter"
              value={occupancyFilter}
              onChange={(e) => setOccupancyFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="2">Từ 2 khách</option>
              <option value="4">Từ 4 khách</option>
              <option value="6">Từ 6 khách</option>
            </select>
          </div>
        </div>
      </section>

      <section className="room-catalog-list">
        {(loading ? getFallbackRooms() : filteredRooms).map((room) => (
          <article key={room.id || room.name} className="room-catalog-card">
            <Link to={`/site/rooms/${room.id}`} className="room-catalog-gallery">
              <RoomGallery images={room.images} roomName={room.name} />
            </Link>

            <div className="room-catalog-content">
              <div className="room-catalog-header">
                <div>
                  <Link to={`/site/rooms/${room.id}`} className="room-catalog-title-link">
                    <h2>{room.name}</h2>
                  </Link>
                  <p>{room.description}</p>
                </div>
                <strong>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.basePrice || 0)}
                  <span>/ đêm</span>
                </strong>
              </div>

              <div className="room-catalog-meta">
                <span><Users size={16} /> {room.capacityAdults} người lớn / {room.capacityChildren} trẻ em</span>
                <span><BedDouble size={16} /> {room.totalRooms || '--'} phòng đang mở bán</span>
                <span><ConciergeBell size={16} /> Tiện nghi và hình ảnh được cập nhật theo từng hạng phòng</span>
              </div>

              <div className="room-catalog-amenities">
                {(room.amenities || []).map((amenity) => (
                  <div key={amenity.id || amenity.name} className="room-amenity-chip">
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>

              <div className="room-catalog-actions">
                <Link to={`/site/rooms/${room.id}`} className="hotel-primary-link">
                  <BedDouble size={16} />
                  <span>Đặt phòng</span>
                </Link>
                <Link to={`/site/rooms/${room.id}`} className="section-link room-catalog-detail-link">
                  <span>Xem chi tiết phòng</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default RoomCatalogPage;
