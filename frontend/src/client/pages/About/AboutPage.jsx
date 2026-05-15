import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { UNSPLASH } from '../../api/clientApi';
import { Hotel, Award, Users, Leaf } from 'lucide-react';

export default function AboutPage() {
  const { lang } = useLang();

  useEffect(() => {
    document.title = 'About Us — Hotel Management';
  }, []);

  const stats = [
    { value:'15+', label_vi:'Năm kinh nghiệm', label_en:'Years of Experience' },
    { value:'50K+', label_vi:'Lượt khách hài lòng', label_en:'Happy Guests' },
    { value:'120', label_vi:'Phòng cao cấp', label_en:'Luxury Rooms' },
    { value:'4.9', label_vi:'Đánh giá trung bình', label_en:'Average Rating' },
  ];

  const values = [
    { icon: <Award size={32} strokeWidth={1.5}/>, title_vi:'Xuất sắc', title_en:'Excellence', desc_vi:'Chúng tôi không ngừng nỗ lực để vượt qua mọi kỳ vọng của khách hàng.', desc_en:'We continuously strive to exceed every guest expectation.' },
    { icon: <Users size={32} strokeWidth={1.5}/>, title_vi:'Cá nhân hóa', title_en:'Personalization', desc_vi:'Mỗi khách hàng là độc nhất và xứng đáng được đối xử đặc biệt.', desc_en:'Every guest is unique and deserves a personalized experience.' },
    { icon: <Leaf size={32} strokeWidth={1.5}/>, title_vi:'Bền vững', title_en:'Sustainability', desc_vi:'Chúng tôi cam kết hoạt động có trách nhiệm với môi trường và cộng đồng.', desc_en:'We operate responsibly toward the environment and community.' },
  ];

  return (
    <div className="c-about-page" style={{ background:'var(--c-surface)', minHeight:'100vh' }}>
      {/* Hero */}
      <section className="c-hero" style={{ minHeight:'60vh' }}>
        <div className="c-hero__bg" style={{ backgroundImage:`url('${UNSPLASH.lobby}')` }} />
        <div className="c-hero__overlay" style={{ background:'rgba(0,25,60,0.65)' }} />
        <div className="c-hero__content container" style={{ gridTemplateColumns:'1fr', textAlign:'center' }}>
          <div>
            <p className="label-md" style={{ color:'var(--c-primary-fixed-dim)', marginBottom:'var(--sp-12)' }}>Our Story</p>
            <h1 className="display-lg" style={{ color:'var(--c-on-primary)', marginBottom:'var(--sp-20)' }}>
              {lang === 'vi' ? 'Về Hotel Management' : 'About Hotel Management'}
            </h1>
            <p className="body-lg" style={{ color:'rgba(255,255,255,0.82)', maxWidth:600, margin:'0 auto' }}>
              {lang === 'vi'
                ? 'Chúng tôi là nơi hội tụ của sự sang trọng, ấm áp và những kỷ niệm khó quên.'
                : 'Where luxury, warmth, and unforgettable memories converge.'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ background:'var(--c-surface-container-low)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'var(--sp-24)' }}>
            {stats.map((s, i) => (
              <div key={i} className="card" style={{ padding:'var(--sp-32)', textAlign:'center' }}>
                <p className="display-md text-primary-color" style={{ marginBottom:'var(--sp-8)' }}>{s.value}</p>
                <p className="text-muted" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-lg)' }}>{lang==='vi'?s.label_vi:s.label_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="c-section-header">
            <h2 className="display-md c-section-title">{lang==='vi'?'Giá trị cốt lõi':'Our Core Values'}</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'var(--sp-24)' }}>
            {values.map((v, i) => (
              <div key={i} className="card" style={{ padding:'var(--sp-32)', textAlign:'center' }}>
                <div style={{ color:'var(--c-primary)', marginBottom:'var(--sp-16)' }}>{v.icon}</div>
                <h3 className="title-lg" style={{ marginBottom:'var(--sp-12)', fontFamily:'var(--font-serif)', color:'var(--c-primary)' }}>{lang==='vi'?v.title_vi:v.title_en}</h3>
                <p className="text-muted body-lg">{lang==='vi'?v.desc_vi:v.desc_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section" style={{ background:'var(--c-surface-container-low)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'var(--sp-16)', height:360 }}>
            {[UNSPLASH.pool, UNSPLASH.spa, UNSPLASH.restaurant].map((img,i) => (
              <div key={i} style={{ borderRadius:'var(--r-2xl)', overflow:'hidden' }}>
                <img src={img} alt="Hotel" style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ padding:'var(--sp-80) var(--sp-24)', background:'linear-gradient(135deg,var(--c-primary),var(--c-primary-container))', textAlign:'center' }}>
        <h2 className="display-md" style={{ color:'var(--c-on-primary)', marginBottom:'var(--sp-24)' }}>
          {lang==='vi'?'Sẵn sàng trải nghiệm?':'Ready for an Experience?'}
        </h2>
        <Link to="/rooms" className="btn btn-secondary btn-lg" id="about-cta-btn">
          {lang==='vi'?'Khám phá phòng ngay':'Explore Our Rooms'}
        </Link>
      </div>
    </div>
  );
}
