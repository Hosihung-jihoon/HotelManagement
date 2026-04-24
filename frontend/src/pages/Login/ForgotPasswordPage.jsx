import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './LoginPage.css';
import './ForgotPasswordPage.css';

// 3 bước: 'email' → 'code' → 'password' → 'done'
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]   = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode]   = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Bước 1: Gửi mã
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await axiosClient.post('/PasswordReset/send-code', { email });
      setSuccess('Mã xác nhận đã được gửi đến email của bạn!');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi email. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh mã
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (code.trim().length !== 6) { setError('Vui lòng nhập đúng mã 6 chữ số.'); return; }
    setLoading(true);
    try {
      await axiosClient.post('/PasswordReset/verify-code', { email, code: code.trim() });
      setSuccess('Mã hợp lệ! Hãy nhập mật khẩu mới.');
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Mã không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    // Strict validation
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Mật khẩu phải bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/PasswordReset/reset-password', {
        email, code: code.trim(), newPassword,
      });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại. Thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const steps = [
    { key: 'email',    label: 'Nhập email' },
    { key: 'code',     label: 'Xác nhận mã' },
    { key: 'password', label: 'Mật khẩu mới' },
  ];
  const stepIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="login-page">
      <div className="login-card forgot-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo">🔐</div>
          <h1>Quên mật khẩu</h1>
          <p>
            {step === 'email'    && 'Nhập email để nhận mã xác nhận'}
            {step === 'code'     && `Nhập mã 6 chữ số đã gửi đến ${email}`}
            {step === 'password' && 'Tạo mật khẩu mới cho tài khoản'}
            {step === 'done'     && 'Đổi mật khẩu thành công!'}
          </p>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="fp-steps">
            {steps.map((s, i) => (
              <div key={s.key} className="fp-step-wrap">
                <div className={`fp-step-dot ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className={`fp-step-label ${i === stepIdx ? 'active-label' : ''}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`fp-step-line ${i < stepIdx ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        {error   && <div className="login-error">{error}</div>}
        {success && step === 'code' && <div className="fp-success">{success}</div>}

        {/* === Bước 1: Nhập email === */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="login-form">
            <div className="form-group">
              <label htmlFor="fp-email">
                <Mail size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Địa chỉ email
              </label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Đang gửi...' : '📨 Gửi mã xác nhận'}
            </button>
            <button type="button" className="fp-back-btn" onClick={() => navigate('/login')}>
              <ArrowLeft size={14} /> Quay lại đăng nhập
            </button>
          </form>
        )}

        {/* === Bước 2: Nhập mã OTP === */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="login-form">
            <div className="form-group">
              <label htmlFor="fp-code">
                <KeyRound size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Mã xác nhận (6 chữ số)
              </label>
              <input
                id="fp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="● ● ● ● ● ●"
                className="otp-input"
                required
                autoFocus
              />
              <small className="fp-hint">Kiểm tra hộp thư đến (hoặc thư rác) của <strong>{email}</strong></small>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Đang xác minh...' : '✓ Xác nhận mã'}
            </button>
            <button type="button" className="fp-back-btn" onClick={() => { setStep('email'); setError(''); setCode(''); }}>
              <ArrowLeft size={14} /> Đổi email khác
            </button>
            <button type="button" className="fp-resend-btn" onClick={handleSendCode} disabled={loading}>
              Gửi lại mã
            </button>
          </form>
        )}

        {/* === Bước 3: Nhập mật khẩu mới === */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="fp-new-pw">
                <Lock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Mật khẩu mới
              </label>
              <input
                id="fp-new-pw"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="fp-confirm-pw">
                <Lock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Nhập lại mật khẩu
              </label>
              <input
                id="fp-confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
            {/* Strength indicator */}
            {newPassword && (
              <div className="pw-strength">
                <div className={`pw-bar ${newPassword.length >= 6 ? 'ok' : ''} ${/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword) ? 'great' : ''}`} />
                <span>
                  {newPassword.length < 6 ? 'Quá ngắn' : 
                   !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword) ? 'Thiếu chữ hoa/số' : 
                   'Mạnh (Hợp lệ)'}
                </span>
              </div>
            )}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Đang lưu...' : '🔒 Đổi mật khẩu'}
            </button>
          </form>
        )}

        {/* === Thành công === */}
        {step === 'done' && (
          <div className="fp-done">
            <CheckCircle size={56} className="fp-done-icon" />
            <h3>Mật khẩu đã được đổi!</h3>
            <p>Bạn có thể đăng nhập ngay bây giờ với mật khẩu mới.</p>
            <button className="login-btn" onClick={() => navigate('/login')}>
              Đến trang đăng nhập
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default ForgotPasswordPage;
