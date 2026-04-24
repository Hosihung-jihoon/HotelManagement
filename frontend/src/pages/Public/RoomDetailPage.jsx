import { useEffect, useMemo, useState } from 'react';
import { BedDouble, ChevronLeft, ConciergeBell, GlassWater, MapPinned, Phone, ShieldCheck, Users, Calendar, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import RoomGallery from '../../components/Public/RoomGallery';
import { findFallbackRoomById, getDefaultHotelImage, getFallbackRooms, normalizeRoom, pickFallbackRoom } from '../../utils/publicRoomData';
import './RoomDetailPage.css';

function RoomDetailPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date selection state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [isAvailable, setIsAvailable] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      const fallback = findFallbackRoomById(roomId) || pickFallbackRoom(0);

      try {
        const response = await axiosClient.get(`/RoomTypes/${roomId}`);
        setRoom(normalizeRoom(response.data, response.data, fallback));
      } catch (error) {
        console.error(error);
        setRoom(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
    // Reset availability when room changes
    setIsAvailable(null);
  }, [roomId]);

  // Tự động kiểm tra phòng trống khi thay đổi ngày
  useEffect(() => {
    const autoCheck = async () => {
      if (!checkIn || !checkOut) return;
      setCheckingAvailability(true);
      try {
        const response = await axiosClient.post('/Bookings/search', {
          checkInDate: checkIn,
          checkOutDate: checkOut
        });
        const availableRooms = response.data || [];
        const isRoomTypeAvailable = availableRooms.some(r => r.roomTypeId === parseInt(roomId));
        setIsAvailable(isRoomTypeAvailable);
      } catch (error) {
        console.error("Lỗi tự động kiểm tra:", error);
        setIsAvailable(true); // Fallback
      } finally {
        setCheckingAvailability(false);
      }
    };

    autoCheck();
  }, [checkIn, checkOut, roomId]);

  const displayRoom = useMemo(() => room || findFallbackRoomById(roomId) || pickFallbackRoom(0), [room, roomId]);
  const heroImage = displayRoom.primaryImageUrl || displayRoom.images?.[0]?.imageUrl || getDefaultHotelImage('hero');
  const occupancy = (displayRoom.capacityAdults || 0) + (displayRoom.capacityChildren || 0);
  
  const relatedRooms = useMemo(() => {
    return getFallbackRooms()
      .filter((item) => String(item.id) !== String(roomId))
      .slice(0, 4);
  }, [roomId]);

  const [reviews, setReviews] = useState([
    { id: 1, author: "Nguyễn Văn A", rating: 5, comment: "Phòng rất sạch sẽ và hiện đại. Nhân viên phục vụ chu đáo.", date: "20/04/2024" },
    { id: 2, author: "Trần Thị B", rating: 4, comment: "Không gian thoáng mát, view đẹp. Sẽ quay lại lần sau.", date: "15/04/2024" },
    { id: 3, author: "Lê Văn C", rating: 5, comment: "Giá cả hợp lý, vị trí ngay trung tâm, rất thuận tiện.", date: "10/04/2024" }
  ]);

  const [newReview, setNewReview] = useState({ rating: 5, author: "", comment: "" });
  const [hoverRating, setHoverRating] = useState(0);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.author || !newReview.comment) {
      alert("Vui lòng điền đầy đủ tên và nhận xét của bạn.");
      return;
    }

    const reviewToAdd = {
      id: Date.now(),
      author: newReview.author,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString('vi-VN')
    };

    setReviews([reviewToAdd, ...reviews]);
    setNewReview({ rating: 5, author: "", comment: "" });
    alert("Cảm ơn bạn đã gửi đánh giá!");
  };

  if (loading && !room) {
    return (
      <div className="room-detail-loading">
        <div className="loader"></div>
        <p>Đang tải thông tin phòng...</p>
      </div>
    );
  }

  return (
    <main className="room-detail-page">
      <div className="room-detail-container">
        <div className="room-detail-main">
          <section className="room-detail-header">
            <Link to="/site/rooms" className="room-detail-back-link">
              <ChevronLeft size={16} />
              <span>Quay lại danh sách phòng</span>
            </Link>
            <h1>{displayRoom.name}</h1>
            <div className="room-header-meta">
              <span><MapPinned size={14} /> Khu vực trung tâm</span>
              <span className="rating-badge"><Star size={14} fill="currentColor" /> 4.8 (120 đánh giá)</span>
            </div>
          </section>

          <section className="room-detail-gallery-section">
            <RoomGallery images={displayRoom.images} roomName={displayRoom.name} />
          </section>

          <section className="room-detail-content-grid">
            <div className="room-detail-description">
              <h2>Mô tả chi tiết</h2>
              <p>{displayRoom.description || "Không gian nghỉ dưỡng lý tưởng với đầy đủ trang thiết bị hiện đại, mang lại cảm giác thoải mái như đang ở nhà."}</p>
              
              <div className="room-features">
                <h3>Đặc điểm nổi bật</h3>
                <div className="features-grid">
                  <div className="feature-item"><Users size={18} /> <span>Tối đa {occupancy} khách</span></div>
                  <div className="feature-item"><BedDouble size={18} /> <span>{displayRoom.capacityAdults} giường lớn</span></div>
                  <div className="feature-item"><ConciergeBell size={18} /> <span>Dịch vụ phòng 24/7</span></div>
                  <div className="feature-item"><ShieldCheck size={18} /> <span>An ninh tuyệt đối</span></div>
                </div>
              </div>

              <div className="room-amenities-section">
                <h3>Tiện nghi phòng</h3>
                <div className="amenities-list">
                  {(displayRoom.amenities || []).map((amenity) => (
                    <span key={amenity.id || amenity.name} className="amenity-tag">
                      <CheckCircle2 size={14} /> {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="room-detail-sidebar">
              <div className="booking-card">
                <div className="booking-card-price">
                  <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayRoom.basePrice || 0)}</strong>
                  <span>/ đêm</span>
                </div>

                <div className="booking-form">
                  <div className="date-input-group">
                    <label><Calendar size={14} /> Ngày nhận phòng</label>
                    <input 
                      type="date" 
                      min={today} 
                      value={checkIn} 
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        setIsAvailable(null);
                      }} 
                    />
                  </div>
                  <div className="date-input-group">
                    <label><Calendar size={14} /> Ngày trả phòng</label>
                    <input 
                      type="date" 
                      min={checkIn || today} 
                      value={checkOut} 
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        setIsAvailable(null);
                      }} 
                    />
                  </div>

                  {isAvailable !== null ? (
                    <div className={`availability-status ${isAvailable ? 'available' : 'unavailable'}`}>
                      {isAvailable ? 'Còn phòng' : 'Hết phòng'}
                    </div>
                  ) : (
                    <div className="availability-status loading">
                      {checkingAvailability ? 'Đang kiểm tra...' : 'Chọn ngày để xem trạng thái'}
                    </div>
                  )}

                  <Link 
                    to={isAvailable ? "/login" : "#"} 
                    className={`book-now-btn ${!isAvailable && isAvailable !== null ? 'disabled' : ''}`}
                    onClick={(e) => (!isAvailable && isAvailable !== null) && e.preventDefault()}
                  >
                    Đặt phòng ngay
                  </Link>

                  <p className="booking-note">Bạn sẽ được chuyển đến trang đăng nhập/thanh toán</p>
                </div>

                <div className="sidebar-contact">
                  <p>Cần hỗ trợ trực tiếp?</p>
                  <a href="tel:+842812345678" className="contact-link">
                    <Phone size={16} /> <span>028 1234 5678</span>
                  </a>
                </div>
              </div>
            </aside>
          </section>

          <section className="room-reviews-section">
            <div className="section-header">
              <h2>Đánh giá từ khách hàng</h2>
              <div className="overall-rating">
                <Star size={20} fill="#f59e0b" color="#f59e0b" />
                <strong>4.8</strong>
                <span>({reviews.length} đánh giá)</span>
              </div>
            </div>

            <div className="add-review-card">
              <h3>Viết đánh giá của bạn</h3>
              <form onSubmit={handleAddReview} className="review-form">
                <div className="star-rating-input">
                  <span>Chất lượng phòng:</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        className="star-icon"
                        fill={(hoverRating || newReview.rating) >= star ? "#f59e0b" : "none"}
                        color="#f59e0b"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <textarea
                    placeholder="Nhận xét của bạn về trải nghiệm tại phòng này..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                    rows="3"
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-review-btn">Gửi đánh giá</button>
              </form>
            </div>

            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>{review.author}</strong>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "#f59e0b" : "none"} color="#f59e0b" />
                    ))}
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="room-related-section">
          <div className="section-header">
            <h2>Gợi ý phòng khác cho bạn</h2>
            <Link to="/site/rooms" className="see-all-link">Xem tất cả</Link>
          </div>
          <div className="related-grid">
            {relatedRooms.map((item) => (
              <Link key={item.id} to={`/site/rooms/${item.id}`} className="related-room-card">
                <div className="related-image">
                  <img src={item.primaryImageUrl || item.images?.[0]?.imageUrl || getDefaultHotelImage('hero')} alt={item.name} />
                  <div className="related-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.basePrice || 0)}
                  </div>
                </div>
                <div className="related-info">
                  <h3>{item.name}</h3>
                  <div className="related-meta">
                    <span><Users size={12} /> {item.capacityAdults + item.capacityChildren} khách</span>
                    <span><BedDouble size={12} /> {item.capacityAdults} giường</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default RoomDetailPage;
