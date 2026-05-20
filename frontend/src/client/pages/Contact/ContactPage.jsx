import { useState, useEffect, useMemo } from 'react';
import { useLang } from '../../i18n/LangContext';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';
import { getPublicBranches, submitContactRequest } from '../../api/clientApi';

export default function ContactPage() {
  const { lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Contact â€” Hotel Management';
    getPublicBranches()
      .then((res) => {
        setBranches(res.data || []);
        setError('');
      })
      .catch(() => {
        setBranches([]);
        setError('Khong the tai thong tin lien he chi nhanh.');
      })
      .finally(() => setLoading(false));
  }, []);

  const mainBranch = useMemo(
    () => branches.find((branch) => branch.isMain) || branches[0] || null,
    [branches]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitContactRequest(form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Khong the gui yeu cau lien he.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactRows = [
    { icon: <MapPin size={20} strokeWidth={1.5} />, text: mainBranch?.address || 'Dang cap nhat dia chi' },
    { icon: <Phone size={20} strokeWidth={1.5} />, text: mainBranch?.phone || 'Dang cap nhat so dien thoai' },
    { icon: <Mail size={20} strokeWidth={1.5} />, text: 'info@hotelmanagement.vn' },
    { icon: <Clock size={20} strokeWidth={1.5} />, text: '24/7' },
  ];

  return (
    <div style={{ paddingTop: '72px', paddingBottom: 'var(--sp-80)', background: 'var(--c-surface)', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--c-primary),var(--c-primary-container))', padding: 'var(--sp-64) var(--sp-24)' }}>
        <div className="container">
          <h1 className="display-md" style={{ color: 'var(--c-on-primary)', marginBottom: 'var(--sp-12)' }}>{lang === 'vi' ? 'Lien he chung toi' : 'Contact Us'}</h1>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.82)' }}>{lang === 'vi' ? 'Gui yeu cau callback hoac thong tin can ho tro, chung toi se phan hoi som nhat.' : 'Send your callback request and we will respond as soon as possible.'}</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--sp-48)', alignItems: 'start' }}>
            <div>
              <h2 className="title-lg" style={{ fontFamily: 'var(--font-serif)', color: 'var(--c-primary)', marginBottom: 'var(--sp-24)' }}>
                {lang === 'vi' ? 'Thong tin lien lac' : 'Contact Information'}
              </h2>

              {error && <div className="error-banner">{error}</div>}

              {contactRows.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-16)', marginBottom: 'var(--sp-20)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--r-lg)', background: 'var(--c-secondary-container)', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body-lg)', color: 'var(--c-on-surface)', paddingTop: 10 }}>{item.text}</p>
                </div>
              ))}

              <div style={{ marginTop: 'var(--sp-32)', borderRadius: 'var(--r-2xl)', overflow: 'hidden', height: 240, background: 'var(--c-surface-container)' }}>
                {mainBranch?.mapEmbedLink ? (
                  <iframe
                    title="Hotel branch map"
                    src={mainBranch.mapEmbedLink}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p className="text-muted label-md">{loading ? 'Dang tai ban do...' : 'Chua co ban do chi nhanh'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--sp-32)' }}>
              <h2 className="title-lg" style={{ fontFamily: 'var(--font-serif)', color: 'var(--c-primary)', marginBottom: 'var(--sp-24)' }}>
                {lang === 'vi' ? 'Gui yeu cau lien he' : 'Send a Contact Request'}
              </h2>
              {sent && (
                <div style={{ background: '#dcfce7', color: 'var(--c-success)', padding: 'var(--sp-12) var(--sp-16)', borderRadius: 'var(--r-lg)', marginBottom: 'var(--sp-20)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  ✓ {lang === 'vi' ? 'Yeu cau da duoc gui thanh cong!' : 'Request submitted successfully!'}
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-20)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-20)' }}>
                  <div className="input-tray">
                    <label htmlFor="ct-name">{lang === 'vi' ? 'Ho ten' : 'Full Name'} *</label>
                    <input id="ct-name" type="text" required value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="ct-email">Email *</label>
                    <input id="ct-email" type="email" required value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-20)' }}>
                  <div className="input-tray">
                    <label htmlFor="ct-phone">{lang === 'vi' ? 'So dien thoai' : 'Phone'}</label>
                    <input id="ct-phone" type="text" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="ct-subject">{lang === 'vi' ? 'Tieu de' : 'Subject'}</label>
                    <input id="ct-subject" type="text" value={form.subject} onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))} />
                  </div>
                </div>
                <div className="input-tray">
                  <label htmlFor="ct-message">{lang === 'vi' ? 'Noi dung' : 'Message'} *</label>
                  <textarea id="ct-message" required rows={5} value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} style={{ resize: 'vertical', minHeight: 120 }} />
                </div>
                <button type="submit" className="btn btn-primary" id="contact-submit-btn" disabled={submitting}>
                  <Send size={16} /> {submitting ? (lang === 'vi' ? 'Dang gui...' : 'Sending...') : (lang === 'vi' ? 'Gui yeu cau' : 'Send Request')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
