import { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';
import './MembershipPage.css';
import { Award, Star, CheckCircle, Shield, ArrowRight } from 'lucide-react';

function MembershipPage() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ideally we fetch from an API like /api/Memberships/tiers
    // Since we might not have it yet, we'll mock some data
    const fetchTiers = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/Memberships');
        const apiData = res.data?.items || res.data || [];
        
        const mappedData = apiData.map(tier => {
          let color = '#94a3b8'; // Default silver
          
          if (tier.tierName.toLowerCase().includes('gold')) {
            color = '#eab308';
          } else if (tier.tierName.toLowerCase().includes('platinum')) {
            color = '#0f172a';
          }
          
          let benefits = [];
          if (tier.amenities) {
            benefits.push(...tier.amenities.split(',').map(s => s.trim()).filter(s => s));
          }
          if (tier.services) {
            benefits.push(...tier.services.split(',').map(s => s.trim()).filter(s => s));
          }
          
          if (benefits.length === 0) {
             benefits = ['Giảm giá phòng', 'Ưu tiên hỗ trợ'];
          }

          return {
            id: tier.id,
            tierName: tier.tierName,
            minPoints: tier.minPoints || 0,
            discountPercent: tier.discountPercent || 0,
            benefits: benefits,
            color: color
          };
        });

        // Sort by minPoints
        mappedData.sort((a, b) => a.minPoints - b.minPoints);
        
        setMemberships(mappedData);
      } catch (err) {
        console.error("Failed to load membership tiers", err);
        // Fallback mock
        setMemberships([
          { id: 1, tierName: 'Silver', minPoints: 0, discountPercent: 5, benefits: ['Giảm 5% giá phòng', 'Ưu tiên check-in', 'Miễn phí đồ uống chào mừng'], color: '#94a3b8' },
          { id: 2, tierName: 'Gold', minPoints: 1000, discountPercent: 10, benefits: ['Giảm 10% giá phòng', 'Nâng cấp phòng miễn phí (nếu còn)', 'Trả phòng trễ đến 14:00', 'Tích lũy điểm x1.5'], color: '#eab308' },
          { id: 3, tierName: 'Platinum', minPoints: 5000, discountPercent: 15, benefits: ['Giảm 15% giá phòng', 'Dịch vụ đưa đón sân bay miễn phí', 'Bữa sáng miễn phí hàng ngày', 'Trả phòng trễ đến 16:00', 'Tích lũy điểm x2'], color: '#0f172a' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTiers();
  }, []);

  if (loading) {
    return (
      <div className="membership-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin hạng thành viên...</p>
      </div>
    );
  }

  return (
    <div className="membership-page">
      <div className="membership-hero">
        <div className="membership-hero-content">
          <h1>Chương Trình Khách Hàng Thân Thiết</h1>
          <p>Tham gia chương trình thẻ thành viên của chúng tôi để nhận những đặc quyền dành riêng cho bạn và tận hưởng kỳ nghỉ trọn vẹn hơn bao giờ hết.</p>
        </div>
      </div>

      <div className="membership-benefits-section">
        <h2>Vì sao nên trở thành thành viên?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <Star className="benefit-icon" />
            <h3>Tích Điểm Dễ Dàng</h3>
            <p>Nhận điểm thưởng cho mỗi đêm lưu trú và các dịch vụ sử dụng tại khách sạn.</p>
          </div>
          <div className="benefit-card">
            <Shield className="benefit-icon" />
            <h3>Đặc Quyền Riêng Biệt</h3>
            <p>Trải nghiệm dịch vụ cá nhân hóa và các ưu đãi không công khai.</p>
          </div>
          <div className="benefit-card">
            <CheckCircle className="benefit-icon" />
            <h3>Linh Hoạt Quy Đổi</h3>
            <p>Dùng điểm thưởng để đổi đêm nghỉ miễn phí, nâng cấp phòng hoặc dịch vụ spa.</p>
          </div>
        </div>
      </div>

      <div className="membership-tiers-section">
        <h2>Các Hạng Thành Viên</h2>
        <div className="tiers-container">
          {memberships.map((tier, index) => (
            <div className={`tier-card ${tier.tierName.toLowerCase()}`} key={tier.id}>
              <div className="tier-header" style={{ borderColor: tier.color }}>
                <Award className="tier-icon" style={{ color: tier.color }} size={48} />
                <h3 style={{ color: tier.color }}>{tier.tierName}</h3>
                <div className="tier-points">{tier.minPoints.toLocaleString()} Điểm</div>
              </div>
              <div className="tier-discount">
                <span className="discount-value">{tier.discountPercent}%</span>
                <span className="discount-label">Giảm giá đặt phòng</span>
              </div>
              <ul className="tier-features">
                {tier.benefits.map((benefit, i) => (
                  <li key={i}>
                    <CheckCircle size={16} className="check-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-join-tier" style={{ backgroundColor: tier.color }}>
                Đăng Ký Ngay <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="membership-faq">
        <h2>Câu Hỏi Thường Gặp</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h4>Làm thế nào để tôi có thể nâng hạng?</h4>
            <p>Hạng của bạn sẽ tự động nâng cấp ngay khi bạn tích lũy đủ số điểm yêu cầu cho hạng tiếp theo trong vòng 12 tháng.</p>
          </div>
          <div className="faq-item">
            <h4>Điểm thưởng có hết hạn không?</h4>
            <p>Điểm thưởng có giá trị trong vòng 24 tháng kể từ ngày tích lũy cuối cùng của bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembershipPage;
