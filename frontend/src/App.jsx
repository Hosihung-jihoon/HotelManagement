import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import RoomTypesPage from './pages/RoomTypes/RoomTypesPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import ArticlesPage from './pages/Articles/ArticlesPage';
import ArticleDetailPage from './pages/Articles/ArticleDetailPage';
import AttractionsPage from './pages/Attractions/AttractionsPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';

/**
 * App chính - Cấu hình routing.
 * Team thêm Route mới ở đây khi hoàn thành trang.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Dashboard - sẽ làm sau */}
          <Route path="/" element={<div style={{padding: '20px'}}><h2>📊 Dashboard</h2><p>Trang Dashboard sẽ được phát triển ở Sprint 4.</p></div>} />
          
          {/* === Trang mẫu - RoomTypes (Leader) === */}
          <Route path="/room-types" element={<RoomTypesPage />} />
          
          {/* === Các trang khác - Team sẽ thêm === */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/attractions" element={<AttractionsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          {/* <Route path="/rooms" element={<RoomsPage />} />           // J1 */}
          {/* <Route path="/bookings" element={<BookingsPage />} />     // M1 */}
          {/* <Route path="/invoices" element={<InvoicesPage />} />     // M2 */}
          {/* <Route path="/services" element={<ServicesPage />} />     // J2 */}
          {/* <Route path="/amenities" element={<AmenitiesPage />} />   // J2 */}
          {/* <Route path="/users" element={<UsersPage />} />           // L  */}
          {/* <Route path="/vouchers" element={<VouchersPage />} />     // M1 */}
          {/* <Route path="/memberships" element={<MembershipsPage />} /> // J2 */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
