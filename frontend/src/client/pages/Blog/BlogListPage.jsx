import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getPublicArticles, MOCK_ARTICLES } from '../../api/clientApi';
import { Calendar, User, Clock, Search, ArrowRight } from 'lucide-react';
import './BlogListPage.css';

export default function BlogListPage() {
  const { t, lang } = useLang();
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');

  useEffect(() => {
    document.title = 'Blog — Hotel Management';
    getPublicArticles({ pageSize: 12 })
      .then(res => setArticles(res.data?.items || res.data || MOCK_ARTICLES))
      .catch(() => setArticles(MOCK_ARTICLES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a => {
    if (!query) return true;
    const title = (lang === 'vi' ? a.titleVi || a.title : a.title).toLowerCase();
    return title.includes(query.toLowerCase());
  });

  return (
    <div className="c-blog-list" style={{ paddingTop:'72px' }}>
      <div className="c-blog-list__hero">
        <div className="container">
          <p className="label-md" style={{ color:'var(--c-primary-fixed-dim)', marginBottom:'var(--sp-12)' }}>Our Stories</p>
          <h1 className="display-md" style={{ color:'var(--c-on-primary)', marginBottom:'var(--sp-16)' }}>{t('blog.title')}</h1>
          <p className="body-lg" style={{ color:'rgba(255,255,255,0.82)', marginBottom:'var(--sp-32)', maxWidth:500 }}>{t('blog.subtitle')}</p>
          <div className="c-blog-list__search">
            <Search size={18} strokeWidth={1.5} />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
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
          {loading ? (
            <div className="c-blog-grid">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height:200 }} />
                  <div style={{ padding:'20px 24px 24px' }}>
                    <div className="skeleton" style={{ height:20, width:'60%', marginBottom:12 }} />
                    <div className="skeleton" style={{ height:16, marginBottom:8 }} />
                    <div className="skeleton" style={{ height:16, width:'80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="c-blog-grid">
              {filtered.map(a => (
                <article key={a.id} className="c-blog-card card" id={`blog-${a.id}`}>
                  <div className="c-blog-card__img-wrap">
                    <img src={a.thumbnail || a.thumbnailUrl} alt={lang==='vi'?a.titleVi||a.title:a.title} className="c-blog-card__img" loading="lazy" />
                    {a.categoryName && <span className="c-blog-card__cat badge">{a.categoryName}</span>}
                  </div>
                  <div className="c-blog-card__body">
                    <div className="c-blog-card__meta">
                      <span><Calendar size={12}/> {new Date(a.publishedAt).toLocaleDateString()}</span>
                      {a.authorName && <span><User size={12}/> {a.authorName}</span>}
                      {a.readTime && <span><Clock size={12}/> {a.readTime} min</span>}
                    </div>
                    <h2 className="c-blog-card__title headline-md">{lang==='vi'?a.titleVi||a.title:a.title}</h2>
                    <p className="c-blog-card__excerpt body-lg text-muted">{lang==='vi'?a.excerptVi||a.excerpt:a.excerpt}</p>
                    <Link to={`/blog/${a.slug||a.id}`} className="c-blog-card__read-more btn btn-ghost btn-sm" id={`blog-read-${a.id}`}>
                      {t('blog.readMore')} <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
