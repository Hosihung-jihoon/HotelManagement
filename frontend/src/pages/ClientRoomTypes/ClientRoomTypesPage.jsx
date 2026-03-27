import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axiosClient from '../../api/axiosClient';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ClientRoomTypesPage.css';

function ClientRoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Dummy Default Image
  const defaultImage = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/RoomTypes');
      setRoomTypes(res.data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải danh sách loại phòng.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetailModal = async (id) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const res = await axiosClient.get(`/RoomTypes/${id}`);
      setSelectedRoomType(res.data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải chi tiết phòng.');
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoomType(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Đang tải danh sách phòng...</div>;

  return (
    <div className="client-room-types">
      <div className="client-header">
        <h1>Khám Phá Quỹ Phòng</h1>
        <p>Lựa chọn không gian nghỉ dưỡng lý tưởng cho bạn</p>
      </div>

      <div className="room-type-cards">
        {roomTypes.map(rt => {
          const mainImage = rt.primaryImageUrl || defaultImage;
          
          return (
            <div key={rt.id} className="room-type-card-horizontal">
              <div className="room-type-image-wrapper">
                <img src={mainImage} alt={rt.name} className="room-type-img" />
              </div>
              
              <div className="room-type-content">
                <h2>{rt.name}</h2>
                <div className="room-meta">
                  <span className="meta-item">👥 Người lớn: {rt.capacityAdults}</span>
                  <span className="meta-item">👶 Trẻ em: {rt.capacityChildren}</span>
                </div>
                
                <p className="room-desc">
                  {rt.description ? (rt.description.length > 150 ? rt.description.substring(0, 150) + '...' : rt.description) : 'Chưa có mô tả chi tiết cho loại phòng này.'}
                </p>
                
                <div className="room-footer">
                  <div className="price-box">
                    <span className="price-label">Giá mỗi đêm từ</span>
                    <span className="price-value">{formatPrice(rt.basePrice)}</span>
                  </div>
                  <button className="btn-detail" onClick={() => handleOpenDetailModal(rt.id)}>
                    Xem Gallery & Tiện Nghi
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail Room Type */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close" onClick={closeModal}>×</button>
            
            {modalLoading || !selectedRoomType ? (
              <div style={{textAlign: 'center', padding: '50px'}}>Đang tải chi tiết...</div>
            ) : (
              <>
                <h2>{selectedRoomType.name} - Chi tiết & Gallery</h2>
                
                {/* SLIDER / GALLERY */}
                <div className="gallery-section">
                   {selectedRoomType.images && selectedRoomType.images.length > 0 ? (
                      <Slider {...sliderSettings}>
                        {selectedRoomType.images.map((img) => (
                          <div key={img.id}>
                            <img src={img.imageUrl} alt="Room" className="slider-img" />
                          </div>
                        ))}
                      </Slider>
                   ) : (
                      <div className="no-image-placeholder">
                        <img src={defaultImage} alt="Placeholder" className="slider-img" />
                        <p style={{textAlign: 'center', color: '#999'}}>Chưa có nhiều hình ảnh cho loại phòng này.</p>
                      </div>
                   )}
                </div>

                {/* AMENITIES */}
                <div className="amenities-section" style={{marginTop: '30px'}}>
                  <h3>✨ Tiện Nghi Nổi Bật</h3>
                  {selectedRoomType.amenities && selectedRoomType.amenities.length > 0 ? (
                    <ul className="amenities-list">
                      {selectedRoomType.amenities.map((am) => (
                        <li key={am.id} className="amenity-item">
                          <span>✔️</span> {am.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{color: '#999'}}>Loại phòng này hiện chưa có tiện nghi cụ thể.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientRoomTypesPage;
