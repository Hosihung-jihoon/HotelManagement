import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutUsPage.css';

const STATS = [
  { num: 1987, suffix: '', label: 'Năm thành lập', prefix: '' },
  { num: 37, suffix: '+', label: 'Năm kinh nghiệm', prefix: '' },
  { num: 98, suffix: '%', label: 'Khách hài lòng', prefix: '' },
  { num: 12000, suffix: '+', label: 'Thành viên trung thành', prefix: '' },
];

const TEAM = [
  {
    name: 'Hồ Sĩ Hùng',
    title: 'Giám Đốc Điều Hành',
    quote: '"Sự hoàn mỹ không chỉ là mục tiêu, mà là tiêu chuẩn bắt buộc tại mỗi hành trình."',
    avatar: 'HSH',
    color: '#00193c',
  },
  {
    name: 'Nguyễn Duy Khang',
    title: 'Giám Đốc Vận Hành',
    quote: '"Chúng tôi kiến tạo những không gian nơi đẳng cấp và sự hiếu khách giao thoa."',
    avatar: 'NDK',
    color: '#1a4a7a',
  },
  {
    name: 'Đồng Sỹ Nguyên',
    title: 'Bếp Trưởng Điều Hành',
    quote: '"Mỗi món ăn là một kiệt tác nghệ thuật được phục vụ bằng cả trái tim."',
    avatar: 'DSN',
    color: '#003d80',
  },
  {
    name: 'Trần Vũ Duy Anh',
    title: 'Giám Đốc Spa & Wellness',
    quote: '"Sự tĩnh lặng và thư thái là món quà quý giá nhất chúng tôi dành tặng bạn."',
    avatar: 'TDA',
    color: '#002d62',
  },
];

const MILESTONES = [
  { year: '1987', title: 'Khai trương', desc: 'Mở cửa khách sạn đầu tiên với 48 phòng tại trung tâm thành phố.' },
  { year: '1998', title: 'Mở rộng quy mô', desc: 'Nâng cấp lên 200 phòng, thêm nhà hàng và trung tâm hội nghị đầu tiên.' },
  { year: '2007', title: 'Giải thưởng 5 sao', desc: 'Nhận chứng nhận 5 sao quốc tế Forbes Travel Guide lần đầu tiên.' },
  { year: '2015', title: 'Spa World-Class', desc: 'Khai trương Aqua Wellness Spa — Top 10 spa tốt nhất Đông Nam Á.' },
  { year: '2019', title: 'Chương trình Thành viên', desc: 'Ra mắt Loyalty Program với hơn 5.000 thành viên trong năm đầu.' },
  { year: '2024', title: 'Tương lai xanh', desc: 'Đạt chứng nhận Carbon Neutral, tiên phong trong du lịch bền vững.' },
];

const VALUES = [
  {
    icon: '✦',
    title: 'Tính Xác Thực',
    desc: 'Mọi trải nghiệm chúng tôi cung cấp đều xuất phát từ sự chân thành và cam kết thực sự với từng vị khách.',
  },
  {
    icon: '◈',
    title: 'Sự Xuất Sắc',
    desc: 'Tiêu chuẩn không có ngưỡng trần — chúng tôi liên tục cải thiện và vượt qua chính mình mỗi ngày.',
  },
  {
    icon: '◇',
    title: 'Nhân Văn',
    desc: 'Đặt con người làm trung tâm — từ nhân viên, đến khách hàng, đến cộng đồng địa phương.',
  },
  {
    icon: '◉',
    title: 'Bền Vững',
    desc: 'Hoạt động kinh doanh có trách nhiệm với môi trường và thế hệ mai sau là ưu tiên không thể thỏa hiệp.',
  },
];

// Animated Counter Hook
function useCounter(target, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
}

function StatCard({ stat, shouldStart }) {
  const count = useCounter(stat.num, 2000, shouldStart);
  return (
    <div className="about-stat-card">
      <span className="about-stat-num">
        {stat.prefix}{count.toLocaleString('vi-VN')}{stat.suffix}
      </span>
      <span className="about-stat-label">{stat.label}</span>
    </div>
  );
}

function AboutUsPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeValue, setActiveValue] = useState(0);
  const statsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-cycle values
  useEffect(() => {
    const id = setInterval(() => {
      setActiveValue(v => (v + 1) % VALUES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-visual">
          <img src="/src/assets/about_hero.png" alt="Luxury Hotel Lobby" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="about-hero-content">
          <span className="about-hero-label">ABOUT US</span>
          <h1 className="about-hero-title">
            Hơn 37 năm
            <br />
            <em>kiến tạo</em> ký ức
          </h1>
          <p className="about-hero-body">
            Từ một khách sạn nhỏ với 48 phòng năm 1987, chúng tôi đã trở thành biểu tượng 
            của lòng hiếu khách và sự tinh tế — nơi mỗi chi tiết đều được chắt chiu như một 
            tác phẩm nghệ thuật sống.
          </p>
          <button 
            className="about-hero-cta"
            onClick={() => document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Xem hành trình của chúng tôi ↓
          </button>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="about-mv-section">
        <div className="about-mv-inner">
          <div className="about-mv-card about-mv-mission">
            <div className="about-mv-icon">◈</div>
            <p className="about-mv-label">SỨ MỆNH</p>
            <h2 className="about-mv-title">Trao gửi niềm vui qua từng khoảnh khắc</h2>
            <p className="about-mv-body">
              Chúng tôi tồn tại để tạo ra những khoảnh khắc vượt thời gian — nơi cảm xúc được 
              chăm chút, con người được trân trọng và mỗi lần trở lại đều mang đến điều gì đó 
              mới mẻ, ý nghĩa hơn.
            </p>
          </div>
          <div className="about-mv-card about-mv-vision">
            <div className="about-mv-icon">✦</div>
            <p className="about-mv-label">TẦM NHÌN</p>
            <h2 className="about-mv-title">Định nghĩa lại tiêu chuẩn xa xỉ Á Đông</h2>
            <p className="about-mv-body">
              Đến năm 2030, chúng tôi hướng đến vị thế là thương hiệu khách sạn được yêu thích 
              nhất Đông Nam Á — không chỉ bởi đẳng cấp dịch vụ, mà còn bởi tính nhân văn 
              và bền vững đặt làm nền tảng cốt lõi.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats-section" ref={statsRef}>
        <div className="about-stats-inner">
          <p className="about-section-label">CON SỐ NÓI LÊN TẤT CẢ</p>
          <div className="about-stats-grid">
            {STATS.map((s, i) => (
              <StatCard key={i} stat={s} shouldStart={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values-section">
        <div className="about-values-inner">
          <div className="about-values-left">
            <p className="about-section-label">GIÁ TRỊ CỐT LÕI</p>
            <h2 className="about-values-title">Những gì định hình chúng tôi</h2>
            <p className="about-values-sub">
              Bốn giá trị này không chỉ là khẩu hiệu — chúng là kim chỉ nam cho mọi 
              quyết định, từ cách chúng tôi tuyển chọn nhân sự đến cách phục vụ từng vị khách.
            </p>
            <div className="about-values-tabs">
              {VALUES.map((v, i) => (
                <button
                  key={i}
                  className={`about-value-tab ${activeValue === i ? 'active' : ''}`}
                  onClick={() => setActiveValue(i)}
                >
                  <span className="about-value-tab-icon">{v.icon}</span>
                  <span>{v.title}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="about-values-right">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className={`about-value-panel ${activeValue === i ? 'visible' : ''}`}
              >
                <div className="about-value-panel-icon">{v.icon}</div>
                <h3 className="about-value-panel-title">{v.title}</h3>
                <p className="about-value-panel-desc">{v.desc}</p>
                <div className="about-value-panel-progress">
                  <div
                    className="about-value-panel-bar"
                    style={activeValue === i ? { width: '100%' } : { width: '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ecosystem (Phát triển hệ sinh thái du lịch) ── */}
      <section className="about-eco-section">
        <div className="about-eco-inner">
          <p className="about-section-label" style={{ textAlign: 'center' }}>HỆ SINH THÁI TƯƠNG LAI</p>
          <h2 className="about-eco-section-title">Phát triển hệ sinh thái du lịch</h2>
          
          <div className="about-eco-grid">
            {/* Eco Item 1 */}
            <div className="about-eco-card">
              <div className="about-eco-image-wrapper">
                <img src="/src/assets/eco_customer.png" alt="Giúp khách hàng chủ động" className="about-eco-image" />
              </div>
              <div className="about-eco-content">
                <h3 className="about-eco-title">Giúp khách hàng chủ động</h3>
                <p className="about-eco-desc">
                  Cung cấp các sản phẩm và dịch vụ du lịch được cá nhân hoá tối đa nhờ tận dụng sức mạnh công nghệ đột phá.
                </p>
              </div>
            </div>

            {/* Eco Item 2 */}
            <div className="about-eco-card">
              <div className="about-eco-image-wrapper">
                <img src="/src/assets/eco_community.png" alt="Đóng góp cho cộng đồng" className="about-eco-image" />
              </div>
              <div className="about-eco-content">
                <h3 className="about-eco-title">Đóng góp cho cộng đồng</h3>
                <p className="about-eco-desc">
                  Triển khai các hoạt động và sáng kiến có trách nhiệm nhằm mang lại lợi ích kinh tế, xã hội tích cực cho cộng đồng.
                </p>
              </div>
            </div>

            {/* Eco Item 3 */}
            <div className="about-eco-card">
              <div className="about-eco-image-wrapper">
                <img src="/src/assets/eco_cooperation.png" alt="Tăng cường hợp tác" className="about-eco-image" />
              </div>
              <div className="about-eco-content">
                <h3 className="about-eco-title">Tăng cường hợp tác</h3>
                <p className="about-eco-desc">
                  Xây dựng các mối quan hệ hợp tác chiến lược để không ngừng làm giàu và mở rộng hệ sinh thái du lịch bền vững.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="about-timeline-section" id="timeline-section">
        <div className="about-timeline-inner">
          <p className="about-section-label">HÀNH TRÌNH</p>
          <h2 className="about-timeline-title">Từ những bước đầu đến hôm nay</h2>
          <div className="about-timeline">
            {MILESTONES.map((m, i) => (
              <div key={i} className={`about-timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="about-timeline-content">
                  <span className="about-timeline-year">{m.year}</span>
                  <h4 className="about-timeline-event">{m.title}</h4>
                  <p className="about-timeline-desc">{m.desc}</p>
                </div>
                <div className="about-timeline-dot" />
              </div>
            ))}
            <div className="about-timeline-line" />
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="about-team-section">
        <div className="about-team-inner">
          <p className="about-section-label">ĐỘI NGŨ LÃNH ĐẠO</p>
          <h2 className="about-section-title">Con người đứng sau chất lượng</h2>
          <div className="about-team-grid">
            {TEAM.map((member, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar" style={{ background: member.color, overflow: 'hidden' }}>
                  <img src={`/src/assets/about_team_${i+1}.png`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="about-team-info">
                  <h4 className="about-team-name">{member.name}</h4>
                  <p className="about-team-title">{member.title}</p>
                  <p className="about-team-quote">{member.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Awards ── */}
      <section className="about-awards-section">
        <div className="about-awards-inner">
          <p className="about-section-label">VINH DANH & GIẢI THƯỞNG</p>
          <div className="about-awards-list">
            {[
              { badge: '★★★★★', org: 'Forbes Travel Guide', award: 'Five-Star Hotel Award', years: '2018 — 2024' },
              { badge: '⬟', org: 'Condé Nast Traveller', award: 'Top Hotel in Southeast Asia', years: '2020, 2022, 2023' },
              { badge: '◆', org: 'TripAdvisor', award: "Travelers' Choice Best of the Best", years: '2019 — 2024' },
              { badge: '✦', org: 'Green Key Global', award: 'Sustainable Tourism Excellence', years: '2022 — 2024' },
            ].map((award, i) => (
              <div key={i} className="about-award-card">
                <div className="about-award-badge">{award.badge}</div>
                <div className="about-award-info">
                  <span className="about-award-org">{award.org}</span>
                  <span className="about-award-name">{award.award}</span>
                  <span className="about-award-years">{award.years}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="about-cta-section">
        <div className="about-cta-inner">
          <p className="about-section-label" style={{ color: 'rgba(206,229,255,0.6)' }}>GIA NHẬP CÙNG CHÚNG TÔI</p>
          <h2 className="about-cta-title">Câu chuyện của bạn bắt đầu từ đây</h2>
          <p className="about-cta-sub">
            Dù là kỳ nghỉ gia đình, tuần trăng mật hay chuyến công tác, chúng tôi luôn 
            sẵn sàng để mỗi khoảnh khắc của bạn trở thành một ký ức đặc biệt.
          </p>
          <div className="about-cta-actions">
            <button className="about-cta-btn-primary" onClick={() => navigate('/rooms')}>
              Đặt phòng ngay
            </button>
            <button className="about-cta-btn-ghost" onClick={() => navigate('/services')}>
              Khám phá dịch vụ
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default AboutUsPage;
