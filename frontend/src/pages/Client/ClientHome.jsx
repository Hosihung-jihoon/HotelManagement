import { Link } from 'react-router-dom';
import ReviewsSection from '../../components/Client/ReviewsSection';
import './ClientHome.css';

function ClientHome() {
  return (
    <div className="client-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1542314831-c6a4d14d885f?auto=format&fit=crop&q=80&w=2000" 
            alt="L'Horizon Luxury Hotel View" 
            className="hero-image"
          />
        </div>
        <div className="hero-content">
          <h1 className="display-lg">The Atmospheric<br/>Horizon</h1>
          <p className="body-lg">
            Nơi ranh giới giữa biển cả và bầu trời tan biến. Trải nghiệm nghệ thuật lưu trú thượng lưu với không gian được thiết kế tinh tế đến từng chi tiết.
          </p>
          <div className="hero-actions">
            <Link to="/attractions" className="btn-primary">Khám phá ngay</Link>
            <Link to="/contact" className="btn-secondary">Tư vấn đặt phòng</Link>
          </div>
        </div>
      </section>

      {/* Intro Section - Asymmetrical */}
      <section className="intro-section">
        <div className="intro-container">
          <div className="intro-text">
            <h2 className="headline-lg">Hơi Thở Của<br/>Đại Dương</h2>
            <p className="body-lg">
              Mỗi căn phòng tại L'Horizon không chỉ là một điểm dừng chân, mà là một tác phẩm nghệ thuật. Chúng tôi xóa nhòa khoảng cách giữa thiên nhiên và kiến trúc, mang đến một không gian mở, đón trọn ánh sáng tự nhiên và luồng gió biển tinh khiết.
            </p>
            <Link to="/news" className="btn-tertiary">Đọc thêm về kiến trúc của chúng tôi</Link>
          </div>
          <div className="intro-image-container">
            <img 
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200" 
              alt="Luxury Room Interior" 
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />
      
    </div>
  );
}

export default ClientHome;
