import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BedDouble, GlassWater, MapPinned, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import RoomGallery from '../../components/Public/RoomGallery';
import { siteBrand } from '../../config/siteBrand';
import { getDefaultHotelImage, getFallbackRooms, normalizeRoom, pickFallbackRoom } from '../../utils/publicRoomData';
import './HomePage.css';

function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        const roomResponse = await axiosClient.get('/RoomTypes');
        const roomTypes = Array.isArray(roomResponse.data) ? roomResponse.data : [];

        if (!roomTypes.length) {
          setRooms(getFallbackRooms().slice(0, 3));
          return;
        }

        const detailResponses = await Promise.allSettled(
          roomTypes.slice(0, 3).map((room) => axiosClient.get(`/RoomTypes/${room.id}`))
        );

        const normalized = roomTypes.slice(0, 3).map((room, index) => {
          const detail = detailResponses[index]?.status === 'fulfilled' ? detailResponses[index].value.data : null;
          return normalizeRoom(room, detail, pickFallbackRoom(index));
        });

        setRooms(normalized);
      } catch (error) {
        console.error(error);
        setRooms(getFallbackRooms().slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  const heroRoom = useMemo(() => rooms[0] || pickFallbackRoom(0), [rooms]);
  const showcaseRooms = useMemo(
    () => (loading ? getFallbackRooms().slice(0, 3) : rooms),
    [loading, rooms]
  );
  const heroImage = heroRoom.primaryImageUrl || heroRoom.images?.[0]?.imageUrl || getDefaultHotelImage('hero');

  return (
    <div className="hotel-home">
      <section className="hotel-hero">
        <div className="hotel-hero-media">
          <img src={heroImage} alt="Phòng nghỉ nổi bật của khách sạn" />
        </div>
        <div className="hotel-hero-content">
          <div className="hotel-hero-copy">
            <span className="hotel-kicker">Khách sạn nghỉ dưỡng</span>
            <h1>{siteBrand.name}</h1>
            <p>
              Khám phá không gian lưu trú hiện đại, giá rõ ràng và đầy đủ tiện nghi để bạn dễ chọn phòng phù hợp
              cho chuyến đi công tác, nghỉ dưỡng hoặc du lịch cùng gia đình.
            </p>
            <div className="hotel-hero-actions">
              <Link to="/site/rooms?filter=available" className="hotel-primary-link">
                <BedDouble size={17} />
                <span>Đặt phòng ngay</span>
              </Link>
              <Link to="/site/rooms" className="hotel-secondary-link">
                <ArrowRight size={17} />
                <span>Xem chi tiết phòng</span>
              </Link>
            </div>
          </div>

          <aside className="hotel-hero-panel">
            <div className="hotel-hero-panel-top">
              <span>Phòng nổi bật</span>
              <strong>{heroRoom.name}</strong>
              <p>{heroRoom.description}</p>
            </div>
            <div className="hotel-hero-metrics">
              <div><Users size={16} /><span>{heroRoom.capacityAdults + heroRoom.capacityChildren} khách</span></div>
              <div><GlassWater size={16} /><span>Bữa sáng tại nhà hàng</span></div>
              <div><ShieldCheck size={16} /><span>Hỗ trợ nhận phòng nhanh</span></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="hotel-signature-strip">
        <article><Sparkles size={18} /><strong>Không gian chỉn chu</strong><span>Thiết kế ấm cúng, phù hợp nghỉ dưỡng và công tác.</span></article>
        <article><MapPinned size={18} /><strong>Vị trí thuận tiện</strong><span>Dễ di chuyển tới trung tâm và các điểm tham quan.</span></article>
        <article><BedDouble size={18} /><strong>Dễ chọn phòng</strong><span>Xem nhanh giá, sức chứa, ảnh thật và tiện nghi quan trọng.</span></article>
      </section>

      <section className="hotel-showcase-band">
        <div className="hotel-showcase-copy">
          <span className="hotel-kicker hotel-kicker-dark">Lựa chọn nổi bật</span>
          <h2>Chọn nhanh hạng phòng phù hợp với nhu cầu của bạn</h2>
          <p>
            Mỗi hạng phòng đều hiển thị trước hình ảnh, mức giá tham khảo và thông tin cốt lõi để bạn quyết định nhanh
            hơn trước khi vào trang chi tiết.
          </p>
        </div>

        <div className="hotel-showcase-grid">
          {showcaseRooms.slice(0, 3).map((room, index) => (
            <Link key={room.id || room.name} to={`/site/rooms/${room.id}`} className={`hotel-showcase-card showcase-${index + 1}`}>
              <img src={room.primaryImageUrl || room.images?.[0]?.imageUrl || getDefaultHotelImage('hero')} alt={room.name} />
              <div className="hotel-showcase-overlay">
                <strong>{room.name}</strong>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.basePrice || 0)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="featured-rooms" className="featured-rooms-section">
        <div className="section-heading">
          <div>
            <span className="hotel-kicker hotel-kicker-dark">Phòng được quan tâm</span>
            <h2>Danh sách phòng nổi bật trên trang chủ</h2>
          </div>
          <Link to="/site/rooms" className="section-link">Xem toàn bộ phòng</Link>
        </div>

        <div className="featured-room-grid">
          {showcaseRooms.map((room, index) => (
            <article key={room.id || room.name} className={`featured-room-card tone-${index + 1}`}>
              <div className="featured-room-gallery">
                <RoomGallery images={room.images} roomName={room.name} />
              </div>
              <div className="featured-room-content">
                <div className="featured-room-header">
                  <Link to={`/site/rooms/${room.id}`}>
                    <h3>{room.name}</h3>
                  </Link>
                  <span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.basePrice || 0)}
                  </span>
                </div>
                <p>{room.description}</p>
                <div className="featured-room-meta">
                  <span><Users size={15} /> {room.capacityAdults} người lớn</span>
                  <span><BedDouble size={15} /> {room.totalRooms || '--'} phòng</span>
                </div>
                <div className="featured-room-amenities">
                  {(room.amenities || []).slice(0, 4).map((amenity) => (
                    <span key={amenity.id || amenity.name}>{amenity.name}</span>
                  ))}
                </div>
                <div className="featured-room-actions">
                  <Link to={`/site/rooms/${room.id}`} className="hotel-primary-link">
                    <BedDouble size={16} />
                    <span>Đặt phòng</span>
                  </Link>
                  <Link to={`/site/rooms/${room.id}`} className="section-link">
                    <span>Xem chi tiết phòng</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
