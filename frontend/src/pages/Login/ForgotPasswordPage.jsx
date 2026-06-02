import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../client/i18n/LangContext';
import { Hotel, Mail, KeyRound, Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UNSPLASH } from '../../client/api/clientApi';
import axiosClient from '../../api/axiosClient';
import '../../client/pages/Auth/ClientAuthPage.css';

export default function ForgotPasswordPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep]   = useState('email'); // 'email' | 'code' | 'password' | 'done'
  const [email, setEmail] = useState('');
  const [code, setCode]   = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    document.title = lang === 'vi' ? 'Quên mật khẩu — Hotel Management' : 'Reset Password — Hotel Management';
  }, [lang]);

  // Bước 1: Gửi mã OTP
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axiosClient.post('/PasswordReset/send-code', { email });
      setSuccess(lang === 'vi' ? 'Mã xác nhận đã được gửi đến email!' : 'Verification code sent to your email!');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'vi' ? 'Không thể gửi email. Thử lại sau.' : 'Failed to send verification code. Try again later.'));
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác minh mã OTP
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (code.trim().length !== 6) {
      setError(lang === 'vi' ? 'Vui lòng nhập đúng mã 6 chữ số.' : 'Please enter a valid 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post('/PasswordReset/verify-code', { email, code: code.trim() });
      setSuccess(lang === 'vi' ? 'Mã hợp lệ! Hãy nhập mật khẩu mới.' : 'Code verified successfully! Enter your new password.');
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'vi' ? 'Mã không đúng hoặc đã hết hạn.' : 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đổi mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError(lang === 'vi' ? 'Mật khẩu mới phải có ít nhất 6 ký tự.' : 'New password must be at least 6 characters long.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(newPassword)) {
      setError(lang === 'vi' 
        ? 'Mật khẩu phải bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số.' 
        : 'Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(lang === 'vi' ? 'Mật khẩu xác nhận không khớp.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/PasswordReset/reset-password', {
        email,
        code: code.trim(),
        newPassword,
      });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'vi' ? 'Đổi mật khẩu thất bại. Thử lại.' : 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'email',    label: lang === 'vi' ? 'Gửi mã' : 'Send Code' },
    { key: 'code',     label: lang === 'vi' ? 'Nhập mã' : 'Verify Code' },
    { key: 'password', label: lang === 'vi' ? 'Mật khẩu' : 'New Password' },
  ];
  const stepIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="c-auth-page">
      {/* Left luxury hero image side */}
      <div className="c-auth-page__hero" style={{ backgroundImage: `url('${UNSPLASH.lobby || UNSPLASH.roomSuite}')` }} aria-hidden="true">
        <div className="c-auth-page__hero-overlay" />
        <div className="c-auth-page__hero-content">
          <Hotel size={36} strokeWidth={1.5} style={{ color: '#fff', marginBottom: 16 }} />
          <h2 className="display-sm" style={{ color: '#fff', fontFamily: 'var(--font-serif)' }}>Hotel Management</h2>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 320, marginTop: 12 }}>
            {lang === 'vi' ? 'Khôi phục tài khoản của bạn nhanh chóng và bảo mật.' : 'Recover your account details securely and quickly.'}
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="c-auth-page__form-side">
        <div className="c-auth-form">
          {/* Logo brand link */}
          <div style={{ marginBottom: 'var(--sp-24)' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-10)', textDecoration: 'none', color: 'var(--c-primary)', marginBottom: 'var(--sp-24)' }}>
              <Hotel size={22} strokeWidth={1.5} />
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-lg)' }}>Hotel Management</span>
            </Link>
            <h1 className="headline-lg" style={{ color: 'var(--c-primary)', fontFamily: 'var(--font-serif)', marginBottom: 'var(--sp-8)' }}>
              {lang === 'vi' ? 'Quên mật khẩu' : 'Forgot Password'}
            </h1>
            <p className="text-muted body-lg">
              {step === 'email' && (lang === 'vi' ? 'Nhập email để nhận mã xác nhận kích hoạt.' : 'Enter your email address to receive a validation code.')}
              {step === 'code' && (lang === 'vi' ? `Chúng tôi đã gửi một mã xác thực 6 chữ số đến ${email}` : `We've sent a 6-digit confirmation code to ${email}`)}
              {step === 'password' && (lang === 'vi' ? 'Tạo mật khẩu bảo mật mới cho tài khoản của bạn.' : 'Create a new secure password for your account.')}
              {step === 'done' && (lang === 'vi' ? 'Tài khoản của bạn đã được cập nhật thành công.' : 'Your account password has been updated.')}
            </p>
          </div>

          {/* Premium Wizard Steps Progress Bar */}
          {step !== 'done' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-8)', marginBottom: 'var(--sp-32)', padding: 'var(--sp-8) 0', borderBottom: '1px solid var(--c-surface-container-high)' }}>
              {steps.map((s, idx) => {
                const isActive = idx === stepIdx;
                const isCompleted = idx < stepIdx;
                return (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-8)', flex: idx === steps.length - 1 ? 'none' : 1 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 'bold',
                      background: isCompleted ? 'var(--c-success)' : isActive ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
                      color: isCompleted || isActive ? '#fff' : 'var(--c-on-surface-variant)',
                      transition: 'all 0.3s ease',
                    }}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span style={{
                      fontSize: 'var(--text-caption)',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? 'var(--c-primary)' : 'var(--c-on-surface-variant)',
                      fontFamily: 'var(--font-sans)',
                      whiteSpace: 'nowrap',
                    }}>
                      {s.label}
                    </span>
                    {idx < steps.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: 2,
                        background: isCompleted ? 'var(--c-success)' : 'var(--c-surface-container-high)',
                        minWidth: 'var(--sp-12)',
                        transition: 'all 0.3s ease',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-10)', background: '#fee2e2', color: 'var(--c-error)', padding: 'var(--sp-12) var(--sp-16)', borderRadius: 'var(--r-lg)', marginBottom: 'var(--sp-20)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-lg)' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {success && step === 'code' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-10)', background: '#dcfce7', color: 'var(--c-success)', padding: 'var(--sp-12) var(--sp-16)', borderRadius: 'var(--r-lg)', marginBottom: 'var(--sp-20)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-lg)' }}>
              <CheckCircle size={18} /> {success}
            </div>
          )}

          {/* Wizard Forms */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-24)' }}>
              <div className="input-tray">
                <label htmlFor="fp-email">
                  <Mail size={14} style={{ marginRight: 4, verticalAlign: 'middle', color: 'var(--c-outline)' }} />
                  {lang === 'vi' ? 'Địa chỉ email đăng ký' : 'Registered Email Address'}
                </label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 'var(--sp-16)', width: '100%' }}>
                {loading ? (lang === 'vi' ? 'Đang gửi...' : 'Sending...') : (lang === 'vi' ? '📨 Gửi mã xác nhận' : '📨 Send Code')}
              </button>

              <div style={{ textAlign: 'center', marginTop: 'var(--sp-12)' }}>
                <Link to="/client-login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-label-md)', color: 'var(--c-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  <ArrowLeft size={14} /> {lang === 'vi' ? 'Quay lại đăng nhập' : 'Back to Login'}
                </Link>
              </div>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-24)' }}>
              <div className="input-tray">
                <label htmlFor="fp-code">
                  <KeyRound size={14} style={{ marginRight: 4, verticalAlign: 'middle', color: 'var(--c-outline)' }} />
                  {lang === 'vi' ? 'Mã xác thực (6 chữ số)' : 'Validation Code (6-digits)'}
                </label>
                <input
                  id="fp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="● ● ● ● ● ●"
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: 'var(--text-headline-lg)' }}
                  required
                  autoFocus
                />
                <span className="text-muted" style={{ fontSize: 'var(--text-caption)', marginTop: 4 }}>
                  {lang === 'vi' ? 'Vui lòng kiểm tra hộp thư đến của email ' : 'Please inspect your inbox for email '}<strong>{email}</strong>
                </span>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 'var(--sp-16)', width: '100%' }}>
                {loading ? (lang === 'vi' ? 'Đang xác minh...' : 'Verifying...') : (lang === 'vi' ? '✓ Xác thực mã code' : '✓ Verify Code')}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-12)' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStep('email'); setError(''); setCode(''); }} style={{ fontWeight: 600 }}>
                  <ArrowLeft size={14} /> {lang === 'vi' ? 'Đổi email khác' : 'Change Email'}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleSendCode} disabled={loading} style={{ fontWeight: 600, color: 'var(--c-outline)' }}>
                  {lang === 'vi' ? 'Gửi lại mã' : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-20)' }}>
              <div className="input-tray">
                <label htmlFor="fp-new-pw">
                  <Lock size={14} style={{ marginRight: 4, verticalAlign: 'middle', color: 'var(--c-outline)' }} />
                  {lang === 'vi' ? 'Mật khẩu mới' : 'New Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="fp-new-pw"
                    type={showPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingRight: 48 }}
                    required
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-tray">
                <label htmlFor="fp-confirm-pw">
                  <Lock size={14} style={{ marginRight: 4, verticalAlign: 'middle', color: 'var(--c-outline)' }} />
                  {lang === 'vi' ? 'Nhập lại mật khẩu' : 'Confirm New Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="fp-confirm-pw"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingRight: 48 }}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}>
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Strength indicator bars */}
              {newPassword && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: 'var(--sp-4) 0' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: newPassword.length >= 6 ? 'var(--c-success)' : 'var(--c-error)' }} />
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword) ? 'var(--c-success)' : 'var(--c-surface-container-high)' }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-caption)', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>
                    {newPassword.length < 6 
                      ? (lang === 'vi' ? 'Mật khẩu quá ngắn (tối thiểu 6 ký tự)' : 'Password too short (min 6 chars)') 
                      : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(newPassword) 
                        ? (lang === 'vi' ? 'Nên có chữ hoa, chữ thường và chữ số' : 'Should include upper, lower, & numbers') 
                        : (lang === 'vi' ? 'Mật khẩu mạnh & hợp lệ ✓' : 'Strong & valid password ✓')}
                  </span>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: 'var(--sp-16)', width: '100%', marginTop: 'var(--sp-12)' }}>
                {loading ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? '🔒 Đổi mật khẩu' : '🔒 Update Password')}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-12) 0' }}>
              <CheckCircle size={64} style={{ color: 'var(--c-success)', marginBottom: 'var(--sp-20)' }} />
              <h3 className="title-lg" style={{ color: 'var(--c-primary)', fontWeight: 700, marginBottom: 'var(--sp-8)' }}>
                {lang === 'vi' ? 'Đổi mật khẩu thành công!' : 'Success!'}
              </h3>
              <p className="text-muted body-lg" style={{ marginBottom: 'var(--sp-24)' }}>
                {lang === 'vi' ? 'Mật khẩu mới của bạn đã hoạt động. Hãy đăng nhập ngay bây giờ.' : 'Your new password is now active. You can sign in using your new credentials.'}
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/client-login')} style={{ width: '100%', padding: 'var(--sp-16)' }}>
                {lang === 'vi' ? 'Đến trang đăng nhập' : 'Proceed to Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
