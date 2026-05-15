import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { UNSPLASH, getRooms, getPublicLocations, getPublicArticles } from '../../api/clientApi';
import HeroSection from './sections/HeroSection';
import FeaturedRoomsSection from './sections/FeaturedRoomsSection';
import MembershipSection from './sections/MembershipSection';
import TestimonialsSection from './sections/TestimonialsSection';
import AttractionsPreviewSection from './sections/AttractionsPreviewSection';
import BlogPreviewSection from './sections/BlogPreviewSection';
import './HomePage.css';

function HomePage() {
  const [rooms,       setRooms]       = useState([]);
  const [locations,   setLocations]   = useState([]);
  const [articles,    setArticles]    = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    document.title = 'Hotel Management — Luxury Stays';

    // Fetch rooms
    getRooms({ pageSize: 6, status: 'Available' })
      .then(res => setRooms(res.data?.items || res.data || []))
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));

    // Fetch locations
    getPublicLocations({ pageSize: 6 })
      .then(res => setLocations(res.data?.items || res.data || []))
      .catch(() => setLocations([]));

    // Fetch articles
    getPublicArticles({ pageSize: 3 })
      .then(res => setArticles(res.data?.items || res.data || []))
      .catch(() => setArticles([]));
  }, []);

  return (
    <div className="c-home">
      <HeroSection />
      <FeaturedRoomsSection rooms={rooms} loading={loadingRooms} />
      <MembershipSection />
      <TestimonialsSection />
      <AttractionsPreviewSection locations={locations} />
      <BlogPreviewSection articles={articles} />
    </div>
  );
}

export default HomePage;
