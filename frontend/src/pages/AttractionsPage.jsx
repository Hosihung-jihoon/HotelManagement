import { useState, useEffect } from 'react';
import client from '../api/client';
import '../styles/editorial.css';
import styles from './AttractionsPage.module.css';

const AttractionsPage = () => {
  // Mock data - initialized in state
  const initialAttractions = [
    {
      id: 1,
      name: 'Nhà Thờ Đức Bà',
      description: 'Công trình kiến trúc Gothic nổi tiếng được xây dựng từ thế kỷ 19, là biểu tượng của thành phố với hai tháp chuông cao vút và kiến trúc Pháp đặc trưng.',
      type: 'Danh lam thắng cảnh',
      address: '01 Công xã Paris, Quận 1, TP.HCM',
      distance: 2.5,
      openingHours: '8:00 - 17:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
      rating: 4.8,
      priceRange: 'Miễn phí'
    },
    {
      id: 2,
      name: 'Bưu Điện Trung Tâm',
      description: 'Tòa nhà bưu điện cổ kính với kiến trúc Pháp độc đáo, nội thất gỗ sang trọng và bản đồ cổ. Nơi lý tưởng để gửi bưu thiếp về quê hương.',
      type: 'Danh lam thắng cảnh',
      address: '02 Công xã Paris, Quận 1, TP.HCM',
      distance: 2.3,
      openingHours: '7:00 - 19:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
      rating: 4.7,
      priceRange: 'Miễn phí'
    },
    {
      id: 3,
      name: 'Nhà Hàng The Deck Saigon',
      description: 'Nhà hàng sang trọng bên bờ sông với view tuyệt đẹp, phục vụ các món Âu - Á fusion cao cấp. Không gian lãng mạn, lý tưởng cho bữa tối đặc biệt.',
      type: 'Nhà hàng',
      address: '38 Nguyễn U Dĩ, Quận 2, TP.HCM',
      distance: 5.2,
      openingHours: '11:00 - 23:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      rating: 4.9,
      priceRange: '500.000đ - 1.500.000đ'
    },
    {
      id: 4,
      name: 'Chợ Bến Thành',
      description: 'Khu chợ truyền thống nổi tiếng với hàng nghìn gian hàng bán đồ lưu niệm, quần áo, đồ thủ công mỹ nghệ và đặc sản địa phương. Trải nghiệm mua sắm độc đáo.',
      type: 'Mua sắm',
      address: 'Lê Lợi, Quận 1, TP.HCM',
      distance: 1.8,
      openingHours: '6:00 - 18:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
      rating: 4.5,
      priceRange: 'Đa dạng'
    },
    {
      id: 5,
      name: 'Vincom Center',
      description: 'Trung tâm thương mại hiện đại với các thương hiệu quốc tế, rạp chiếu phim, khu vui chơi giải trí và ẩm thực đa dạng. Điểm đến lý tưởng cho cả gia đình.',
      type: 'Mua sắm',
      address: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
      distance: 1.5,
      openingHours: '9:30 - 22:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&q=80',
      rating: 4.6,
      priceRange: 'Đa dạng'
    },
    {
      id: 6,
      name: 'Nhà Hát Thành Phố',
      description: 'Công trình kiến trúc Pháp tráng lệ, nơi tổ chức các buổi biểu diễn opera, ballet, nhạc giao hưởng và các sự kiện văn hóa nghệ thuật đẳng cấp.',
      type: 'Văn hóa',
      address: '07 Công Trường Lam Sơn, Quận 1, TP.HCM',
      distance: 2.0,
      openingHours: 'Theo lịch biểu diễn',
      imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
      rating: 4.8,
      priceRange: '200.000đ - 2.000.000đ'
    },
    {
      id: 7,
      name: 'Bảo Tàng Chứng Tích Chiến Tranh',
      description: 'Bảo tàng lịch sử quan trọng với nhiều hiện vật, tài liệu và hình ảnh về chiến tranh Việt Nam. Trải nghiệm giáo dục ý nghĩa.',
      type: 'Văn hóa',
      address: '28 Võ Văn Tần, Quận 3, TP.HCM',
      distance: 3.2,
      openingHours: '7:30 - 18:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1565301660306-29e08751cc53?w=800&q=80',
      rating: 4.7,
      priceRange: '40.000đ'
    },
    {
      id: 8,
      name: 'Công Viên Tao Đàn',
      description: 'Công viên xanh mát giữa lòng thành phố, nơi lý tưởng để tập thể dục buổi sáng, dạo bộ thư giãn hoặc tham gia các hoạt động văn hóa cộng đồng.',
      type: 'Giải trí',
      address: 'Trương Định, Quận 1, TP.HCM',
      distance: 2.8,
      openingHours: '5:00 - 21:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80',
      rating: 4.4,
      priceRange: 'Miễn phí'
    },
    {
      id: 9,
      name: 'Phố Đi Bộ Nguyễn Huệ',
      description: 'Tuyến phố đi bộ sầm uất với nhiều quán cà phê, nhà hàng, biểu diễn nghệ thuật đường phố. Điểm hẹn yêu thích của giới trẻ vào buổi tối.',
      type: 'Giải trí',
      address: 'Đường Nguyễn Huệ, Quận 1, TP.HCM',
      distance: 1.2,
      openingHours: '24/7',
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      rating: 4.6,
      priceRange: 'Miễn phí'
    },
    {
      id: 10,
      name: 'Quán Cơm Tấm Sườn Bì Chả',
      description: 'Quán ăn địa phương nổi tiếng với món cơm tấm truyền thống, sườn nướng thơm ngon, bì giòn và chả trứng đặc trưng. Giá cả phải chăng.',
      type: 'Nhà hàng',
      address: '15 Lê Thánh Tôn, Quận 1, TP.HCM',
      distance: 0.8,
      openingHours: '6:00 - 22:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80',
      rating: 4.5,
      priceRange: '30.000đ - 80.000đ'
    },
    {
      id: 11,
      name: 'Bitexco Financial Tower - Skydeck',
      description: 'Tòa nhà cao nhất thành phố với đài quan sát Skydeck ở tầng 49, mang đến tầm nhìn 360 độ toàn cảnh thành phố. Trải nghiệm không thể bỏ lỡ.',
      type: 'Danh lam thắng cảnh',
      address: '36 Hồ Tùng Mậu, Quận 1, TP.HCM',
      distance: 1.5,
      openingHours: '9:30 - 21:30 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
      rating: 4.7,
      priceRange: '200.000đ'
    },
    {
      id: 12,
      name: 'Chill Skybar',
      description: 'Rooftop bar sang trọng với view thành phố tuyệt đẹp, cocktail sáng tạo và không gian hiện đại. Nơi lý tưởng để thư giãn sau ngày dài.',
      type: 'Giải trí',
      address: 'Tầng 26, AB Tower, 76 Lê Lai, Quận 1',
      distance: 2.2,
      openingHours: '17:00 - 02:00 hàng ngày',
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
      rating: 4.8,
      priceRange: '150.000đ - 500.000đ'
    }
  ];

  const [attractions, setAttractions] = useState(initialAttractions);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const response = await client.get('/attractions');
      if (response.data && response.data.length > 0) {
        setAttractions(response.data);
      }
    } catch (error) {
      console.log('Using mock data for attractions');
    }
  };

  const types = ['all', 'Danh lam thắng cảnh', 'Nhà hàng', 'Mua sắm', 'Giải trí', 'Văn hóa'];

  const filteredAttractions = selectedType === 'all'
    ? attractions
    : attractions.filter(attr => attr.type === selectedType);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className="editorial-hero">
        <div className="editorial-hero-content">
          <h1 className="display-lg">Khám Phá Địa Điểm</h1>
          <p className="body-lg">
            Những điểm đến tuyệt vời xung quanh khách sạn, từ danh lam thắng cảnh đến ẩm thực địa phương
          </p>
        </div>
      </section>

      <div className="editorial-container">
        {/* Filter */}
        <div className="editorial-filter">
          {types.map(type => (
            <button
              key={type}
              className={`editorial-filter-btn ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {type === 'all' ? 'Tất cả' : type}
            </button>
          ))}
        </div>

        {/* Attractions Grid */}
        {loading ? (
          <div className="editorial-loading">
            <div className="editorial-spinner"></div>
            <p className="body-md" style={{ color: 'var(--clr-on-surface-variant)' }}>
              Đang tải địa điểm...
            </p>
          </div>
        ) : (
          <div className="editorial-grid">
            {filteredAttractions.map(attraction => (
              <div key={attraction.id} className={styles.attractionCard}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={attraction.imageUrl} 
                    alt={attraction.name}
                    className="editorial-image"
                  />
                  <div className={styles.typeBadge}>{attraction.type}</div>
                  {attraction.rating && (
                    <div className={styles.ratingBadge}>
                      ⭐ {attraction.rating}
                    </div>
                  )}
                </div>
                <div className={styles.content}>
                  <h3 className="headline-md" style={{ marginBottom: 'var(--sp-3)', color: 'var(--clr-on-surface)' }}>
                    {attraction.name}
                  </h3>
                  <p className="body-md" style={{ color: 'var(--clr-on-surface-variant)', marginBottom: 'var(--sp-6)', lineHeight: '1.6' }}>
                    {attraction.description}
                  </p>
                  <div className={styles.details}>
                    <div className={styles.detailItem}>
                      <span className={styles.icon}>📍</span>
                      <span>{attraction.address}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.icon}>🚗</span>
                      <span>{attraction.distance} km từ khách sạn</span>
                    </div>
                    {attraction.openingHours && (
                      <div className={styles.detailItem}>
                        <span className={styles.icon}>🕐</span>
                        <span>{attraction.openingHours}</span>
                      </div>
                    )}
                    {attraction.priceRange && (
                      <div className={styles.detailItem}>
                        <span className={styles.icon}>💰</span>
                        <span>{attraction.priceRange}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="editorial-btn-primary"
                    style={{ width: '100%', marginTop: 'var(--sp-6)' }}
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.address)}`, '_blank')}
                  >
                    📍 Xem trên bản đồ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttractionsPage;
