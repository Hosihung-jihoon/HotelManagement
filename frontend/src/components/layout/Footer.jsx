import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={['container', styles.inner].join(' ')}>
        <div className={styles.brand}>
          <span className={styles.logo}>✦ Azure Horizon</span>
          <p className={styles.tagline}>
            Nơi mỗi khoảnh khắc trở thành ký ức không thể quên.
          </p>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Khám phá</h4>
            <Link to="/rooms" className={styles.colLink}>Phòng & Hạng</Link>
            <Link to="/services" className={styles.colLink}>Dịch vụ</Link>
            <Link to="/offers" className={styles.colLink}>Ưu đãi đặc biệt</Link>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Hỗ trợ</h4>
            <Link to="/about" className={styles.colLink}>Về chúng tôi</Link>
            <a href="tel:+84123456789" className={styles.colLink}>+84 123 456 789</a>
            <a href="mailto:hello@azurehorizon.vn" className={styles.colLink}>hello@azurehorizon.vn</a>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Pháp lý</h4>
            <Link to="/privacy" className={styles.colLink}>Chính sách bảo mật</Link>
            <Link to="/terms" className={styles.colLink}>Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© {new Date().getFullYear()} Azure Horizon Hotel. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
