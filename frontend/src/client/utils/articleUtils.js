export function stripHtml(html = '') {
  if (!html) return '';
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function deriveExcerpt(content = '', maxLength = 160) {
  const plainText = stripHtml(content);
  if (!plainText) return '';
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trim()}...`;
}

export function estimateReadTime(content = '') {
  const plainText = stripHtml(content);
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  if (!wordCount) return null;
  return Math.max(1, Math.ceil(wordCount / 180));
}

export function normalizePublicArticle(article) {
  if (!article) return article;

  return {
    ...article,
    thumbnailUrl: article.thumbnailUrl || article.thumbnail,
    thumbnail: article.thumbnailUrl || article.thumbnail,
    excerpt: article.excerpt || deriveExcerpt(article.content),
    readTime: article.readTime || estimateReadTime(article.content),
  };
}
