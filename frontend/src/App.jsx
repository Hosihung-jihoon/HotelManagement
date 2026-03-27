import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import RoomTypesPage from './pages/RoomTypes/RoomTypesPage';
import UsersPage from './pages/Users/UsersPage';
import RolesPage from './pages/Roles/RolesPage';

// Customer Pages
import CustomerLayout from './components/Layout/CustomerLayout';
import CheckoutPage from './pages/Customer/Checkout/CheckoutPage';
import BookingHistoryPage from './pages/Customer/BookingHistory/BookingHistoryPage';

/**
 * App chính - Cấu hình routing.
 * Team thêm Route mới ở đây khi hoàn thành trang.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === Luồng Khách hàng (Customer) === */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={
            <div style={{padding: '40px', textAlign: 'center'}}>
              <h2>🏨 Chào mừng đến với Khách sạn</h2>
              <p>Trang chủ dành cho khách (Sprint sau)</p>
              <div style={{marginTop: 20}}>
                <Link to="/checkout" className="btn btn-primary" style={{marginRight: 10}}>Giả lập Lưu trú & Thanh toán</Link>
                <Link to="/my-bookings" className="btn btn-secondary">Xem lịch sử của tôi</Link>
              </div>
            </div>
          } />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/my-bookings" element={<BookingHistoryPage />} />
        </Route>

        <Route element={<MainLayout />}>
          {/* Dashboard - sẽ làm sau */}
          <Route path="/admin" element={<div style={{padding: '20px'}}><h2>📊 Dashboard</h2><p>Trang Dashboard sẽ được phát triển ở Sprint 4.</p></div>} />
          
          {/* === Trang mẫu - RoomTypes (Leader) === */}
          <Route path="/room-types" element={<RoomTypesPage />} />
          
          {/* === Nhân sự & Phân quyền === */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          
          {/* === Các trang khác - Team sẽ thêm === */}
          {/* <Route path="/rooms" element={<RoomsPage />} />           // J1 */}
          {/* <Route path="/bookings" element={<BookingsPage />} />     // M1 */}
          {/* <Route path="/invoices" element={<InvoicesPage />} />     // M2 */}
          {/* <Route path="/services" element={<ServicesPage />} />     // J2 */}
          {/* <Route path="/amenities" element={<AmenitiesPage />} />   // J2 */}
          {/* <Route path="/articles" element={<ArticlesPage />} />     // J3 */}
          {/* <Route path="/reviews" element={<ReviewsPage />} />       // J3 */}
          {/* <Route path="/users" element={<UsersPage />} />           // L  */}
          {/* <Route path="/vouchers" element={<VouchersPage />} />     // M1 */}
          {/* <Route path="/memberships" element={<MembershipsPage />} /> // J2 */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
