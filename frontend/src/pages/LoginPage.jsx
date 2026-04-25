import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './LoginPage.module.css';

const BG = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left: image */}
      <div className={styles.imgSide} style={{ backgroundImage: `url(${BG})` }}>
        <div className={styles.imgOverlay} />
        <div className={styles.imgContent}>
          <Link to="/" className={styles.logo}>✦ Azure Horizon</Link>
          <blockquote className={styles.quote}>
            <p className="headline-md">"Nơi mỗi khoảnh khắc trở thành ký ức không thể quên."</p>
          </blockquote>
        </div>
      </div>

      {/* Right: form */}
      <div className={styles.formSide}>
        <div className={styles.formWrap}>
          <div className={styles.formHeader}>
            <p className={['label-md', styles.eyebrow].join(' ')}>Chào mừng trở lại</p>
            <h1 className={['headline-md', styles.formTitle].join(' ')}>Đăng nhập</h1>
            <p className={['body-md', styles.formSub].join(' ')}>
              Chưa có tài khoản?{' '}
              <Link to="/register" className={styles.formLink}>Đăng ký ngay</Link>
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />

            <div className={styles.pwWrap}>
              <Input
                label="Mật khẩu"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.forgotRow}>
              <Link to="/forgot-password" className={styles.forgotLink}>Quên mật khẩu?</Link>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
