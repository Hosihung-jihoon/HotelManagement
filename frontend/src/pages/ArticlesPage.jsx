import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import '../styles/editorial.css';
import styles from './ArticlesPage.module.css';

const ArticlesPage = () => {
  // Mock data initialized in state
  const initialCategories = [
    { id: 1, name: 'Du lịch' },
    { id: 2, name: 'Ẩm thực' },
    { id: 3, name: 'Sự kiện' },
    { id: 4, name: 'Khuyến mãi' },
    { id: 5, name: 'Trải nghiệm' }
  ];

  const initialArticles = [
    {
      id: 1,
      title: '10 Điểm Đến Không Thể Bỏ Qua Khi Đến Thành Phố',
      summary: 'Khám phá những địa điểm tuyệt vời nhất xung quanh khách sạn, từ danh lam thắng cảnh đến những góc phố ẩn mình đầy thú vị.',
      content: 'Nội dung chi tiết về các điểm đến...',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      categoryId: 1,
      author: 'Nguyễn Văn A',
      createdAt: '2026-04-20T10:00:00',
      views: 1250
    },
    {
      id: 2,
      title: 'Bí Quyết Chọn Phòng Khách Sạn Hoàn Hảo Cho Kỳ Nghỉ',
      summary: 'Hướng dẫn chi tiết giúp bạn lựa chọn loại phòng phù hợp nhất với nhu cầu và ngân sách của mình.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      categoryId: 5,
      author: 'Trần Thị B',
      createdAt: '2026-04-18T14:30:00',
      views: 980
    },
    {
      id: 3,
      title: 'Khám Phá Ẩm Thực Địa Phương: Top 5 Món Ăn Phải Thử',
      summary: 'Từ món ăn đường phố đến nhà hàng cao cấp, đây là những trải nghiệm ẩm thực không thể bỏ lỡ.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      categoryId: 2,
      author: 'Lê Văn C',
      createdAt: '2026-04-15T09:15:00',
      views: 1450
    },
    {
      id: 4,
      title: 'Ưu Đãi Mùa Hè: Giảm Giá Lên Đến 40% Cho Tất Cả Phòng',
      summary: 'Đặt phòng ngay hôm nay để tận hưởng mức giá ưu đãi đặc biệt trong mùa hè này.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      categoryId: 4,
      author: 'Phạm Thị D',
      createdAt: '2026-04-12T16:45:00',
      views: 2100
    },
    {
      id: 5,
      title: 'Sự Kiện Gala Dinner: Một Đêm Đáng Nhớ Tại Khách Sạn',
      summary: 'Tham gia cùng chúng tôi trong buổi tiệc tối sang trọng với menu đặc biệt từ đầu bếp nổi tiếng.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=800&q=80',
      categoryId: 3,
      author: 'Hoàng Văn E',
      createdAt: '2026-04-10T11:20:00',
      views: 850
    },
    {
      id: 6,
      title: 'Spa & Wellness: Thư Giãn Hoàn Toàn Tại Trung Tâm Chăm Sóc Sức Khỏe',
      summary: 'Trải nghiệm các liệu trình spa cao cấp được thiết kế riêng để mang lại sự thư giãn tối đa.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
      categoryId: 5,
      author: 'Nguyễn Thị F',
      createdAt: '2026-04-08T13:00:00',
      views: 720
    },
    {
      id: 7,
      title: 'Hướng Dẫn Du Lịch: Lịch Trình 3 Ngày 2 Đêm Hoàn Hảo',
      summary: 'Lên kế hoạch cho chuyến đi của bạn với lịch trình chi tiết từ chúng tôi, bao gồm tất cả các điểm đến must-see.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      categoryId: 1,
      author: 'Đỗ Văn G',
      createdAt: '2026-04-05T08:30:00',
      views: 1680
    },
    {
      id: 8,
      title: 'Bữa Sáng Buffet: Khởi Đầu Ngày Mới Với Năng Lượng',
      summary: 'Thực đơn buffet phong phú với hơn 50 món ăn từ Á đến Âu, phục vụ từ 6:30 - 10:00 hàng ngày.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1533777324565-a040eb52facd?w=800&q=80',
      categoryId: 2,
      author: 'Vũ Thị H',
      createdAt: '2026-04-03T07:00:00',
      views: 920
    },
    {
      id: 9,
      title: 'Chương Trình Khách Hàng Thân Thiết: Tích Điểm Nhận Quà',
      summary: 'Tham gia chương trình loyalty của chúng tôi để nhận được nhiều ưu đãi và phần quà hấp dẫn.',
      content: 'Nội dung chi tiết...',
      imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=80',
      categoryId: 4,
      author: 'Bùi Văn I',
      createdAt: '2026-04-01T15:45:00',
      views: 1100
    }
  ];

  const [articles, setArticles] = useState(initialArticles);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await client.get('/articles');
      if (response.data && response.data.length > 0) {
        setArticles(response.data);
      }
    } catch (error) {
      console.log('Using mock data for articles');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await client.get('/articlecategories');
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      }
    } catch (error) {
      console.log('Using mock data for categories');
    }
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.categoryId === parseInt(selectedCategory));

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.page}>
      {/* Hero - Atmospheric Depth */}
      <section className="editorial-hero">
        <div className="editorial-hero-content">
          <h1 className="display-lg">Tin Tức & Câu Chuyện</h1>
          <p className="body-lg">
            Khám phá những trải nghiệm độc đáo, bí quyết du lịch và câu chuyện đằng sau mỗi khoảnh khắc
          </p>
        </div>
      </section>

      <div className="editorial-container">
        {/* Category Filter - Ghost Border */}
        <div className="editorial-filter">
          <button
            className={`editorial-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Tất cả
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`editorial-filter-btn ${selectedCategory === category.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id.toString())}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Articles Grid - Asymmetrical Layout */}
        {loading ? (
          <div className="editorial-loading">
            <div className="editorial-spinner"></div>
            <p className="body-md" style={{ color: 'var(--clr-on-surface-variant)' }}>
              Đang tải bài viết...
            </p>
          </div>
        ) : (
          <>
            <div className="editorial-grid">
              {currentArticles.map(article => (
                <Link 
                  key={article.id} 
                  to={`/articles/${article.id}`}
                  className={styles.articleCard}
                >
                  <div className={styles.imageWrapper}>
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="editorial-image"
                    />
                    <span className={styles.categoryBadge}>
                      {categories.find(cat => cat.id === article.categoryId)?.name || 'Khác'}
                    </span>
                  </div>
                  <div className={styles.content}>
                    <div className="editorial-meta">
                      <span>📅 {formatDate(article.createdAt)}</span>
                      <span>•</span>
                      <span>✍️ {article.author || 'Admin'}</span>
                      <span>•</span>
                      <span>👁️ {article.views || 0} lượt xem</span>
                    </div>
                    <h3 className="headline-md" style={{ marginBottom: 'var(--sp-3)', color: 'var(--clr-on-surface)' }}>
                      {article.title}
                    </h3>
                    <p className="body-md" style={{ color: 'var(--clr-on-surface-variant)', marginBottom: 'var(--sp-4)' }}>
                      {article.summary || article.content?.substring(0, 120) + '...'}
                    </p>
                    <span className={styles.readMore}>
                      Đọc thêm →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className="editorial-btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  ← Trước
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={currentPage === index + 1 ? 'editorial-btn-primary' : 'editorial-btn-secondary'}
                    onClick={() => setCurrentPage(index + 1)}
                    style={{ minWidth: '48px' }}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  className="editorial-btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
