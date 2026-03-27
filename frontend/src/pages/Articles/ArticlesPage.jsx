import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ArticlesPage.css';

const mockArticles = [
  {
    id: 1,
    title: '5 Reasons to Visit Our Spa This Weekend',
    excerpt: 'Discover ultimate relaxation with our newly upgraded spa facilities...',
    author: 'Admin',
    date: '2023-10-15',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    title: 'Top 10 Local Attractions Near the Hotel',
    excerpt: 'Make the most of your stay by visiting these amazing local spots...',
    author: 'Editor Team',
    date: '2023-10-10',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    title: 'Introducing Our New Menu at The Grand Restaurant',
    excerpt: 'Our Michelin-star chef has curated a brand new seasonal menu...',
    author: 'Chef Gordon',
    date: '2023-10-05',
    status: 'Draft',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  }
];

const ArticlesPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(mockArticles);

  return (
    <div className="articles-page">
      <div className="page-header">
        <div className="header-info">
          <h1>News & Articles</h1>
          <p>Manage your hotel blog and latest news updates.</p>
        </div>
        <button className="create-btn">
          ✨ Write New Article
        </button>
      </div>

      <div className="articles-grid">
        {articles.map(article => (
          <div className="article-card" key={article.id}>
            <div className="article-image" style={{ backgroundImage: `url(${article.image})` }}>
              <span className={`status-badge ${article.status.toLowerCase()}`}>
                {article.status}
              </span>
            </div>
            <div className="article-content">
              <h3>{article.title}</h3>
              <p className="excerpt">{article.excerpt}</p>
              
              <div className="article-meta">
                <span className="author">✍️ {article.author}</span>
                <span className="date">📅 {article.date}</span>
              </div>
              
              <div className="article-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  👁️ View Detail
                </button>
                <button className="action-btn edit-btn">
                  ✏️ Edit
                </button>
                <button className="action-btn delete-btn">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticlesPage;
