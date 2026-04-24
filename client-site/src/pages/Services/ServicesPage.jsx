import { useState } from 'react';
import './ServicesPage.css';

const SERVICES = [
  {
    id: 1,
    category: 'Spa & Wellness',
    icon: '✦',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accent: '#764ba2',
    items: [
      {
        name: 'Signature Deep Tissue Massage',
        description: 'Liệu pháp massage chuyên sâu theo kỹ thuật Đông - Tây kết hợp, giải phóng căng thẳng từ sâu trong cơ bắp.',
        duration: '90 phút',
        price: '1.200.000',
        tag: 'Bestseller',
      },
      {
        name: 'Himalayan Salt Stone Therapy',
        description: 'Đá muối Himalaya được nung nóng chạm vào từng điểm kinh lạc, mang lại cảm giác thư giãn tuyệt đối.',
        duration: '60 phút',
        price: '950.000',
        tag: 'Premium',
      },
      {
        name: 'Facial Luminance Ritual',
        description: 'Quy trình chăm sóc da mặt cao cấp với serum vàng 24K và mặt nạ Retinol, phục hồi vẻ rạng rỡ tức thì.',
        duration: '75 phút',
        price: '1.500.000',
        tag: 'New',
      },
    ],
  },
  {
    id: 2,
    category: 'Food & Beverage',
    icon: '◈',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: '#f5576c',
    items: [
      {
        name: 'Chef\'s Table Experience',
        description: 'Bữa tối riêng tư với Bếp trưởng 5 sao tại bàn đặc biệt ngay trong bếp nhà hàng, thực đơn 7 món.',
        duration: '3 giờ',
        price: '4.500.000',
        tag: 'Exclusive',
      },
      {
        name: 'Afternoon High Tea',
        description: 'Trà chiều kiểu Anh với bánh ngọt, scone và bánh mì finger sandwich theo phong cách thượng lưu.',
        duration: '2 giờ',
        price: '850.000',
        tag: 'Popular',
      },
      {
        name: 'Mixology Masterclass',
        description: 'Học pha chế cocktail cùng chuyên gia bartender, mang về bí quyết pha 3 loại cocktail thủ công.',
        duration: '90 phút',
        price: '1.200.000',
        tag: null,
      },
    ],
  },
  {
    id: 3,
    category: 'Concierge & Lifestyle',
    icon: '◇',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    accent: '#00c2fe',
    items: [
      {
        name: 'Private City Tour',
        description: 'Xe limousine riêng đưa đón, hướng dẫn viên cá nhân dẫn thăm những điểm ẩn của thành phố.',
        duration: '5 giờ',
        price: '5.800.000',
        tag: 'Premium',
      },
      {
        name: 'Airport VIP Transfer',
        description: 'Đón tiễn sân bay hạng thương gia với xe Maybach/Bentley, nước uống và khăn lạnh chào mừng.',
        duration: 'Linh hoạt',
        price: '2.200.000',
        tag: null,
      },
      {
        name: 'Personal Shopping Assistant',
        description: 'Chuyên gia thời trang cá nhân đồng hành mua sắm tại các trung tâm thương mại cao cấp.',
        duration: '4 giờ',
        price: '3.500.000',
        tag: 'New',
      },
    ],
  },
  {
    id: 4,
    category: 'Fitness & Recreation',
    icon: '◉',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    accent: '#38e8c4',
    items: [
      {
        name: 'Personal Training Session',
        description: 'Huấn luyện viên cá nhân được chứng nhận quốc tế xây dựng chương trình tập phù hợp mục tiêu.',
        duration: '60 phút',
        price: '800.000',
        tag: 'Popular',
      },
      {
        name: 'Rooftop Yoga & Meditation',
        description: 'Yoga trên sân thượng ngắm toàn cảnh thành phố lúc bình minh, kết hợp thiền định chánh niệm.',
        duration: '75 phút',
        price: '650.000',
        tag: null,
      },
      {
        name: 'Infinity Pool Private Hour',
        description: 'Đặt riêng hồ bơi vô cực trên tầng thượng trọn 1 tiếng, bao gồm butler phục vụ đồ uống.',
        duration: '60 phút',
        price: '1.800.000',
        tag: 'Exclusive',
      },
    ],
  },
];

