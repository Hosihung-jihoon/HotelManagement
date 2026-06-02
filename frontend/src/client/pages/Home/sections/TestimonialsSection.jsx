import { useState } from 'react';
import { useLang } from '../../../i18n/LangContext';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import './TestimonialsSection.css';

const TESTIMONIALS = [
  { id:1, name:'Sarah Mitchell',   country:'🇺🇸 United States', rating:5,
    text:'An extraordinary experience from check-in to check-out. The staff went above and beyond to make our anniversary stay unforgettable. The room was immaculate and the view breathtaking.',
    textVi:'Trải nghiệm tuyệt vời từ khi nhận phòng đến trả phòng. Nhân viên vượt mức mong đợi để làm chuyến kỷ niệm của chúng tôi thêm ý nghĩa.',
    role:'Travel Blogger', stayedAt:'Suite Penthouse' },
  { id:2, name:'Nguyễn Văn Minh',  country:'🇻🇳 Việt Nam',      rating:5,
    text:'Khách sạn tuyệt vời với dịch vụ đẳng cấp. Phòng sạch sẽ, rộng rãi và tiện nghi. Nhân viên thân thiện và chuyên nghiệp. Chắc chắn sẽ quay lại lần sau!',
    textVi:'Khách sạn tuyệt vời với dịch vụ đẳng cấp. Phòng sạch sẽ, rộng rãi và tiện nghi. Nhân viên thân thiện và chuyên nghiệp.',
    role:'Doanh nhân', stayedAt:'Phòng Deluxe King' },
  { id:3, name:'James Chen',       country:'🇸🇬 Singapore',     rating:5,
    text:'Best hotel in the city without question. The spa is world-class, the restaurant serves phenomenal food, and the infinity pool view is simply stunning. Worth every penny.',
    textVi:'Khách sạn tốt nhất thành phố. Spa đẳng cấp thế giới, nhà hàng phục vụ đồ ăn tuyệt vời, và hồ bơi vô cực có tầm nhìn tuyệt đẹp.',
    role:'Business Consultant', stayedAt:'Premier Suite' },
  { id:4, name:'Marie Dubois',     country:'🇫🇷 France',        rating:5,
    text:'We stayed for our honeymoon and it was perfect. Every detail was thoughtfully arranged. The rose petals, champagne welcome, and spectacular city views made it magical.',
    textVi:'Chúng tôi ở đây trong tuần trăng mật và mọi thứ đều hoàn hảo. Mỗi chi tiết đều được sắp xếp chu đáo với cánh hoa hồng, rượu champagne và tầm nhìn thành phố ngoạn mục.',
    role:'Graphic Designer', stayedAt:'Honeymoon Suite' },
];

function StarRating({ rating }) {
  return (
    <div className="c-stars" aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={15} fill={i <= rating ? '#c9a84c' : 'none'} color="#c9a84c" strokeWidth={1.5} />
      ))}
    </div>
  );
}

function TestimonialsSection() {
  const { t: translate, lang } = useLang();
  const [current, setCurrent] = useState(0);
  const total = TESTIMONIALS.length;

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  const item = TESTIMONIALS[current];

  return (
    <section className="section c-testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="c-section-header">
          <p className="label-md text-muted c-section-eyebrow">{translate('home.testimonialsEyebrow')}</p>
          <h2 className="display-md c-section-title" id="testimonials-title" style={{ color: 'var(--c-on-primary)' }}>
            {translate('home.testimonialsTitle')}
          </h2>
        </div>

        <div className="c-testimonials__carousel">
          <button className="c-testimonials__arrow c-testimonials__arrow--prev" onClick={prev} aria-label="Previous review" id="testimonials-prev-btn">
            <ChevronLeft size={22} />
          </button>

          <div className="c-testimonials__card glass" key={current}>
            <Quote size={40} className="c-testimonials__quote-icon" />
            <p className="c-testimonials__text body-lg">{lang === 'vi' ? (item.textVi || item.text) : item.text}</p>
            <div className="c-testimonials__footer">
              <div className="c-testimonials__avatar" aria-hidden="true">
                {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="c-testimonials__name title-lg">{item.name}</p>
                <p className="c-testimonials__meta">
                  {item.country} · {lang === 'vi' ? (item.role === 'Travel Blogger' ? 'Travel Blogger' : item.role === 'Business Consultant' ? 'Cố vấn kinh doanh' : item.role === 'Graphic Designer' ? 'Thiết kế đồ họa' : item.role) : item.role}
                </p>
                <StarRating rating={item.rating} />
              </div>
              <div className="c-testimonials__stayed">
                <span className="badge badge-silver">{lang === 'vi' ? (item.stayedAt === 'Suite Penthouse' ? 'Căn hộ Penthouse' : item.stayedAt === 'Premier Suite' ? 'Phòng Suite Thượng Hạng' : item.stayedAt === 'Honeymoon Suite' ? 'Phòng Trăng Mật' : item.stayedAt) : item.stayedAt}</span>
              </div>
            </div>
          </div>

          <button className="c-testimonials__arrow c-testimonials__arrow--next" onClick={next} aria-label="Next review" id="testimonials-next-btn">
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dots */}
        <div className="c-testimonials__dots" role="tablist" aria-label="Review navigation">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`c-testimonials__dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Review ${i + 1}`}
              role="tab"
              aria-selected={i === current}
              id={`testimonial-dot-${i}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
