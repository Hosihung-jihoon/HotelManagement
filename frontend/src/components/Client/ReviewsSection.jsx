import { Star } from 'lucide-react';
import './ReviewsSection.css';

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Eleanor Vance',
    role: 'Travel Blogger',
    rating: 5,
    text: "Một trải nghiệm vượt ngoài sự mong đợi. Sự chú ý đến từng chi tiết trong thiết kế của L'Horizon thực sự biến kỳ nghỉ thành một hành trình thưởng thức cái đẹp. Bữa sáng tuyệt hảo và nhân viên cực kỳ chuyên nghiệp.",
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 2,
    name: 'James Harrington',
    role: 'Architect',
    rating: 5,
    text: "Sự kết hợp hoàn hảo giữa kiến trúc tối giản và cảnh quan thiên nhiên. Không gian mở cho phép ánh sáng tự nhiên lan tỏa khắp phòng. Đây là khách sạn đẹp nhất tôi từng lưu trú tại khu vực này.",
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 3,
    name: 'Sophia Laurent',
    role: 'Guest',
    rating: 5,
    text: "Cảm giác bình yên thực sự. Từ lúc bước vào tiền sảnh cho đến khi tận hưởng dịch vụ spa, mọi thứ đều toát lên vẻ sang trọng tinh tế không phô trương. Chắc chắn sẽ quay lại vào mùa hè tới.",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  }
];

function ReviewsSection() {
  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h2 className="headline-lg">Tiếng Vọng Từ<br/>Những Vị Khách</h2>
        <p className="body-lg">
          Trải nghiệm của bạn là nguồn cảm hứng bất tận để chúng tôi hoàn thiện nghệ thuật hiếu khách mỗi ngày.
        </p>
      </div>

      <div className="reviews-grid">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-rating">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" stroke="currentColor" />
              ))}
            </div>
            <p className="review-text">"{review.text}"</p>
            <div className="review-author">
              <img src={review.avatar} alt={review.name} className="author-avatar" />
              <div className="author-info">
                <span className="author-name">{review.name}</span>
                <span className="author-role">{review.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReviewsSection;
