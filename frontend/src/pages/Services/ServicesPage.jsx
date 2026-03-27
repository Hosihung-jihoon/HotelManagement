import React from 'react';
import './ServicesPage.css';

const ServicesPage = () => {
  return (
    <div className="services-container anim-fade-in">
      <header className="services-header">
        <h1>Dịch Vụ Nổi Bật 🌟</h1>
        <p>Khám phá các dịch vụ Spa chăm sóc sức khỏe và Ẩm thực F&B đẳng cấp tại khách sạn.</p>
      </header>

      <div className="services-grid">
        {/* Spa Service Card */}
        <div className="service-card">
          <div className="service-image">
            <img src="/spa_service.png" alt="Spa & Wellness" />
            <div className="service-badge">Thư Giãn</div>
          </div>
          <div className="service-content">
            <h2>Lotus Spa & Wellness</h2>
            <p className="service-desc">Trải nghiệm không gian thư giãn tuyệt đối với các liệu trình massage, chăm sóc da mặt và xông hơi thảo dược chuẩn 5 sao. Phục hồi năng lượng sau những ngày làm việc căng thẳng.</p>
            
            <div className="service-features">
              <span className="feature">🌿 Massage trị liệu</span>
              <span className="feature">🧖‍♀️ Xông hơi đá muối</span>
              <span className="feature">💆‍♀️ Chăm sóc da chuyên sâu</span>
            </div>

            <div className="service-footer">
              <div className="service-price">
                <span>Chỉ từ</span>
                <strong>800,000 đ</strong>
              </div>
              <button className="btn-book">Quản lý dịch vụ</button>
            </div>
          </div>
        </div>

        {/* F&B Service Card */}
        <div className="service-card">
          <div className="service-image">
            <img src="/fnb_service.png" alt="F&B Restaurant" />
            <div className="service-badge fnb-badge">Ẩm Thực</div>
          </div>
          <div className="service-content">
            <h2>Lumina Fine Dining</h2>
            <p className="service-desc">Thưởng thức tinh hoa ẩm thực Á - Âu được chế biến từ những đầu bếp trứ danh. Không gian sang trọng, lãng mạn cùng với hầm rượu vang hảo hạng đang chờ đón bạn.</p>
            
            <div className="service-features">
              <span className="feature">🍷 Rượu vang hảo hạng</span>
              <span className="feature">🥩 Bò Wagyu A5</span>
              <span className="feature">🎻 Nhạc hòa tấu trực tiếp</span>
            </div>

            <div className="service-footer">
              <div className="service-price">
                <span>Buffet tối từ</span>
                <strong>1,500,000 đ</strong>
              </div>
              <button className="btn-book">Quản lý dịch vụ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
