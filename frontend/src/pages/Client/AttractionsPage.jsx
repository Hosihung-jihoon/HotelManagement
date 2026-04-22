import './AttractionsPage.css';

const ATTRACTIONS = [
  {
    id: 1,
    name: 'Vịnh San Hô Xanh',
    distance: '2km từ L\'Horizon',
    description: 'Khám phá thế giới đại dương đầy màu sắc dưới làn nước trong vắt. Một trải nghiệm lặn biển không thể bỏ lỡ dành cho những tâm hồn yêu thiên nhiên.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 2,
    name: 'Phố Cổ Bờ Biển',
    distance: '5km từ L\'Horizon',
    description: 'Tản bộ qua những con phố lát đá cuội nhuốm màu thời gian, thưởng thức hải sản địa phương tươi ngon và đắm chìm trong nền văn hóa bản địa độc đáo.',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 3,
    name: 'Đỉnh Gió Hú',
    distance: '12km từ L\'Horizon',
    description: 'Một hành trình leo núi ngắn dẫn đến đỉnh cao nhất khu vực, nơi bạn có thể ngắm nhìn toàn cảnh vịnh biển hùng vĩ từ trên cao.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000'
  }
];

function AttractionsPage() {
  return (
    <div className="attractions-page">
      <header className="page-hero">
        <div className="hero-text-container">
          <h1 className="display-lg">Khám Phá Xung Quanh</h1>
          <p className="body-lg">
            Vượt ra khỏi không gian tinh tế của L'Horizon, một thế giới tuyệt mỹ của thiên nhiên và văn hóa bản địa đang chờ bạn khám phá.
          </p>
        </div>
      </header>

      <div className="attractions-grid">
        {ATTRACTIONS.map((attraction, index) => (
          <div key={attraction.id} className="attraction-card">
            <div className="attraction-image">
              <img src={attraction.image} alt={attraction.name} />
              {/* Ghost border effect through an overlay instead of solid border */}
              <div className="image-overlay"></div>
            </div>
            <div className="attraction-content">
              <span className="attraction-distance">{attraction.distance}</span>
              <h2 className="headline-lg">{attraction.name}</h2>
              <p className="body-lg">{attraction.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttractionsPage;
