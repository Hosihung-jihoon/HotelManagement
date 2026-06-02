import { Link } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import './BlogPreviewSection.css';

const FALLBACK_THUMBNAIL = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80';

function BlogPreviewSection({ articles }) {
  const { t, lang } = useLang();
  const items = (articles && articles.length > 0) ? articles.slice(0, 3) : [];

  return (
    <section className="section c-blog-preview" aria-labelledby="blog-title">
      <div className="container">
        <div className="c-section-header">
          <p className="label-md text-muted c-section-eyebrow">{t('home.blogEyebrow')}</p>
          <h2 className="display-md c-section-title" id="blog-title">{t('blog.title')}</h2>
          <p className="body-lg text-muted c-section-subtitle">{t('blog.subtitle')}</p>
        </div>

        <div className="c-blog-preview__grid">
          {items.length > 0 ? items.map((article, i) => (
            <Link to={`/blog/${article.slug || article.id}`} key={article.id} className={`c-blog-card card ${i === 0 ? 'c-blog-card--featured' : ''}`} id={`blog-card-${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="c-blog-card__img-wrap">
                <img
                  src={article.thumbnailUrl || article.thumbnail || FALLBACK_THUMBNAIL}
                  alt={lang === 'vi' ? (article.titleVi || article.title) : article.title}
                  className="c-blog-card__img"
                  loading="lazy"
                />
                {article.categoryName && (
                  <span className="c-blog-card__cat badge">{article.categoryName}</span>
                )}
              </div>
              <div className="c-blog-card__body">
                <div className="c-blog-card__meta">
                  <span><Calendar size={12} strokeWidth={1.5} /> {new Date(article.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {article.authorName && <span><User size={12} strokeWidth={1.5} /> {article.authorName}</span>}
                  {article.readTime && <span><Clock size={12} strokeWidth={1.5} /> {article.readTime} min</span>}
                </div>
                <h3 className="c-blog-card__title headline-md">
                  {lang === 'vi' ? (article.titleVi || article.title) : article.title}
                </h3>
                <p className="c-blog-card__excerpt body-lg text-muted">
                  {lang === 'vi' ? (article.excerptVi || article.excerpt) : article.excerpt}
                </p>
                <span
                  className="c-blog-card__read-more btn btn-ghost btn-sm"
                  id={`blog-read-${article.id}`}
                >
                  {t('blog.readMore')} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          )) : (
            <div className="c-empty-state" style={{ gridColumn: '1 / -1' }}>
              <p className="body-lg text-muted">{t('home.noBlogs')}</p>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--sp-40)' }}>
          <Link to="/blog" className="btn btn-secondary btn-lg" id="view-all-blog-btn">
            {t('common.viewAll')} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BlogPreviewSection;
