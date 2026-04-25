import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import RoomDetailPage from './pages/RoomDetailPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import LoginPage from './pages/LoginPage';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no footer/navbar layout */}
          <Route path="/login" element={<LoginPage />} />

          {/* Client pages */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/rooms" element={<Layout><SearchResultsPage /></Layout>} />
          <Route path="/rooms/:id" element={<Layout><RoomDetailPage /></Layout>} />
          <Route path="/booking-confirmation/:id" element={<Layout><BookingConfirmationPage /></Layout>} />

          {/* Fallback */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      paddingTop: 'var(--nav-h)',
      color: 'var(--clr-on-surface-variant)',
    }}>
      <span style={{ fontSize: '4rem' }}>404</span>
      <h1 className="headline-md" style={{ color: 'var(--clr-on-surface)' }}>Trang không tồn tại</h1>
      <a href="/" style={{ color: 'var(--clr-primary)', textDecoration: 'underline' }}>Về trang chủ</a>
    </div>
  );
}
