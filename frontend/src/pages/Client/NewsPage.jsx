import { Link } from 'react-router-dom';
import './NewsPage.css';

const MOCK_NEWS = [
  {
    id: '1',
    title: 'Hương Vị Mùa Hè: Khám Phá Thực Đơn Mới Tại Nhà Hàng Ocean Bleu',
    category: 'Ẩm Thực',
    date: '12 Tháng 8, 2026',
    excerpt: 'Lấy cảm hứng từ những nguyên liệu tươi ngon nhất của vùng biển địa phương, Bếp trưởng Alain giới thiệu một bản giao hưởng ẩm thực mới đánh thức mọi giác quan.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '2',
    title: 'Nghệ Thuật Cân Bằng: Gói Trị Liệu Wellness "Zen & Sea"',
    category: 'Sức Khỏe',
    date: '05 Tháng 8, 2026',
    excerpt: 'Tái tạo năng lượng và tìm lại sự bình yên nội tại với liệu trình spa kết hợp âm thanh sóng biển và tinh dầu thiên nhiên.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: '3',
    title: 'L\'Horizon Vinh Dự Nhận Giải Thưởng "Kiến Trúc Bền Vững 2026"',
    category: 'Giải Thưởng',
    date: '28 Tháng 7, 2026',
    excerpt: 'Một cột mốc đáng tự hào khi cam kết bảo vệ môi trường và thiết kế hòa hợp với thiên nhiên của chúng tôi được vinh danh.',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1000'
  }
];

function NewsPage() {
  return (
    <div className="news-page">
      <header className="page-hero">
        <div className="hero-text-container">
          <h1 className="display-lg">Tạp Chí L'Horizon</h1>
          <p className="body-lg">
            Khám phá những câu chuyện về phong cách sống, ẩm thực, và nghệ thuật nghỉ dưỡng.
          </p>
        </div>
      </header>

      <div className="news-container">
        {MOCK_NEWS.map((news, index) => (
          <article 
            key={news.id} 
            className={`news-card ${index % 2 !== 0 ? 'news-card-reverse' : ''}`}
          >
            <div className="news-image-wrapper">
              <Link to={`/news/${news.id}`}>
                <img src={news.image} alt={news.title} />
              </Link>
            </div>
            <div className="news-content">
              <div className="news-meta">
                <span className="news-category">{news.category}</span>
                <span className="news-date">{news.date}</span>
              </div>
              <Link to={`/news/${news.id}`} className="news-title-link">
                <h2 className="headline-lg">{news.title}</h2>
              </Link>
              <p className="body-lg">{news.excerpt}</p>
              <Link to={`/news/${news.id}`} className="btn-tertiary">
                Đọc toàn bộ bài viết
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default NewsPage;
