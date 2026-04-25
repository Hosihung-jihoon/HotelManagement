import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ReviewsSection.module.css';

const ReviewsSection = ({ roomId = null }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockReviews = [
        {
          id: 1,
          userName: 'Nguyễn Văn A',
          rating: 5,
          comment: 'Khách sạn tuyệt vời! Phòng sạch sẽ, nhân viên thân thiện. Tôi sẽ quay lại lần sau.',
          roomName: 'Deluxe Room',
          createdAt: '2026-04-20T10:00:00'
        },
        {
          id: 2,
          userName: 'Trần Thị B',
          rating: 4,
          comment: 'Vị trí thuận tiện, view đẹp. Giá cả hợp lý. Chỉ có điều bữa sáng hơi ít món.',
          roomName: 'Superior Room',
          createdAt: '2026-04-18T14:30:00'
        },
        {
          id: 3,
          userName: 'Lê Văn C',
          rating: 5,
          comment: 'Dịch vụ xuất sắc! Phòng rộng rãi, tiện nghi đầy đủ. Rất đáng tiền.',
          roomName: 'Suite Room',
          createdAt: '2026-04-15T09:15:00'
        },
        {
          id: 4,
          userName: 'Phạm Thị D',
          rating: 4,
          comment: 'Khách sạn đẹp, nhân viên nhiệt tình. Bãi đỗ xe hơi nhỏ một chút.',
          roomName: 'Standard Room',
          createdAt: '2026-04-12T16:45:00'
        }
      ];
      
      setReviews(mockReviews);
      calculateStats(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    if (reviewsData.length === 0) return;

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const average = (sum / total).toFixed(1);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      distribution[review.rating]++;
    });

    setStats({ average, total, distribution });
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>⭐ Đánh Giá Từ Khách Hàng</h2>
          <p>Những trải nghiệm thực tế từ khách đã lưu trú</p>
        </div>

        {reviews.length > 0 ? (
          <>
            {/* Stats Section */}
            <div className={styles.statsSection}>
              <div className={styles.overallRating}>
                <div className={styles.ratingNumber}>{stats.average}</div>
                <div className={styles.stars}>{renderStars(Math.round(stats.average))}</div>
                <div className={styles.totalReviews}>Dựa trên {stats.total} đánh giá</div>
              </div>

              <div className={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.distribution[rating];
                  const percentage = (count / stats.total) * 100;
                  return (
                    <div key={rating} className={styles.ratingBar}>
                      <div className={styles.ratingLabel}>{rating} ⭐</div>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.barFill} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className={styles.barCount}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className={styles.reviewsList}>
              {reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {getInitials(review.userName)}
                      </div>
                      <div>
                        <div className={styles.userName}>{review.userName}</div>
                        <div className={styles.reviewDate}>{formatDate(review.createdAt)}</div>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      <span className={styles.ratingStars}>{renderStars(review.rating)}</span>
                      <span className={styles.ratingValue}>{review.rating}/5</span>
                    </div>
                  </div>
                  <p className={styles.reviewContent}>{review.comment}</p>
                  {review.roomName && (
                    <div className={styles.roomInfo}>🏨 {review.roomName}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.noReviews}>
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
