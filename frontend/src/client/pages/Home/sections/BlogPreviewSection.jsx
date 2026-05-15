import { Link } from 'react-router-dom';
import { useLang } from '../../../i18n/LangContext';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { MOCK_ARTICLES } from '../../../api/clientApi';
import './BlogPreviewSection.css';

function BlogPreviewSection({ articles }) {
  const { t, lang } = useLang();
  const items = (articles && articles.length > 0) ? articles.slice(0, 3) : MOCK_ARTICLES;

  return (
    <section className="section c-blog-preview" aria-labelledby="blog-title">
      <div className="container">
        <div className="c-section-header">
          <p className="label-md text-muted c-section-eyebrow">Our Stories</p>
          <h2 className="display-md c-section-title" id="blog-title">{t('blog.title')}</h2>
          <p className="body-lg text-muted c-section-subtitle">{t('blog.subtitle')}</p>
        </div>

        <div className="c-blog-preview__grid">
          {items.map((article, i) => (
            <article key={article.id} className={`c-blog-card card ${i === 0 ? 'c-blog-card--featured' : ''}`} id={`blog-card-${article.id}`}>
              <div className="c-blog-card__img-wrap">
                <img
                  src={article.thumbnail || article.thumbnailUrl}
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
                  <span><Calendar size={12} strokeWidth={1.5} /> {new Date(article.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day:'2-digit', month:'short', year:'numeric' })}</span>
                  {article.authorName && <span><User size={12} strokeWidth={1.5} /> {article.authorName}</span>}
                  {article.readTime && <span><Clock size={12} strokeWidth={1.5} /> {article.readTime} min</span>}
                </div>
                <h3 className="c-blog-card__title headline-md">
                  {lang === 'vi' ? (article.titleVi || article.title) : article.title}
                </h3>
                <p className="c-blog-card__excerpt body-lg text-muted">
                  {lang === 'vi' ? (article.excerptVi || article.excerpt) : article.excerpt}
                </p>
                <Link
                  to={`/blog/${article.slug || article.id}`}
                  className="c-blog-card__read-more btn btn-ghost btn-sm"
                  id={`blog-read-${article.id}`}
                >
                  {t('blog.readMore')} <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
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
