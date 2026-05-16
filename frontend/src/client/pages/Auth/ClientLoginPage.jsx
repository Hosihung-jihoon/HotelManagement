import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../../context/AuthContext';
import { Hotel, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UNSPLASH } from '../../api/clientApi';
import './ClientAuthPage.css';

export default function ClientLoginPage() {
  const { t, lang } = useLang();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    document.title = 'Sign In — Hotel Management';
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { redirectPath } = await login(email, password);
      navigate(redirectPath || '/');
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="c-auth-page">
      {/* Left image */}
      <div className="c-auth-page__hero" style={{ backgroundImage:`url('${UNSPLASH.roomSuite}')` }} aria-hidden="true">
        <div className="c-auth-page__hero-overlay" />
        <div className="c-auth-page__hero-content">
          <Hotel size={36} strokeWidth={1.5} style={{ color:'#fff', marginBottom:16 }} />
          <h2 className="display-sm" style={{ color:'#fff', fontFamily:'var(--font-serif)' }}>Hotel Management</h2>
          <p className="body-lg" style={{ color:'rgba(255,255,255,0.82)', maxWidth:320, marginTop:12 }}>
            {lang==='vi'?'Trải nghiệm xa hoa, dịch vụ đẳng cấp.':'Luxury experience, world-class service.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="c-auth-page__form-side">
        <div className="c-auth-form">
          <div style={{ marginBottom:'var(--sp-32)' }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:'var(--sp-10, 0.625rem)', textDecoration:'none', color:'var(--c-primary)', marginBottom:'var(--sp-32)' }}>
              <Hotel size={22} strokeWidth={1.5} />
              <span style={{ fontFamily:'var(--font-serif)', fontSize:'var(--text-title-lg)' }}>Hotel Management</span>
            </Link>
            <h1 className="headline-lg" style={{ color:'var(--c-primary)', fontFamily:'var(--font-serif)', marginBottom:'var(--sp-8)' }}>{t('auth.loginTitle')}</h1>
            <p className="text-muted body-lg">{t('auth.loginSubtitle')}</p>
          </div>

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-10, 0.625rem)', background:'#fee2e2', color:'var(--c-error)', padding:'var(--sp-12) var(--sp-16)', borderRadius:'var(--r-lg)', marginBottom:'var(--sp-20)', fontFamily:'var(--font-sans)', fontSize:'var(--text-label-lg)' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'var(--sp-20)' }}>
            <div className="input-tray">
              <label htmlFor="client-email">{t('auth.email')}</label>
              <input id="client-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus placeholder="guest@example.com" />
            </div>
            <div className="input-tray">
              <label htmlFor="client-password">{t('auth.password')}</label>
              <div style={{ position:'relative' }}>
                <input id="client-password" type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={{ paddingRight:48 }} />
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--c-on-surface-variant)' }} aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ textAlign:'right', marginTop:'-var(--sp-12)' }}>
              <Link to="/forgot-password" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', color:'var(--c-primary)' }}>{t('auth.forgotPassword')}</Link>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} id="client-login-submit-btn" style={{ padding:'var(--sp-16)', fontSize:'var(--text-body-md)' }}>
              {loading ? (lang==='vi'?'Đang đăng nhập...':'Signing in...') : t('auth.loginBtn')}
            </button>
          </form>

          <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', color:'var(--c-on-surface-variant)', marginTop:'var(--sp-24)', textAlign:'center' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={{ color:'var(--c-primary)', fontWeight:700 }} id="go-to-register-link">{t('auth.registerBtn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
