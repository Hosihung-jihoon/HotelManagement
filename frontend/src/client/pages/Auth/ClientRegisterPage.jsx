import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { Hotel, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { registerUser } from '../../api/clientApi';
import { UNSPLASH } from '../../api/clientApi';
import './ClientAuthPage.css';

export default function ClientRegisterPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', confirmPassword:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Register — Hotel Management'; }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError(lang==='vi'?'Mật khẩu xác nhận không khớp.':'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ ...form, fullName: `${form.firstName} ${form.lastName}` });
      navigate('/client-login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="c-auth-page">
      <div className="c-auth-page__hero" style={{ backgroundImage:`url('${UNSPLASH.lobby}')` }} aria-hidden="true">
        <div className="c-auth-page__hero-overlay" />
        <div className="c-auth-page__hero-content">
          <Hotel size={36} strokeWidth={1.5} style={{ color:'#fff', marginBottom:16 }} />
          <h2 className="display-sm" style={{ color:'#fff', fontFamily:'var(--font-serif)' }}>Hotel Management</h2>
          <p className="body-lg" style={{ color:'rgba(255,255,255,0.82)', maxWidth:320, marginTop:12 }}>
            {lang==='vi'?'Tham gia ngay để nhận ưu đãi thành viên độc quyền.':'Join now to unlock exclusive member benefits.'}
          </p>
        </div>
      </div>

      <div className="c-auth-page__form-side">
        <div className="c-auth-form">
          <div style={{ marginBottom:'var(--sp-32)' }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:'var(--sp-10, 0.625rem)', textDecoration:'none', color:'var(--c-primary)', marginBottom:'var(--sp-32)' }}>
              <Hotel size={22} strokeWidth={1.5} />
              <span style={{ fontFamily:'var(--font-serif)', fontSize:'var(--text-title-lg)' }}>Hotel Management</span>
            </Link>
            <h1 className="headline-lg" style={{ color:'var(--c-primary)', fontFamily:'var(--font-serif)', marginBottom:'var(--sp-8)' }}>{t('auth.registerTitle')}</h1>
            <p className="text-muted body-lg">{t('auth.registerSubtitle')}</p>
          </div>

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-10, 0.625rem)', background:'#fee2e2', color:'var(--c-error)', padding:'var(--sp-12) var(--sp-16)', borderRadius:'var(--r-lg)', marginBottom:'var(--sp-20)', fontFamily:'var(--font-sans)', fontSize:'var(--text-label-lg)' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'var(--sp-20)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-16)' }}>
              <div className="input-tray">
                <label htmlFor="reg-first">{t('auth.firstName')} *</label>
                <input id="reg-first" type="text" required value={form.firstName} onChange={e=>set('firstName',e.target.value)} />
              </div>
              <div className="input-tray">
                <label htmlFor="reg-last">{t('auth.lastName')} *</label>
                <input id="reg-last" type="text" required value={form.lastName} onChange={e=>set('lastName',e.target.value)} />
              </div>
            </div>
            <div className="input-tray">
              <label htmlFor="reg-email">{t('auth.email')} *</label>
              <input id="reg-email" type="email" required value={form.email} onChange={e=>set('email',e.target.value)} />
            </div>
            <div className="input-tray">
              <label htmlFor="reg-phone">{t('auth.phone')}</label>
              <input id="reg-phone" type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} />
            </div>
            <div className="input-tray">
              <label htmlFor="reg-pw">{t('auth.password')} *</label>
              <div style={{ position:'relative' }}>
                <input id="reg-pw" type={showPw?'text':'password'} required value={form.password} onChange={e=>set('password',e.target.value)} style={{ paddingRight:48 }} minLength={6} />
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--c-on-surface-variant)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="input-tray">
              <label htmlFor="reg-confirm">{t('auth.confirmPassword')} *</label>
              <input id="reg-confirm" type="password" required value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit-btn" style={{ padding:'var(--sp-16)', fontSize:'var(--text-body-md)' }}>
              {loading ? (lang==='vi'?'Đang đăng ký...':'Creating account...') : t('auth.registerBtn')}
            </button>
          </form>

          <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', color:'var(--c-on-surface-variant)', marginTop:'var(--sp-24)', textAlign:'center' }}>
            {t('auth.hasAccount')}{' '}
            <Link to="/client-login" style={{ color:'var(--c-primary)', fontWeight:700 }} id="go-to-login-link">{t('auth.loginBtn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
