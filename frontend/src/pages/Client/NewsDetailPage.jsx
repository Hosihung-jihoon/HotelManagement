import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './NewsDetailPage.css';

// Using mock data for demonstration
const MOCK_ARTICLE = {
  id: '1',
  title: 'Hương Vị Mùa Hè: Khám Phá Thực Đơn Mới Tại Nhà Hàng Ocean Bleu',
  category: 'Ẩm Thực',
  date: '12 Tháng 8, 2026',
  author: 'Bếp trưởng Alain',
  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=2000',
  content: `
    <p>Mùa hè mang đến một nguồn năng lượng mới, và tại nhà hàng Ocean Bleu của L'Horizon, chúng tôi muốn truyền tải trọn vẹn sức sống đó qua từng món ăn. Thực đơn mới không chỉ là sự thay đổi về nguyên liệu, mà là một hành trình khám phá những hương vị tươi nguyên nhất từ biển cả và những trang trại hữu cơ địa phương.</p>
    
    <h3>Nghệ Thuật Của Sự Tinh Giản</h3>
    <p>Triết lý ẩm thực của chúng tôi luôn xoay quanh việc tôn vinh nguyên liệu nguyên bản. Thay vì sử dụng quá nhiều gia vị phức tạp, chúng tôi tập trung vào việc khơi dậy hương vị tự nhiên thông qua các kỹ thuật chế biến tối giản nhưng đòi hỏi sự chính xác tuyệt đối.</p>
    
    <blockquote>"Một món ăn ngon không phải là nơi đầu bếp phô diễn kỹ thuật, mà là nơi nguyên liệu cất tiếng nói của riêng mình." - Bếp trưởng Alain</blockquote>
    
    <p>Món cá tuyết áp chảo dùng kèm sốt bơ chanh thảo mộc là một ví dụ điển hình. Sự kết hợp giữa độ mềm ngọt của cá tuyết Đại Tây Dương và vị chua thanh mát của chanh vàng tạo nên một bản giao hưởng hài hòa trên vòm miệng.</p>
    
    <h3>Sự Kết Nối Với Thiên Nhiên</h3>
    <p>Chúng tôi tự hào hợp tác chặt chẽ với các ngư dân địa phương để đảm bảo hải sản luôn tươi mới mỗi ngày. Sự kết nối này không chỉ mang lại chất lượng món ăn tuyệt hảo mà còn thể hiện cam kết của L'Horizon trong việc phát triển bền vững và hỗ trợ cộng đồng.</p>
  `
};

function NewsDetailPage() {
  const { id } = useParams();
  // In a real app, you would fetch the article by ID
  const article = MOCK_ARTICLE; // Fallback to mock

  if (!article) return <div className="news-not-found">Bài viết không tồn tại.</div>;

  return (
    <div className="news-detail-page">
      {/* Hero Header with overlapping title */}
      <header className="article-hero">
        <div className="article-hero-image">
          <img src={article.image} alt={article.title} />
        </div>
        <div className="article-header-content">
          <Link to="/news" className="back-link">
            <ArrowLeft size={20} /> Trở về danh sách
          </Link>
          <div className="article-meta">
            <span className="article-category">{article.category}</span>
            <span className="article-date">{article.date}</span>
          </div>
          <h1 className="display-lg">{article.title}</h1>
        </div>
      </header>

      {/* Editorial Content */}
      <article className="article-body">
        <div className="article-author-info">
          <span>Bởi: <strong>{article.author}</strong></span>
        </div>
        <div 
          className="article-html-content body-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}

export default NewsDetailPage;
