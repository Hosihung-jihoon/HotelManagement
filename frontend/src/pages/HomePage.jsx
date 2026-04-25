import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, Award } from 'lucide-react';
import BookingBar from '../components/booking/BookingBar';
import RoomCard from '../components/rooms/RoomCard';
import Button from '../components/ui/Button';
import client from '../api/client';
import styles from './HomePage.module.css';

const HERO_BG = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=85';
const ABOUT_IMG = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80';

const FEATURES = [
  { icon: <Star size={22} />, title: 'Đẳng cấp 5 sao', desc: 'Tiêu chuẩn quốc tế với dịch vụ cá nhân hóa tuyệt vời.' },
  { icon: <Shield size={22} />, title: 'Đặt phòng an toàn', desc: 'Thanh toán bảo mật, hủy miễn phí trong 24 giờ.' },
  { icon: <Clock size={22} />, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ concierge sẵn sàng phục vụ mọi lúc.' },
  { icon: <Award size={22} />, title: 'Giá tốt nhất', desc: 'Cam kết giá tốt nhất khi đặt trực tiếp.' },
];

export default function HomePage() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/RoomTypes?pageSize=4')
      .then(r => setFeaturedRooms(r.data?.items || r.data || []))
      .catch(() => setFeaturedRooms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={styles.page}>
      {/* ── HERO ── */}
      <section className={styles.hero} style={{ backgroundImage: `url(${HERO_BG})` }}>
        <div className={styles.heroOverlay} />
        <div className={['container', styles.heroContent].join(' ')}>
          <div className={styles.heroText}>
            <p className={['label-lg', styles.heroEyebrow].join(' ')}>Azure Horizon Hotel</p>
            <h1 className={['display-lg', styles.heroHeadline].join(' ')}>
              Nơi Chân Trời<br />
              <em>Gặp Gỡ Biển Cả</em>
            </h1>
            <p className={['body-lg', styles.heroLead].join(' ')}>
              Trải nghiệm sự sang trọng vượt thời gian tại trái tim của thành phố biển.
              Mỗi khoảnh khắc là một ký ức không thể quên.
            </p>
          </div>

          {/* Booking Bar */}
          <div className={styles.bookingBarWrap}>
            <BookingBar variant="hero" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollHint} aria-hidden>
          <div className={styles.scrollDot} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div>
                  <h3 className={['title-sm', styles.featureTitle].join(' ')}>{f.title}</h3>
                  <p className={['body-sm', styles.featureDesc].join(' ')}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ROOMS ── */}
      <section className={styles.rooms}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <p className={['label-md', styles.eyebrow].join(' ')}>Bộ sưu tập phòng</p>
              <h2 className={['headline-lg', styles.sectionTitle].join(' ')}>
                Không gian được thiết kế<br />cho những khoảnh khắc đặc biệt
              </h2>
            </div>
            <Link to="/rooms">
              <Button variant="secondary" iconRight={<ArrowRight size={16} />}>
                Xem tất cả phòng
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className={styles.skeletonGrid}>
              {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : featuredRooms.length > 0 ? (
            <div className={styles.roomsGrid}>
              {featuredRooms.slice(0, 4).map((room, i) => (
                <RoomCard key={room.roomTypeId || room.id || i} room={room} index={i} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyRooms}>
              <p>Không thể tải danh sách phòng. Vui lòng thử lại sau.</p>
              <Link to="/rooms">
                <Button variant="primary">Xem phòng</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT / EDITORIAL ── */}
      <section className={styles.about}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutImgWrap}>
              <img src={ABOUT_IMG} alt="Azure Horizon Hotel lobby" className={styles.aboutImg} loading="lazy" />
              <div className={styles.aboutBadge}>
                <span className={styles.badgeNum}>15+</span>
                <span className={styles.badgeLabel}>Năm kinh nghiệm</span>
              </div>
            </div>
            <div className={styles.aboutText}>
              <p className={['label-md', styles.eyebrow].join(' ')}>Câu chuyện của chúng tôi</p>
              <h2 className={['headline-lg', styles.sectionTitle].join(' ')}>
                Nghệ thuật tiếp đón<br />được nâng lên tầm cao mới
              </h2>
              <p className={['body-lg', styles.aboutDesc].join(' ')}>
                Azure Horizon không chỉ là nơi lưu trú — đây là một trải nghiệm sống.
                Từng chi tiết trong không gian, từng cử chỉ phục vụ đều được chắt lọc
                để mang đến cảm giác được trân trọng tuyệt đối.
              </p>
              <p className={['body-md', styles.aboutDesc].join(' ')}>
                Với hơn 15 năm kinh nghiệm trong ngành khách sạn cao cấp, chúng tôi
                hiểu rằng sự xa xỉ thực sự nằm ở những khoảnh khắc yên bình và
                dịch vụ không cần phải nói.
              </p>
              <Link to="/about">
                <Button variant="tertiary" iconRight={<ArrowRight size={16} />}>
                  Khám phá thêm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div className={styles.ctaText}>
              <h2 className={['headline-md', styles.ctaTitle].join(' ')}>
                Sẵn sàng cho kỳ nghỉ hoàn hảo?
              </h2>
              <p className={['body-lg', styles.ctaDesc].join(' ')}>
                Đặt phòng trực tiếp để nhận ưu đãi tốt nhất và dịch vụ ưu tiên.
              </p>
            </div>
            <Link to="/rooms">
              <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
                Đặt phòng ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
