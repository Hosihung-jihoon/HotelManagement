import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { getArticleBySlug, MOCK_ARTICLES } from '../../api/clientApi';
import { Calendar, User, ArrowLeft } from 'lucide-react';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog — Hotel Management';
    getArticleBySlug(slug)
      .then(res => setArticle(res.data || MOCK_ARTICLES[0]))
      .catch(() => setArticle(MOCK_ARTICLES[0]))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ paddingTop:120, display:'flex', justifyContent:'center' }}><div className="skeleton" style={{ width:720, height:600, borderRadius:'1rem' }} /></div>;
  if (!article) return null;

  const title   = lang === 'vi' ? article.titleVi   || article.title   : article.title;
  const excerpt = lang === 'vi' ? article.excerptVi || article.excerpt : article.excerpt;

  return (
    <div style={{ paddingTop:'72px', paddingBottom:'var(--sp-80)', background:'var(--c-surface)', minHeight:'100vh' }}>
      <div className="container" style={{ maxWidth:'var(--max-w-prose)', padding:'var(--sp-40) var(--sp-24)' }}>
        <Link to="/blog" className="btn btn-ghost btn-sm" style={{ marginBottom:'var(--sp-24)' }} id="back-to-blog-btn">
          <ArrowLeft size={15} /> {t('blog.backToBlog')}
        </Link>

        {article.categoryName && <span className="badge" style={{ background:'var(--c-primary)', color:'var(--c-on-primary)', marginBottom:'var(--sp-16)' }}>{article.categoryName}</span>}

        <h1 className="display-md" style={{ color:'var(--c-primary)', fontFamily:'var(--font-serif)', marginBottom:'var(--sp-16)' }}>{title}</h1>

        <div style={{ display:'flex', gap:'var(--sp-20)', marginBottom:'var(--sp-32)', flexWrap:'wrap' }}>
          {article.authorName && <span style={{ display:'flex', alignItems:'center', gap:'var(--sp-6)', fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', color:'var(--c-on-surface-variant)' }}><User size={13}/> {article.authorName}</span>}
          {article.publishedAt && <span style={{ display:'flex', alignItems:'center', gap:'var(--sp-6)', fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', color:'var(--c-on-surface-variant)' }}><Calendar size={13}/> {new Date(article.publishedAt).toLocaleDateString()}</span>}
        </div>

        {(article.thumbnail || article.thumbnailUrl) && (
          <img src={article.thumbnail || article.thumbnailUrl} alt={title} style={{ width:'100%', height:360, objectFit:'cover', borderRadius:'var(--r-2xl)', marginBottom:'var(--sp-40)' }} />
        )}

        <div className="body-lg" style={{ color:'var(--c-on-surface-variant)', lineHeight:1.9, fontFamily:'var(--font-sans)' }}>
          <p style={{ marginBottom:'var(--sp-24)' }}>{excerpt}</p>
          <p style={{ marginBottom:'var(--sp-24)' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>

        <div style={{ marginTop:'var(--sp-48)', paddingTop:'var(--sp-24)', borderTop:'1px solid rgba(196,198,209,0.2)' }}>
          <h2 className="title-lg" style={{ color:'var(--c-primary)', fontFamily:'var(--font-serif)', marginBottom:'var(--sp-20)' }}>{t('blog.relatedPosts')}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-20)' }}>
            {MOCK_ARTICLES.slice(1,3).map(a => (
              <Link key={a.id} to={`/blog/${a.slug}`} style={{ textDecoration:'none' }} id={`related-${a.id}`}>
                <div className="card" style={{ overflow:'hidden' }}>
                  <img src={a.thumbnail} alt={a.title} style={{ width:'100%', height:140, objectFit:'cover' }} />
                  <div style={{ padding:'var(--sp-16)' }}>
                    <p style={{ fontFamily:'var(--font-sans)', fontWeight:600, color:'var(--c-on-surface)', fontSize:'var(--text-body-md)' }}>
                      {lang === 'vi' ? a.titleVi || a.title : a.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
