import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import AboutUsPage from './pages/AboutUs/AboutUsPage';
import ServicesPage from './pages/Services/ServicesPage';
import MembershipsPage from './pages/Memberships/MembershipsPage';
import './App.css';

// Glassmorphic Navbar following The Atmospheric Horizon guidelines
function GlassNavbar() {
  const location = useLocation();
  
  return (
    <nav className="glass-navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">LUXURY HOTEL</Link>
        </div>
        <div className="nav-links">
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link>
          <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>Services</Link>
          <Link to="/memberships" className={location.pathname === '/memberships' ? 'active' : ''}>Memberships</Link>
        </div>
        <div className="nav-actions">
          <button className="btn-primary">Book Now</button>
        </div>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <GlassNavbar />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/about" replace />} />
        
        <Route path="/about" element={
          <Layout>
            <AboutUsPage />
          </Layout>
        } />
        
        <Route path="/services" element={
          <Layout>
            <ServicesPage />
          </Layout>
        } />
        
        <Route path="/memberships" element={
          <Layout>
            <MembershipsPage />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
