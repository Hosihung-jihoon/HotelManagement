import React, { useState } from 'react';
import './ReviewsPage.css';

const mockReviews = [
  {
    id: 1,
    guestName: 'Eleanor Shellstrop',
    roomType: 'Presidential Suite',
    rating: 5,
    date: 'Oct 24, 2023',
    comment: 'The absolute best stay I have ever had! The staff was incredibly accommodating and the spa was life-changing.',
    status: 'Replied'
  },
  {
    id: 2,
    guestName: 'Chidi Anagonye',
    roomType: 'Deluxe Room',
    rating: 4,
    date: 'Oct 22, 2023',
    comment: 'Very comfortable room and great amenities. The only issue was the Wi-Fi being a bit slow in the evening, but otherwise perfect.',
    status: 'Pending'
  },
  {
    id: 3,
    guestName: 'Tahani Al-Jamil',
    roomType: 'Ocean View Villa',
    rating: 5,
    date: 'Oct 20, 2023',
    comment: 'Exquisite! The decor is absolutely stunning. I felt like royalty the entire time.',
    status: 'Replied'
  },
  {
    id: 4,
    guestName: 'Jason Mendoza',
    roomType: 'Standard Room',
    rating: 3,
    date: 'Oct 18, 2023',
    comment: 'It was okay. The pool was dope but the DJ played slow songs.',
    status: 'Pending'
  }
];

const renderStars = (rating) => {
  return "⭐".repeat(rating) + "☆".repeat(5 - rating);
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState(mockReviews);

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <div className="header-info">
          <h1>Guest Reviews</h1>
          <p>Monitor feedback to maintain our 5-star reputation.</p>
        </div>
        
        <div className="rating-summary">
          <div className="rating-score">
            <h2>4.2</h2>
            <p>Out of 5</p>
          </div>
          <div className="rating-stars">
            ⭐⭐⭐⭐☆
            <p>Based on 128 Reviews</p>
          </div>
        </div>
      </div>

      <div className="reviews-filters">
        <button className="filter-chip active">All Reviews</button>
        <button className="filter-chip">5 Stars</button>
        <button className="filter-chip">4 Stars</button>
        <button className="filter-chip">Needs Reply</button>
      </div>

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-card-header">
              <div className="guest-info">
                <div className="guest-avatar">
                  {review.guestName.charAt(0)}
                </div>
                <div>
                  <h4>{review.guestName}</h4>
                  <span className="room-type">{review.roomType}</span>
                </div>
              </div>
              <div className="review-meta">
                <span className="review-date">{review.date}</span>
                <span className={`reply-status ${review.status.toLowerCase()}`}>
                  {review.status}
                </span>
              </div>
            </div>
            
            <div className="review-stars">
              {renderStars(review.rating)}
            </div>
            
            <p className="review-comment">"{review.comment}"</p>
            
            <div className="review-actions">
              {review.status === 'Pending' ? (
                <button className="reply-btn primary">💬 Reply to Guest</button>
              ) : (
                <button className="reply-btn secondary">✏️ Edit Reply</button>
              )}
              <button className="feature-btn">🌟 Feature on Website</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
