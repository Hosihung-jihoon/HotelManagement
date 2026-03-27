import React from 'react';
import './MembershipsPage.css';

const MembershipsPage = () => {
  return (
    <div className="memberships-container anim-fade-in">
      <header className="memberships-header">
        <h1>Chương Trình Hội Viên 💎</h1>
        <p>Giới thiệu đặc quyền dành riêng cho khách hàng thân thiết. Nâng tầm trải nghiệm nghỉ dưỡng của bạn.</p>
      </header>

      <div className="tiers-grid">
        {/* Silver Tier */}
        <div className="tier-card silver">
          <div className="tier-header">
            <h3>Silver Member</h3>
            <div className="tier-icon">🥈</div>
          </div>
          <div className="tier-points">
            <span>Yêu cầu: </span>
            <strong>0 - 9,999 điểm</strong>
          </div>
          <p className="tier-desc">Hạng thẻ khởi đầu dành cho khách hàng mới với nhiều ưu đãi cơ bản.</p>
          <ul className="benefits-list">
            <li><span>✓</span> Tích lũy 1 điểm cho mỗi 100,000đ chi tiêu</li>
            <li><span>✓</span> Ưu đãi 5% khi đặt phòng trực tiếp</li>
            <li><span>✓</span> Miễn phí nước suối và minibar cơ bản</li>
            <li className="disabled"><span>✗</span> Trả phòng trễ lúc 14:00</li>
            <li className="disabled"><span>✗</span> Nâng cấp hạng phòng miễn phí</li>
          </ul>
          <button className="btn-tier silver-btn">Xem Chi Tiết</button>
        </div>

        {/* Gold Tier */}
        <div className="tier-card gold popular">
          <div className="popular-badge">Phổ Biến Nhất</div>
          <div className="tier-header">
            <h3>Gold Member</h3>
            <div className="tier-icon">🥇</div>
          </div>
          <div className="tier-points">
            <span>Yêu cầu: </span>
            <strong>10,000 - 49,999 điểm</strong>
          </div>
          <p className="tier-desc">Tận hưởng kỳ nghỉ trọn vẹn hơn với các dịch vụ chuyên biệt hạng Vàng.</p>
          <ul className="benefits-list">
            <li><span>✓</span> Tích lũy 1.5 điểm cho mỗi 100,000đ chi tiêu</li>
            <li><span>✓</span> Ưu đãi 10% khi đặt phòng trực tiếp</li>
            <li><span>✓</span> Quyền lợi Silver Member</li>
            <li><span>✓</span> Trả phòng trễ lúc 14:00 (Tùy tình trạng phòng)</li>
            <li><span>✓</span> Ưu đãi 15% dịch vụ Spa & F&B</li>
            <li className="disabled"><span>✗</span> Nâng cấp hạng phòng miễn phí</li>
          </ul>
          <button className="btn-tier gold-btn">Xem Chi Tiết</button>
        </div>

        {/* Platinum Tier */}
        <div className="tier-card platinum">
          <div className="tier-header">
            <h3>Platinum Member</h3>
            <div className="tier-icon">💎</div>
          </div>
          <div className="tier-points">
            <span>Yêu cầu: </span>
            <strong>50,000+ điểm</strong>
          </div>
          <p className="tier-desc">Đẳng cấp nghỉ dưỡng hoàng gia với quyền lợi tối đa và phục vụ cá nhân hóa.</p>
          <ul className="benefits-list">
            <li><span>✓</span> Tích lũy 2 điểm cho mỗi 100,000đ chi tiêu</li>
            <li><span>✓</span> Ưu đãi 20% khi đặt phòng trực tiếp</li>
            <li><span>✓</span> Quyền lợi Gold Member</li>
            <li><span>✓</span> Đảm bảo trả phòng trễ lúc 16:00</li>
            <li><span>✓</span> Ưu đãi 25% dịch vụ Spa & F&B</li>
            <li><span>✓</span> Nâng cấp hạng phòng tự động lên Suite (Tùy tình trạng)</li>
            <li><span>✓</span> Dịch vụ đưa đón sân bay bằng xe Limousine</li>
          </ul>
          <button className="btn-tier platinum-btn">Xem Chi Tiết</button>
        </div>
      </div>
    </div>
  );
};

export default MembershipsPage;
