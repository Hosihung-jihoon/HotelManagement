import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (response.data.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Đăng Ký Tài Khoản</h1>
            <p>Tạo tài khoản để trải nghiệm dịch vụ tốt nhất</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="email@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+84 123 456 789"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Ít nhất 6 ký tự"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </div>

          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          <div className={styles.socialLogin}>
            <button className={styles.socialBtn}>
              <span>🔵</span> Đăng ký với Facebook
            </button>
            <button className={styles.socialBtn}>
              <span>🔴</span> Đăng ký với Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
