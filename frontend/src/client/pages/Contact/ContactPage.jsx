import { useState, useEffect } from 'react';
import { useLang } from '../../i18n/LangContext';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';

export default function ContactPage() {
  const { lang } = useLang();
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [sent, setSent] = useState(false);

  useEffect(() => { document.title = 'Contact — Hotel Management'; }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    setSent(true);
    setForm({ name:'', email:'', phone:'', subject:'', message:'' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div style={{ paddingTop:'72px', paddingBottom:'var(--sp-80)', background:'var(--c-surface)', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,var(--c-primary),var(--c-primary-container))', padding:'var(--sp-64) var(--sp-24)' }}>
        <div className="container">
          <h1 className="display-md" style={{ color:'var(--c-on-primary)', marginBottom:'var(--sp-12)' }}>{lang==='vi'?'Liên hệ chúng tôi':'Contact Us'}</h1>
          <p className="body-lg" style={{ color:'rgba(255,255,255,0.82)' }}>{lang==='vi'?'Chúng tôi luôn sẵn sàng hỗ trợ bạn.':'We are always here to assist you.'}</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'var(--sp-48)', alignItems:'start' }}>
            {/* Contact info */}
            <div>
              <h2 className="title-lg" style={{ fontFamily:'var(--font-serif)', color:'var(--c-primary)', marginBottom:'var(--sp-24)' }}>
                {lang==='vi'?'Thông tin liên lạc':'Contact Information'}
              </h2>
              {[
                { icon:<MapPin size={20} strokeWidth={1.5}/>, text:'123 Lê Lợi, Q.1, TP.HCM' },
                { icon:<Phone size={20} strokeWidth={1.5}/>,  text:'+84 28 1234 5678' },
                { icon:<Mail size={20} strokeWidth={1.5}/>,   text:'info@hotelmanagement.vn' },
                { icon:<Clock size={20} strokeWidth={1.5}/>,  text:'24/7' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'var(--sp-16)', marginBottom:'var(--sp-20)' }}>
                  <div style={{ width:44, height:44, borderRadius:'var(--r-lg)', background:'var(--c-secondary-container)', color:'var(--c-primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {item.icon}
                  </div>
                  <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-body-lg)', color:'var(--c-on-surface)', paddingTop:10 }}>{item.text}</p>
                </div>
              ))}

              {/* Map placeholder */}
              <div style={{ marginTop:'var(--sp-32)', borderRadius:'var(--r-2xl)', overflow:'hidden', height:240, background:'var(--c-surface-container)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <p className="text-muted label-md">Google Maps Embed</p>
              </div>
            </div>

            {/* Contact form */}
            <div className="card" style={{ padding:'var(--sp-32)' }}>
              <h2 className="title-lg" style={{ fontFamily:'var(--font-serif)', color:'var(--c-primary)', marginBottom:'var(--sp-24)' }}>
                {lang==='vi'?'Gửi tin nhắn':'Send a Message'}
              </h2>
              {sent && (
                <div style={{ background:'#dcfce7', color:'var(--c-success)', padding:'var(--sp-12) var(--sp-16)', borderRadius:'var(--r-lg)', marginBottom:'var(--sp-20)', fontFamily:'var(--font-sans)', fontWeight:600 }}>
                  ✓ {lang==='vi'?'Tin nhắn đã được gửi thành công!':'Message sent successfully!'}
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'var(--sp-20)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-20)' }}>
                  <div className="input-tray">
                    <label htmlFor="ct-name">{lang==='vi'?'Họ tên':'Full Name'} *</label>
                    <input id="ct-name" type="text" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="input-tray">
                    <label htmlFor="ct-email">Email *</label>
                    <input id="ct-email" type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
                  </div>
                </div>
                <div className="input-tray">
                  <label htmlFor="ct-subject">{lang==='vi'?'Tiêu đề':'Subject'}</label>
                  <input id="ct-subject" type="text" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} />
                </div>
                <div className="input-tray">
                  <label htmlFor="ct-message">{lang==='vi'?'Nội dung':'Message'} *</label>
                  <textarea id="ct-message" required rows={5} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{ resize:'vertical', minHeight:120 }} />
                </div>
                <button type="submit" className="btn btn-primary" id="contact-submit-btn">
                  <Send size={16} /> {lang==='vi'?'Gửi tin nhắn':'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
