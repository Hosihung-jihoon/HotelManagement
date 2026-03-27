import React, { useState } from 'react';
import './AttractionsPage.css';

const mockAttractions = [
  {
    id: 1,
    name: 'Ancient Temple Ruins',
    distance: '2.5 km',
    category: 'Historical',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Explore the breathtaking ruins of a 10th-century temple discovered in the deep forest.'
  },
  {
    id: 2,
    name: 'Crystal Clear Bay',
    distance: '0.8 km',
    category: 'Nature',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'A pristine beach with crystal clear waters perfect for diving and snorkeling.'
  },
  {
    id: 3,
    name: 'Downtown Night Market',
    distance: '5.0 km',
    category: 'Shopping & Food',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Experience local culture, street food, and vibrant nightlife at the famous downtown market.'
  },
  {
    id: 4,
    name: 'Mountain Peak Trail',
    distance: '12 km',
    category: 'Adventure',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'A challenging but rewarding hiking trail leading to the highest peak in the region.'
  }
];

const AttractionsPage = () => {
  const [attractions, setAttractions] = useState(mockAttractions);

  return (
    <div className="attractions-page">
      <div className="page-header">
        <div className="header-info">
          <h1>Local Attractions</h1>
          <p>Curate the best experiences around the hotel for our guests.</p>
        </div>
        <button className="add-attraction-btn">
          ➕ Add Attraction
        </button>
      </div>

      <div className="attractions-grid">
        {attractions.map(attr => (
          <div key={attr.id} className="attraction-card">
            <div className="attr-image" style={{ backgroundImage: `url(${attr.image})` }}>
              <span className="attr-category">{attr.category}</span>
            </div>
            
            <div className="attr-content">
              <div className="attr-header">
                <h3>{attr.name}</h3>
                <span className="attr-rating">★ {attr.rating}</span>
              </div>
              
              <p className="attr-distance">📍 {attr.distance} from Hotel</p>
              <p className="attr-desc">{attr.description}</p>
              
              <div className="attr-actions">
                <button className="attr-btn edit">✏️ Edit</button>
                <button className="attr-btn delete">🗑️ Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttractionsPage;
