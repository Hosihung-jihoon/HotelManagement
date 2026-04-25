import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className="display-lg">Liên Hệ Với Chúng Tôi</h1>
          <p className="body-lg">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 để mang lại trải nghiệm tuyệt vời nhất.</p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Contact Info & Form */}
        <div className={styles.contentGrid}>
          {/* Contact Information */}
          <div className={styles.contactInfo}>
            <h2 className="headline-lg">Thông Tin Liên Hệ</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <MapPin size={24} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Địa chỉ</h3>
                  <p>123 Đường Nguyễn Huệ, Quận 1<br />Thành phố Hồ Chí Minh, Việt Nam</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <Phone size={24} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Điện thoại</h3>
                  <p>
                    Hotline: <a href="tel:+84123456789">+84 123 456 789</a><br />
                    Fax: +84 123 456 790
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <Mail size={24} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Email</h3>
                  <p>
                    Đặt phòng: <a href="mailto:booking@hotelmanagement.com">booking@hotelmanagement.com</a><br />
                    Hỗ trợ: <a href="mailto:support@hotelmanagement.com">support@hotelmanagement.com</a>
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <Clock size={24} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Giờ làm việc</h3>
                  <p>
                    Lễ tân: 24/7<br />
                    Văn phòng: 8:00 - 22:00 hàng ngày
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.contactForm}>
            <h2 className="headline-lg">Gửi Tin Nhắn</h2>
            
            {submitStatus === 'success' && (
              <div className={styles.successMessage}>
                <CheckCircle size={20} />
                <span>Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.</span>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                <span>Có lỗi xảy ra. Vui lòng thử lại sau.</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Họ và tên *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+84 123 456 789"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Chủ đề *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="booking">Đặt phòng</option>
                  <option value="support">Hỗ trợ kỹ thuật</option>
                  <option value="feedback">Góp ý</option>
                  <option value="complaint">Khiếu nại</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Nội dung *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : (
                  <>
                    <span>Gửi tin nhắn</span>
                    <Send size={18} style={{ marginLeft: '10px' }} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Google Maps */}
        <div className={styles.mapSection}>
          <h2 className="headline-lg">Vị Trí Của Chúng Tôi</h2>
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4967814570754!2d106.70291831533417!3d10.775015992321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0xb3ff69197b10ec4f!2zTmd1eeG7hW4gSHXhu4csIFF14bqtbiAxLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hotel Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
