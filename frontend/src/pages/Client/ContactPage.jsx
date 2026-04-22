import { useState } from 'react';
import './ContactPage.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 1000);
  };

  return (
    <div className="contact-page">
      <header className="page-hero">
        <div className="hero-text-container">
          <h1 className="display-lg">Liên Hệ</h1>
          <p className="body-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn trong mọi yêu cầu để đảm bảo kỳ nghỉ của bạn trở nên hoàn hảo nhất.
          </p>
        </div>
      </header>

      <div className="contact-container">
        <div className="contact-info">
          <h2 className="headline-lg">L'Horizon Hotel</h2>
          <div className="info-block">
            <h3>Địa chỉ</h3>
            <p>123 Đường Bờ Biển, Phường Đại Dương, Thành phố Biển, Việt Nam</p>
          </div>
          <div className="info-block">
            <h3>Liên hệ</h3>
            <p>Email: reservations@lhorizon.com</p>
            <p>Điện thoại: +84 123 456 789</p>
          </div>
          <div className="info-block">
            <h3>Giờ làm việc</h3>
            <p>Lễ tân 24/7</p>
            <p>Hỗ trợ đặt phòng: 08:00 - 22:00 hàng ngày</p>
          </div>
        </div>

        <div className="contact-form-container">
          {submitted ? (
            <div className="success-message">
              <h3 className="headline-lg">Cảm ơn bạn!</h3>
              <p className="body-lg">Tin nhắn của bạn đã được gửi. Đội ngũ của chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
              <button className="btn-secondary" onClick={() => setSubmitted(false)}>Gửi thêm tin nhắn</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group-client">
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder=" " 
                />
                <label htmlFor="name">Họ và tên</label>
              </div>
              <div className="form-row">
                <div className="form-group-client">
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    placeholder=" " 
                  />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="form-group-client">
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder=" " 
                  />
                  <label htmlFor="phone">Số điện thoại</label>
                </div>
              </div>
              <div className="form-group-client">
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  required 
                  placeholder=" " 
                  rows="4"
                ></textarea>
                <label htmlFor="message">Thông điệp của bạn</label>
              </div>
              <button type="submit" className="btn-primary">Gửi tin nhắn</button>
            </form>
          )}
        </div>
      </div>

      <div className="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15676.812644265481!2d106.68536815541991!3d10.795738800000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528cb9e6e8d2d%3A0xc09cb69f1092e4ab!2sLandmark%2081!5e0!3m2!1sen!2s!4v1714902103447!5m2!1sen!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="L'Horizon Location"
        ></iframe>
      </div>
    </div>
  );
}

export default ContactPage;
