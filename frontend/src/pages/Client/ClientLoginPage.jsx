import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ClientLoginPage.css';

function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic cho Client Login sẽ được thêm sau
    console.log('Client Login:', email, password);
  };

  return (
    <div className="client-login-page">
      <div className="login-split-container">
        {/* Left Side: Image / Brand */}
        <div className="login-image-side">
          <img 
            src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1200" 
            alt="L'Horizon Resort" 
          />
          <div className="image-overlay-text">
            <h2 className="display-lg">Trở Lại<br/>Nơi Chân Trời</h2>
            <p className="body-lg">Đăng nhập để quản lý kỳ nghỉ và nhận những đặc quyền dành riêng cho thành viên.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="login-form-side">
          <div className="form-wrapper">
            <h1 className="headline-lg">Đăng Nhập</h1>
            <p className="body-lg subtitle">Chào mừng bạn trở lại L'Horizon.</p>

            <form onSubmit={handleSubmit} className="client-auth-form">
              <div className="form-group-client">
                <input 
                  type="email" 
                  id="client-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder=" " 
                />
                <label htmlFor="client-email">Email</label>
              </div>

              <div className="form-group-client">
                <input 
                  type="password" 
                  id="client-password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder=" " 
                />
                <label htmlFor="client-password">Mật khẩu</label>
              </div>

              <div className="form-actions">
                <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="btn-primary full-width">Đăng nhập</button>
            </form>

            <div className="register-prompt">
              <span>Chưa có tài khoản? </span>
              <Link to="/contact">Liên hệ lễ tân</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientLoginPage;