const TAG_STYLES = {
  Bestseller: { bg: '#fef3c7', color: '#92400e' },
  Premium: { bg: '#ede9fe', color: '#5b21b6' },
  New: { bg: '#d1fae5', color: '#065f46' },
  Exclusive: { bg: '#fee2e2', color: '#991b1b' },
  Popular: { bg: '#dbeafe', color: '#1e40af' },
};

function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [inquiryItem, setInquiryItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', phone: '', date: '', note: '',
    duration: 'Linh hoạt', budget: 'Tùy chọn'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Giả lập gọi API
    setTimeout(() => {
      alert('Yêu cầu của bạn đã được gửi thành công. Đội ngũ của chúng tôi sẽ liên hệ sớm nhất!');
      setInquiryItem(null);
      setIsSubmitting(false);
      setFormData({ name: '', phone: '', date: '', note: '', duration: 'Linh hoạt', budget: 'Tùy chọn' });
    }, 800);
  };

  const filtered = activeCategory === 'all'
    ? SERVICES
    : SERVICES.filter(s => s.id === parseInt(activeCategory));

  return (
    <div className="svc-page">
      {/* ── Hero ── */}
      <section className="svc-hero">
        <div className="svc-hero-bg" />
        <div className="svc-hero-content">
          <p className="svc-hero-label">CURATED EXPERIENCES</p>
          <h1 className="svc-hero-title">
            Our <span className="svc-hero-accent">Services</span>
          </h1>
          <p className="svc-hero-sub">
            Từng trải nghiệm được chắt lọc kỳ công — để mỗi khoảnh khắc tại đây
            trở thành ký ức không thể quên.
          </p>
        </div>
        <div className="svc-hero-scroll">
          <span>Khám phá</span>
          <div className="svc-scroll-line" />
        </div>
      </section>

      {/* ── Filter Tabs ── */}
      <section className="svc-filter-section">
        <div className="svc-filter-inner">
          <button
            className={`svc-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Tất cả dịch vụ
          </button>
          {SERVICES.map(s => (
            <button
              key={s.id}
              className={`svc-filter-btn ${activeCategory === String(s.id) ? 'active' : ''}`}
              onClick={() => setActiveCategory(String(s.id))}
            >
              {s.category}
            </button>
          ))}
        </div>
      </section>

      {/* ── Service Categories ── */}
      <main className="svc-main">
        {filtered.map(category => (
          <div key={category.id} className="svc-category-block">
            {/* Category Header with Image */}
            <div className="svc-cat-header-with-image">
              <div className="svc-cat-image-wrapper">
                <img 
                  src={
                    category.id === 1 ? '/src/assets/svc_spa.png' :
                    category.id === 2 ? '/src/assets/svc_fb.png' :
                    category.id === 3 ? '/src/assets/svc_concierge.png' :
                    '/src/assets/svc_fitness.png'
                  }
                  alt={category.category} 
                  className="svc-cat-image" 
                />
              </div>
              <div className="svc-cat-header-content">
                <div className="svc-cat-icon" style={{ background: category.gradient }}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="svc-cat-title">{category.category}</h2>
                  <p className="svc-cat-sub">{category.items.length} dịch vụ đặc quyền</p>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="svc-cards-grid">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`svc-card ${hoveredCard === `${category.id}-${idx}` ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredCard(`${category.id}-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Top accent bar */}
                  <div className="svc-card-accent-bar" style={{ background: category.gradient }} />

                  <div className="svc-card-body">
                    <div className="svc-card-top">
                      <h3 className="svc-card-name">{item.name}</h3>
                      {item.tag && (
                        <span
                          className="svc-card-tag"
                          style={{
                            background: TAG_STYLES[item.tag]?.bg,
                            color: TAG_STYLES[item.tag]?.color,
                          }}
                        >
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <p className="svc-card-desc">{item.description}</p>

                    <div className="svc-card-meta">
                      <div className="svc-meta-item">
                        <span className="svc-meta-icon">◷</span>
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    <div className="svc-card-footer">
                      <div className="svc-card-price">
                        <span className="svc-price-label">Từ</span>
                        <span className="svc-price-amount">{item.price}</span>
                        <span className="svc-price-currency">₫</span>
                      </div>
                      <button
                        className="svc-book-btn"
                        style={{ '--accent': category.accent }}
                        onClick={() => setInquiryItem({ ...item, category: category.category })}
                      >
                        Đặt ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* ── CTA Banner ── */}
      <section className="svc-cta-section">
        <div className="svc-cta-inner">
          <p className="svc-cta-label">LIÊN HỆ CHÚNG TÔI</p>
          <h2 className="svc-cta-title">Bạn cần một trải nghiệm riêng?</h2>
          <p className="svc-cta-sub">
            Đội ngũ Concierge của chúng tôi luôn sẵn sàng thiết kế gói dịch vụ
            hoàn toàn cá nhân hoá theo yêu cầu của bạn.
          </p>
          <button 
            className="svc-cta-btn"
            onClick={() => setInquiryItem({
              category: 'Dịch vụ đặc biệt',
              name: 'Liên hệ Concierge',
              description: 'Gửi yêu cầu thiết kế trải nghiệm cá nhân hoá. Đội ngũ của chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.',
              duration: 'Linh hoạt',
              price: 'Tùy chọn'
            })}
          >
            Liên hệ Concierge →
          </button>
        </div>
      </section>

      {/* ── Inquiry Modal ── */}
      {inquiryItem && (
        <div className="svc-modal-overlay" onClick={() => setInquiryItem(null)}>
          <div className="svc-modal" onClick={e => e.stopPropagation()}>
            <button className="svc-modal-close" onClick={() => setInquiryItem(null)}>×</button>
            <p className="svc-modal-cat">{inquiryItem.category}</p>
            <h3 className="svc-modal-title">{inquiryItem.name}</h3>
            <p className="svc-modal-desc">{inquiryItem.description}</p>
            <div className="svc-modal-info">
              <div>
                <span className="svc-modal-label">Thời gian</span>
                {inquiryItem.duration === 'Linh hoạt' ? (
                  <input 
                    type="text"
                    className="svc-modal-value"
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ddd', outline: 'none', padding: '2px 0', fontFamily: 'inherit', color: '#1a1a1a', fontWeight: 'bold', fontSize: '1.1rem', width: '100%' }}
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    placeholder="Nhập thời gian..."
                  />
                ) : (
                  <span className="svc-modal-value">{inquiryItem.duration}</span>
                )}
              </div>
              <div>
                <span className="svc-modal-label">Giá từ / Ngân sách</span>
                {inquiryItem.price === 'Tùy chọn' ? (
                  <input 
                    type="text"
                    className="svc-modal-value"
                    style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ddd', outline: 'none', padding: '2px 0', fontFamily: 'inherit', color: '#1a1a1a', fontWeight: 'bold', fontSize: '1.1rem', width: '100%' }}
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    placeholder="Nhập ngân sách..."
                  />
                ) : (
                  <span className="svc-modal-value">
                    {inquiryItem.price} ₫
                  </span>
                )}
              </div>
            </div>
            <form className="svc-modal-form" onSubmit={handleSubmit}>
              <input 
                required 
                type="text" 
                placeholder="Họ và tên" 
                className="svc-modal-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <input 
                required 
                type="tel" 
                placeholder="Số điện thoại" 
                className="svc-modal-input" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
              <input 
                required 
                type="date" 
                className="svc-modal-input" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
              />
              <textarea 
                placeholder="Yêu cầu đặc biệt..." 
                className="svc-modal-textarea" 
                rows={3} 
                value={formData.note} 
                onChange={e => setFormData({...formData, note: e.target.value})} 
              />
              <button 
                type="submit" 
                className="svc-modal-confirm"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }}
              >
                {isSubmitting ? 'Đang gửi yêu cầu...' : 'Xác nhận đặt dịch vụ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesPage;
