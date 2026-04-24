import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MembershipsPage.css';

const TIERS = [
  {
    id: 'silver',
    name: 'Silver',
    nameVi: 'Bạc',
    tagline: 'Bước đầu của hành trình',
    price: '1.200.000',
    priceNote: '/ năm',
    gradient: 'linear-gradient(135deg, #8e9eab 0%, #bdc3c7 50%, #a8b8c0 100%)',
    textGrad: 'linear-gradient(135deg, #8e9eab, #bdc3c7)',
    glowColor: 'rgba(142, 158, 171, 0.35)',
    icon: '◈',
    featured: false,
    nights: '0',
    discount: '10%',
    points: '1x',
    benefits: [
      { label: 'Giảm giá phòng', value: '10%', included: true },
      { label: 'Điểm thưởng tích lũy', value: '1x', included: true },
      { label: 'Late checkout (12:00)', value: '', included: true },
      { label: 'Nước chào mừng phòng', value: '', included: true },
      { label: 'Ưu tiên check-in', value: '', included: false },
      { label: 'Đêm miễn phí hàng năm', value: '0 đêm', included: false },
      { label: 'Phòng nâng hạng miễn phí', value: '', included: false },
      { label: 'Spa Credit hàng năm', value: '', included: false },
      { label: 'Concierge cá nhân 24/7', value: '', included: false },
      { label: 'F&B Credit hàng tháng', value: '', included: false },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    nameVi: 'Vàng',
    tagline: 'Trải nghiệm vượt mong đợi',
    price: '3.800.000',
    priceNote: '/ năm',
    gradient: 'linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #daa520 100%)',
    textGrad: 'linear-gradient(135deg, #b8860b, #ffd700)',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    icon: '◆',
    featured: false,
    nights: '2',
    discount: '20%',
    points: '2x',
    benefits: [
      { label: 'Giảm giá phòng', value: '20%', included: true },
      { label: 'Điểm thưởng tích lũy', value: '2x', included: true },
      { label: 'Late checkout (14:00)', value: '', included: true },
      { label: 'Nước chào mừng & trái cây', value: '', included: true },
      { label: 'Ưu tiên check-in', value: '', included: true },
      { label: 'Đêm miễn phí hàng năm', value: '2 đêm', included: true },
      { label: 'Phòng nâng hạng miễn phí', value: '', included: false },
      { label: 'Spa Credit hàng năm', value: '', included: false },
      { label: 'Concierge cá nhân 24/7', value: '', included: false },
      { label: 'F&B Credit hàng tháng', value: '', included: false },
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    nameVi: 'Bạch Kim',
    tagline: 'Đỉnh cao của sự xa xỉ',
    price: '9.600.000',
    priceNote: '/ năm',
    gradient: 'linear-gradient(135deg, #00193c 0%, #003d80 50%, #002d62 100%)',
    textGrad: 'linear-gradient(135deg, #cee5ff, #7eb8ff)',
    glowColor: 'rgba(0, 45, 98, 0.4)',
    icon: '✦',
    featured: true,
    nights: '5',
    discount: '35%',
    points: '5x',
    benefits: [
      { label: 'Giảm giá phòng', value: '35%', included: true },
      { label: 'Điểm thưởng tích lũy', value: '5x', included: true },
      { label: 'Late checkout (18:00)', value: '', included: true },
      { label: 'Bánh & Champagne chào mừng', value: '', included: true },
      { label: 'Ưu tiên check-in Express', value: '', included: true },
      { label: 'Đêm miễn phí hàng năm', value: '5 đêm', included: true },
      { label: 'Phòng nâng hạng miễn phí', value: '', included: true },
      { label: 'Spa Credit hàng năm', value: '3.000.000 ₫', included: true },
      { label: 'Concierge cá nhân 24/7', value: '', included: true },
      { label: 'F&B Credit hàng tháng', value: '500.000 ₫', included: true },
    ],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameVi: 'Kim Cương',
    tagline: 'Không giới hạn — chỉ dành riêng cho bạn',
    price: 'Liên hệ',
    priceNote: 'Mời riêng',
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 40%, #0f3460 80%, #533483 100%)',
    textGrad: 'linear-gradient(135deg, #e0aaff, #c77dff)',
    glowColor: 'rgba(83, 52, 131, 0.45)',
    icon: '❋',
    featured: false,
    nights: 'Không giới hạn',
    discount: '50%',
    points: '10x',
    benefits: [
      { label: 'Giảm giá phòng', value: '50%', included: true },
      { label: 'Điểm thưởng tích lũy', value: '10x', included: true },
      { label: 'Checkout linh hoạt toàn quyền', value: '', included: true },
      { label: 'Butler riêng + Chef cá nhân', value: '', included: true },
      { label: 'Dedicated Check-in Suite', value: '', included: true },
      { label: 'Đêm miễn phí', value: 'Không giới hạn', included: true },
      { label: 'Suite nâng hạng khi có phòng', value: '', included: true },
      { label: 'Spa Credit hàng năm', value: '10.000.000 ₫', included: true },
      { label: 'Concierge cá nhân 24/7', value: 'Dedicated', included: true },
      { label: 'F&B Credit hàng tháng', value: '2.000.000 ₫', included: true },
    ],
  },
];

const PERKS = [
  { icon: '◎', title: 'Điểm tích lũy không hết hạn', desc: 'Điểm thưởng được tích lũy suốt đời, không bao giờ mất hiệu lực.' },
  { icon: '◈', title: 'Ưu đãi sinh nhật đặc biệt', desc: 'Gói quà & đêm miễn phí tặng riêng vào tháng sinh nhật của bạn.' },
  { icon: '◆', title: 'Quyền ưu tiên đặt phòng', desc: 'Tiếp cận phòng mới, gói đặc biệt trước 48h so với khách thường.' },
  { icon: '✦', title: 'Trải nghiệm độc quyền', desc: 'Tham gia sự kiện riêng, wine tasting, gặp gỡ bếp trưởng nổi tiếng.' },
];

function MembershipsPage() {
  const [selectedTier, setSelectedTier] = useState('platinum');
  const [billingYearly] = useState(true);
  const [hoveredPerk, setHoveredPerk] = useState(null);
  const navigate = useNavigate();

  const activeTier = TIERS.find(t => t.id === selectedTier);

  return (
    <div className="mem-page">

      {/* ── Hero ── */}
      <section className="mem-hero">
        <div className="mem-hero-bg">
          <img src="/src/assets/mem_hero.png" alt="Luxury Members Club" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
          <div className="mem-hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface, #f7fafc), transparent 50%)' }} />
        </div>
        <div className="mem-hero-content">
          <span className="mem-hero-badge">MEMBERSHIP PROGRAM</span>
          <h1 className="mem-hero-title">
            Hạng Thành Viên
            <br />
            <span className="mem-hero-gradient-text">Dành Cho Bạn</span>
          </h1>
          <p className="mem-hero-sub">
            Trở thành thành viên và mở ra thế giới đặc quyền — từ đêm nghỉ miễn phí,
            ưu đãi độc quyền đến dịch vụ cá nhân hóa hoàn toàn theo phong cách sống của bạn.
          </p>
          <div className="mem-hero-stats">
            <div className="mem-stat-item">
              <span className="mem-stat-num">12,000+</span>
              <span className="mem-stat-label">Thành viên</span>
            </div>
            <div className="mem-stat-divider" />
            <div className="mem-stat-item">
              <span className="mem-stat-num">4</span>
              <span className="mem-stat-label">Hạng thành viên</span>
            </div>
            <div className="mem-stat-divider" />
            <div className="mem-stat-item">
              <span className="mem-stat-num">50+</span>
              <span className="mem-stat-label">Đặc quyền độc quyền</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tier Selector ── */}
      <section className="mem-selector-section">
        <div className="mem-selector-inner">
          <p className="mem-selector-label">CHỌN HẠNG THÀNH VIÊN</p>
          <div className="mem-tier-tabs">
            {TIERS.map(tier => (
              <button
                key={tier.id}
                className={`mem-tier-tab ${selectedTier === tier.id ? 'active' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
                style={selectedTier === tier.id ? {
                  background: tier.gradient,
                  boxShadow: `0 6px 24px ${tier.glowColor}`,
                } : {}}
              >
                <span className="mem-tab-icon">{tier.icon}</span>
                <span className="mem-tab-name">{tier.name}</span>
                {tier.featured && <span className="mem-tab-badge">Phổ biến</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Active Tier Detail ── */}
      {activeTier && (
        <section className="mem-detail-section">
          <div className="mem-detail-hero" style={{ background: activeTier.gradient }}>
            <div className="mem-detail-glow" style={{ background: `radial-gradient(circle, ${activeTier.glowColor} 0%, transparent 70%)` }} />
            <div className="mem-detail-hero-inner">
              <div className="mem-detail-left">
                <span className="mem-detail-icon">{activeTier.icon}</span>
                <div>
                  <p className="mem-detail-tier-label">HẠNG THÀNH VIÊN</p>
                  <h2 className="mem-detail-name">{activeTier.name}</h2>
                  <p className="mem-detail-tagline">{activeTier.tagline}</p>
                </div>
              </div>
              <div className="mem-detail-right">
                {activeTier.price === 'Liên hệ' ? (
                  <div className="mem-detail-price-invite">
                    <span>Chỉ theo lời mời</span>
                  </div>
                ) : (
                  <>
                    <span className="mem-detail-price">{activeTier.price} ₫</span>
                    <span className="mem-detail-price-note">{activeTier.priceNote}</span>
                  </>
                )}
              </div>
            </div>

            {/* Key Highlights */}
            <div className="mem-highlights">
              <div className="mem-highlight-item">
                <span className="mem-hl-num">{activeTier.discount}</span>
                <span className="mem-hl-label">Giảm giá phòng</span>
              </div>
              <div className="mem-hl-divider" />
              <div className="mem-highlight-item">
                <span className="mem-hl-num">{activeTier.nights}</span>
                <span className="mem-hl-label">Đêm miễn phí / năm</span>
              </div>
              <div className="mem-hl-divider" />
              <div className="mem-highlight-item">
                <span className="mem-hl-num">{activeTier.points}</span>
                <span className="mem-hl-label">Nhân điểm thưởng</span>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="mem-benefits-section">
            <h3 className="mem-benefits-title">Toàn bộ quyền lợi</h3>
            <div className="mem-benefits-grid">
              {activeTier.benefits.map((b, i) => (
                <div key={i} className={`mem-benefit-row ${b.included ? 'included' : 'excluded'}`}>
                  <span className="mem-benefit-check">{b.included ? '✓' : '—'}</span>
                  <span className="mem-benefit-label">{b.label}</span>
                  {b.value && <span className="mem-benefit-value">{b.value}</span>}
                </div>
              ))}
            </div>

            {/* CTA */}
          <div className="mem-benefits-cta">
              {activeTier.price === 'Liên hệ' ? (
                <button 
                  className="mem-btn-invite" 
                  style={{ background: activeTier.gradient }}
                  onClick={() => alert('Vui lòng liên hệ hotline 1800-xxxx để được hỗ trợ đăng ký hạng Diamond.')}
                >
                  Yêu cầu lời mời →
                </button>
              ) : (
                <>
                  <button 
                    className="mem-btn-join" 
                    style={{ background: activeTier.gradient }}
                    onClick={() => navigate('/login')}
                  >
                    Đăng ký {activeTier.name} ngay
                  </button>
                  <p className="mem-cta-note">Không tự động gia hạn • Hủy bất cứ lúc nào</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── All Plans Comparison Table ── */}
      <section className="mem-compare-section">
        <div className="mem-compare-inner">
          <p className="mem-section-label">SO SÁNH CHI TIẾT</p>
          <h2 className="mem-section-title">Tất cả hạng thành viên</h2>

          <div className="mem-compare-scroll">
            <table className="mem-compare-table">
              <thead>
                <tr>
                  <th className="mem-compare-feature-col">Quyền lợi</th>
                  {TIERS.map(t => (
                    <th key={t.id} className={t.featured ? 'featured-col' : ''}>
                      <div className="mem-compare-th">
                        {t.featured && <span className="mem-compare-badge">Phổ biến nhất</span>}
                        <span className="mem-compare-th-icon">{t.icon}</span>
                        <span className="mem-compare-th-name">{t.name}</span>
                        <span className="mem-compare-th-price">
                          {t.price === 'Liên hệ' ? 'Invite only' : `${t.price} ₫/năm`}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS[0].benefits.map((b, i) => (
                  <tr key={i}>
                    <td className="mem-compare-feature">{b.label}</td>
                    {TIERS.map(t => (
                      <td key={t.id} className={`mem-compare-cell ${t.featured ? 'featured-col' : ''}`}>
                        {t.benefits[i].included ? (
                          <span className="mem-cell-yes">
                            {t.benefits[i].value || '✓'}
                          </span>
                        ) : (
                          <span className="mem-cell-no">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="mem-compare-action-row">
                  <td />
                  {TIERS.map(t => (
                    <td key={t.id} className={t.featured ? 'featured-col' : ''}>
                      <button
                        className="mem-compare-join-btn"
                        style={{ background: t.gradient }}
                        onClick={() => {
                          if (t.price === 'Liên hệ') {
                            alert('Vui lòng liên hệ hotline 1800-xxxx để được hỗ trợ đăng ký hạng Diamond.');
                          } else {
                            navigate('/login');
                          }
                        }}
                      >
                        {t.price === 'Liên hệ' ? 'Liên hệ' : 'Chọn'}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Universal Perks ── */}
      <section className="mem-perks-section">
        <div className="mem-perks-inner">
          <p className="mem-section-label">ĐẶC QUYỀN CHUNG</p>
          <h2 className="mem-section-title">Mọi thành viên đều được hưởng</h2>
          <div className="mem-perks-grid">
            {PERKS.map((p, i) => (
              <div
                key={i}
                className={`mem-perk-card ${hoveredPerk === i ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredPerk(i)}
                onMouseLeave={() => setHoveredPerk(null)}
              >
                <div className="mem-perk-icon">{p.icon}</div>
                <h4 className="mem-perk-title">{p.title}</h4>
                <p className="mem-perk-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section className="mem-join-cta">
        <div className="mem-join-inner">
          <h2 className="mem-join-title">Bắt đầu hành trình thành viên hôm nay</h2>
          <p className="mem-join-sub">Đăng ký hoàn toàn miễn phí — Hạng Silver không yêu cầu phí thành viên.</p>
          <div className="mem-join-actions">
            <button className="mem-join-btn-primary" onClick={() => navigate('/login')}>
              Đăng ký miễn phí
            </button>
            <button 
              className="mem-join-btn-ghost"
              onClick={() => document.querySelector('.mem-compare-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default MembershipsPage;
