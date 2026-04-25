import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './ArticleDetailPage.module.css';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/articles/${id}`);
      setArticle(response.data);
      
      // Fetch related articles
      if (response.data.categoryId) {
        const relatedResponse = await axios.get(`/api/articles?categoryId=${response.data.categoryId}`);
        setRelatedArticles(relatedResponse.data.filter(a => a.id !== parseInt(id)).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.notFound}>
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/articles" className={styles.backBtn}>← Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className={styles.articleDetailPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/articles">Tin tức</Link>
          <span>/</span>
          <span>{article.title}</span>
        </div>
      </div>

      {/* Article Header */}
      <article className={styles.articleHeader}>
        <div className={styles.container}>
          <div className={styles.categoryBadge}>{article.category?.name || 'Tin tức'}</div>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.meta}>
            <span className={styles.date}>📅 {formatDate(article.createdAt)}</span>
            <span className={styles.author}>✍️ {article.author || 'Admin'}</span>
            <span className={styles.views}>👁️ {article.views || 0} lượt xem</span>
          </div>
        </div>
      </article>

      {/* Featured Image */}
      {article.imageUrl && (
        <div className={styles.featuredImage}>
          <img src={article.imageUrl} alt={article.title} />
        </div>
      )}

      {/* Article Content */}
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.mainContent}>
            {article.summary && (
              <div className={styles.summary}>
                <strong>Tóm tắt:</strong> {article.summary}
              </div>
            )}
            
            <div 
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className={styles.tags}>
                <strong>Tags:</strong>
                {article.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Share Buttons */}
            <div className={styles.shareSection}>
              <h3>Chia sẻ bài viết</h3>
              <div className={styles.shareButtons}>
                <button className={styles.shareBtn} onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}>
                  📘 Facebook
                </button>
                <button className={styles.shareBtn} onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.title}`, '_blank')}>
                  🐦 Twitter
                </button>
                <button className={styles.shareBtn} onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  🔗 Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className={styles.relatedSection}>
                <h3>Bài viết liên quan</h3>
                <div className={styles.relatedArticles}>
                  {relatedArticles.map(related => (
                    <Link 
                      key={related.id} 
                      to={`/articles/${related.id}`}
                      className={styles.relatedCard}
                    >
                      <img src={related.imageUrl || '/placeholder-article.jpg'} alt={related.title} />
                      <div className={styles.relatedContent}>
                        <h4>{related.title}</h4>
                        <span className={styles.relatedDate}>{formatDate(related.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className={styles.newsletter}>
              <h3>📧 Đăng ký nhận tin</h3>
              <p>Nhận thông tin mới nhất về ưu đãi và tin tức từ chúng tôi</p>
              <form className={styles.newsletterForm}>
                <input type="email" placeholder="Email của bạn" required />
                <button type="submit">Đăng ký</button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
