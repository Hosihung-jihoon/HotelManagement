import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading, user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const isAdmin = (user?.roleName || '').trim().toLowerCase() === 'admin';
    navigate(isAdmin ? '/' : '/site', { replace: true });
  }, [authLoading, isAuthenticated, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      const roleName = (result?.userInfo?.roleName || '').trim().toLowerCase();
      navigate(roleName === 'admin' ? '/' : '/site', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🏨</div>
          <h1>Đăng nhập hệ thống</h1>
          <p>Chỉ tài khoản admin mới vào trang quản trị. Các tài khoản khác sẽ vào trang chủ.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vibecoding209@gmail.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#533483',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            Quên mật khẩu?
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
