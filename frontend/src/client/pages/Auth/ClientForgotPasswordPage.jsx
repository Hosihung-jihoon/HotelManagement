import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Mail, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { resetPassword, sendPasswordResetCode, verifyPasswordResetCode } from '../../api/clientApi';
import { UNSPLASH } from '../../api/clientApi';
import './ClientAuthPage.css';

export default function ClientForgotPasswordPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await sendPasswordResetCode(email);
      setMessage(res.data?.message || 'Code sent.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await verifyPasswordResetCode(email, code);
      setMessage(res.data?.message || 'Code verified.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await resetPassword(email, code, newPassword);
      setMessage(res.data?.message || 'Password reset successful.');
      setTimeout(() => navigate('/client-login', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="c-auth-page">
      <div className="c-auth-page__hero" style={{ backgroundImage: `url('${UNSPLASH.spa}')` }} aria-hidden="true">
        <div className="c-auth-page__hero-overlay" />
        <div className="c-auth-page__hero-content">
          <Hotel size={36} strokeWidth={1.5} style={{ color: '#fff', marginBottom: 16 }} />
          <h2 className="display-sm" style={{ color: '#fff', fontFamily: 'var(--font-serif)' }}>Hotel Management</h2>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 320, marginTop: 12 }}>
            {lang === 'vi' ? 'Khôi phục quyền truy cập tài khoản của bạn.' : 'Recover access to your account.'}
          </p>
        </div>
      </div>

      <div className="c-auth-page__form-side">
        <div className="c-auth-form">
          <div style={{ marginBottom: 'var(--sp-32)' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-10, 0.625rem)', textDecoration: 'none', color: 'var(--c-primary)', marginBottom: 'var(--sp-32)' }}>
              <Hotel size={22} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-lg)' }}>Hotel Management</span>
            </Link>
            <h1 className="headline-lg" style={{ color: 'var(--c-primary)', fontFamily: 'var(--font-serif)', marginBottom: 'var(--sp-8)' }}>
              {lang === 'vi' ? 'Quên mật khẩu' : 'Forgot Password'}
            </h1>
            <p className="text-muted body-lg">
              {lang === 'vi' ? 'Thực hiện lần lượt xác minh email, mã OTP và đặt mật khẩu mới.' : 'Verify your email, confirm the OTP code, then set a new password.'}
            </p>
          </div>

          {(error || message) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-10, 0.625rem)', background: error ? '#fee2e2' : '#dcfce7', color: error ? 'var(--c-error)' : '#166534', padding: 'var(--sp-12) var(--sp-16)', borderRadius: 'var(--r-lg)', marginBottom: 'var(--sp-20)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-lg)' }}>
              {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {error || message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-20)' }}>
              <div className="input-tray">
                <label htmlFor="forgot-email">{lang === 'vi' ? 'Email tài khoản' : 'Account Email'}</label>
                <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Mail size={16} /> {loading ? (lang === 'vi' ? 'Đang gửi...' : 'Sending...') : (lang === 'vi' ? 'Gửi mã xác minh' : 'Send Verification Code')}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-20)' }}>
              <div className="input-tray">
                <label htmlFor="forgot-code">{lang === 'vi' ? 'Mã OTP' : 'OTP Code'}</label>
                <input id="forgot-code" type="text" required value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <ShieldCheck size={16} /> {loading ? (lang === 'vi' ? 'Đang xác minh...' : 'Verifying...') : (lang === 'vi' ? 'Xác minh mã' : 'Verify Code')}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-20)' }}>
              <div className="input-tray">
                <label htmlFor="forgot-password">{lang === 'vi' ? 'Mật khẩu mới' : 'New Password'}</label>
                <input id="forgot-password" type="password" minLength={6} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <KeyRound size={16} /> {loading ? (lang === 'vi' ? 'Đang cập nhật...' : 'Updating...') : (lang === 'vi' ? 'Đặt lại mật khẩu' : 'Reset Password')}
              </button>
            </form>
          )}

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', color: 'var(--c-on-surface-variant)', marginTop: 'var(--sp-24)', textAlign: 'center' }}>
            <Link to="/client-login" style={{ color: 'var(--c-primary)', fontWeight: 700 }}>
              {lang === 'vi' ? 'Quay lại đăng nhập' : 'Back to Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
