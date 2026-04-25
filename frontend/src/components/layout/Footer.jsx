import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={['container', styles.inner].join(' ')}>
        <div className={styles.brand}>
          <span className={styles.logo}>🏨 HotelManagement</span>
          <p className={styles.tagline}>
            Nơi mỗi khoảnh khắc trở thành ký ức không thể quên.
          </p>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Khám phá</h4>
            <Link to="/rooms" className={styles.colLink}>Phòng & Hạng</Link>
            <Link to="/articles" className={styles.colLink}>Tin tức & Blog</Link>
            <Link to="/attractions" className={styles.colLink}>Địa điểm tham quan</Link>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Hỗ trợ</h4>
            <Link to="/contact" className={styles.colLink}>Liên hệ</Link>
            <Link to="/faq" className={styles.colLink}>Câu hỏi thường gặp</Link>
            <a href="tel:+84123456789" className={styles.colLink}>+84 123 456 789</a>
            <a href="mailto:booking@hotelmanagement.com" className={styles.colLink}>booking@hotelmanagement.com</a>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Pháp lý</h4>
            <Link to="/privacy-policy" className={styles.colLink}>Chính sách bảo mật</Link>
            <Link to="/terms-of-service" className={styles.colLink}>Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© {new Date().getFullYear()} HotelManagement. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
