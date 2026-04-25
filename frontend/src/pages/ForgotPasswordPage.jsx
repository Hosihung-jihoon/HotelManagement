import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <h1>✅ Kiểm tra Email</h1>
              <p>Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn</p>
            </div>

            <div className={styles.successMessage}>
              📧 Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để tìm email từ chúng tôi.
              Email chứa liên kết đặt lại mật khẩu sẽ hết hạn sau 24 giờ.
            </div>

            <div className={styles.backLink}>
              <Link to="/login">← Quay lại đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>🔑 Quên Mật Khẩu</h1>
            <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>

          <div className={styles.backLink}>
            <Link to="/">← Quay về trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
