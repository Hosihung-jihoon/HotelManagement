import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Search, ArrowRight, User } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { getPublicArticles } from '../../api/clientApi';
import './BlogListPage.css';

export default function BlogListPage() {
  const { t, lang } = useLang();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Blog - Hotel Management';
    getPublicArticles({ pageSize: 12 })
      .then((res) => {
        setArticles(res.data || []);
        setError('');
      })
      .catch(() => {
        setArticles([]);
        setError('Khong the tai danh sach bai viet luc nay.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => (
    ['all', ...new Set(articles.map((article) => article.categoryName).filter(Boolean))]
  ), [articles]);

  const filtered = articles.filter((article) => {
    const title = String(lang === 'vi' ? article.titleVi || article.title : article.title).toLowerCase();
    const categoryMatch = activeCategory === 'all' || article.categoryName === activeCategory;
    const queryMatch = !query || title.includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  });

  return (
    <div className="c-blog-list" style={{ paddingTop: '72px' }}>
      <div className="c-blog-list__hero">
        <div className="container">
          <p className="label-md" style={{ color: 'var(--c-primary-fixed-dim)', marginBottom: 'var(--sp-12)' }}>Our Stories</p>
          <h1 className="display-md" style={{ color: 'var(--c-on-primary)', marginBottom: 'var(--sp-16)' }}>{t('blog.title')}</h1>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,0.82)', marginBottom: 'var(--sp-32)', maxWidth: 500 }}>{t('blog.subtitle')}</p>
          <div className="c-blog-list__search">
            <Search size={18} strokeWidth={1.5} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('blog.searchPlaceholder')}
              className="c-blog-list__search-input"
              aria-label={t('blog.searchPlaceholder')}
              id="blog-search-input"
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {error && <div className="error-banner">{error}</div>}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--sp-24)' }}>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`c-filter-chip ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'all' ? 'Tat ca' : category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="c-blog-grid">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="card">
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="c-blog-grid">
              {filtered.map((article) => (
                <Link
                  to={`/blog/${article.slug || article.id}`}
                  key={article.id}
                  className="c-blog-card card"
                  id={`blog-${article.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="c-blog-card__img-wrap">
                    <img
                      src={article.thumbnailUrl || article.thumbnail}
                      alt={lang === 'vi' ? article.titleVi || article.title : article.title}
                      className="c-blog-card__img"
                      loading="lazy"
                    />
                    {article.categoryName && <span className="c-blog-card__cat badge">{article.categoryName}</span>}
                  </div>
                  <div className="c-blog-card__body">
                    <div className="c-blog-card__meta">
                      <span><Calendar size={12} /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                      {article.authorName && <span><User size={12} /> {article.authorName}</span>}
                      {article.readTime && <span><Clock size={12} /> {article.readTime} min</span>}
                    </div>
                    <h2 className="c-blog-card__title headline-md">{lang === 'vi' ? article.titleVi || article.title : article.title}</h2>
                    <p className="c-blog-card__excerpt body-lg text-muted">{lang === 'vi' ? article.excerptVi || article.excerpt : article.excerpt}</p>
                    <span className="c-blog-card__read-more btn btn-ghost btn-sm" id={`blog-read-${article.id}`}>
                      {t('blog.readMore')} <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="c-empty-state">
              <p className="body-lg text-muted">Khong co bai viet phu hop.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
