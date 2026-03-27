import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock fetching article based on ID
  const article = {
    title: '5 Reasons to Visit Our Spa This Weekend',
    author: 'Admin',
    date: 'October 15, 2023',
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    content: `
      <p>Welcome to our newly renovated spa! If you are looking for the perfect getaway, look no further. Here are five reasons you absolutely must visit us this weekend:</p>
      
      <h3>1. New Thermal Pools</h3>
      <p>We've just installed state-of-the-art thermal pools that naturally regulate temperature based on your body heat. It's a surreal experience that deeply relaxes your muscles.</p>
      
      <h3>2. Essential Oil Therapies</h3>
      <p>Our expert masseuses are now trained in ancient essential oil therapies brought directly from Southeast Asia. Let the aroma heal your mind.</p>
      
      <h3>3. Organic Refreshments</h3>
      <p>Enjoy unlimited organic smoothies, detox teas, and fresh artisan salads between your sessions at our new Spa Lounge.</p>
      
      <blockquote>"The best spa experience I've had in a decade." - Jane Doe, Premium Member</blockquote>
      
      <h3>4. Peaceful Zen Garden</h3>
      <p>Take a walk in our newly landscaped Zen Garden. It's an electronics-free zone dedicated purely to meditation and silence.</p>
      
      <h3>5. Exclusive Weekend Discounts</h3>
      <p>For this weekend only, all guests who book a suite get a complimentary 60-minute massage session.</p>
      <p>Don't wait! Book your stay now and discover true relaxation.</p>
    `
  };

  return (
    <div className="article-detail-page">
      <button className="back-btn" onClick={() => navigate('/articles')}>
        ← Back to Articles
      </button>

      <div className="article-header">
        <span className="status-badge-detail">{article.status}</span>
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta-info">
          <div className="author-info">
            <span className="author-avatar">👤</span>
            <div>
              <strong>{article.author}</strong>
              <span>Author</span>
            </div>
          </div>
          <div className="publish-date">
            <span className="icon">📅</span>
            <span>{article.date}</span>
          </div>
        </div>
      </div>

      <div className="article-cover" style={{ backgroundImage: `url(${article.image})` }}></div>

      <div className="article-body">
        <div className="content-html" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
      
      <div className="article-footer">
        <button className="edit-article-btn">✏️ Edit this Article</button>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
