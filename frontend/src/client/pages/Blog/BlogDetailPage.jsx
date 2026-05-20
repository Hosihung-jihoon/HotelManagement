import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { getArticleBySlug, getPublicArticles } from '../../api/clientApi';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Blog - Hotel Management';
    Promise.all([
      getArticleBySlug(slug),
      getPublicArticles({ pageSize: 12 }),
    ])
      .then(([articleRes, relatedRes]) => {
        const currentArticle = articleRes.data || null;
        const all = relatedRes.data || [];
        setArticle(currentArticle);
        setRelatedArticles(all);
        setError('');
      })
      .catch(() => {
        setArticle(null);
        setRelatedArticles([]);
        setError('Khong the tai noi dung bai viet.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const related = useMemo(() => {
    if (!article) return [];
    return relatedArticles
      .filter((item) => item.slug !== article.slug && item.id !== article.id)
      .sort((a, b) => {
        const aScore = (a.categoryName && a.categoryName === article.categoryName ? 2 : 0) + (a.attractionName && a.attractionName === article.attractionName ? 1 : 0);
        const bScore = (b.categoryName && b.categoryName === article.categoryName ? 2 : 0) + (b.attractionName && b.attractionName === article.attractionName ? 1 : 0);
        return bScore - aScore;
      })
      .slice(0, 2);
  }, [article, relatedArticles]);

  if (loading) {
    return (
      <div style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 720, height: 600, borderRadius: '1rem' }} />
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ paddingTop: '72px', paddingBottom: 'var(--sp-80)' }}>
        <div className="container" style={{ maxWidth: 'var(--max-w-prose)', padding: 'var(--sp-40) var(--sp-24)' }}>
          {error && <div className="error-banner">{error}</div>}
          <div className="c-empty-state">
            <p className="body-lg text-muted">Khong tim thay bai viet.</p>
          </div>
        </div>
      </div>
    );
  }

  const title = lang === 'vi' ? article.titleVi || article.title : article.title;
  const excerpt = lang === 'vi' ? article.excerptVi || article.excerpt : article.excerpt;

  return (
    <div style={{ paddingTop: '72px', paddingBottom: 'var(--sp-80)', background: 'var(--c-surface)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 'var(--max-w-prose)', padding: 'var(--sp-40) var(--sp-24)' }}>
        <Link to="/blog" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-24)' }} id="back-to-blog-btn">
          <ArrowLeft size={15} /> {t('blog.backToBlog')}
        </Link>

        {article.categoryName && <span className="badge" style={{ background: 'var(--c-primary)', color: 'var(--c-on-primary)', marginBottom: 'var(--sp-16)' }}>{article.categoryName}</span>}

        <h1 className="display-md" style={{ color: 'var(--c-primary)', fontFamily: 'var(--font-serif)', marginBottom: 'var(--sp-16)' }}>{title}</h1>

        <div style={{ display: 'flex', gap: 'var(--sp-20)', marginBottom: 'var(--sp-32)', flexWrap: 'wrap' }}>
          {article.authorName && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', color: 'var(--c-on-surface-variant)' }}><User size={13} /> {article.authorName}</span>}
          {article.publishedAt && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', color: 'var(--c-on-surface-variant)' }}><Calendar size={13} /> {new Date(article.publishedAt).toLocaleDateString()}</span>}
          {article.readTime && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', color: 'var(--c-on-surface-variant)' }}><Clock size={13} /> {article.readTime} min</span>}
          {article.attractionName && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', color: 'var(--c-on-surface-variant)' }}><MapPin size={13} /> {article.attractionName}</span>}
        </div>

        {(article.thumbnailUrl || article.thumbnail) && (
          <img src={article.thumbnailUrl || article.thumbnail} alt={title} style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 'var(--r-2xl)', marginBottom: 'var(--sp-40)' }} />
        )}

        <div className="body-lg" style={{ color: 'var(--c-on-surface-variant)', lineHeight: 1.9, fontFamily: 'var(--font-sans)' }}>
          {excerpt && <p style={{ marginBottom: 'var(--sp-24)' }}>{excerpt}</p>}
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p>Article content is unavailable.</p>
          )}
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 'var(--sp-48)', paddingTop: 'var(--sp-24)', borderTop: '1px solid rgba(196,198,209,0.2)' }}>
            <h2 className="title-lg" style={{ color: 'var(--c-primary)', fontFamily: 'var(--font-serif)', marginBottom: 'var(--sp-20)' }}>{t('blog.relatedPosts')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-20)' }}>
              {related.map((relatedArticle) => (
                <Link key={relatedArticle.id} to={`/blog/${relatedArticle.slug}`} style={{ textDecoration: 'none' }} id={`related-${relatedArticle.id}`}>
                  <div className="card" style={{ overflow: 'hidden' }}>
                    <img src={relatedArticle.thumbnailUrl || relatedArticle.thumbnail} alt={relatedArticle.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    <div style={{ padding: 'var(--sp-16)' }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--c-on-surface)', fontSize: 'var(--text-body-md)' }}>
                        {lang === 'vi' ? relatedArticle.titleVi || relatedArticle.title : relatedArticle.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
