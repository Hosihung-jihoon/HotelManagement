import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RoomsPage from './pages/Rooms/RoomsPage';
import BookingsPage from './pages/Bookings/BookingsPage';
import UsersPage from './pages/Users/UsersPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import LossesPage from './pages/Losses/LossesPage';
import HousekeepingPage from './pages/Housekeeping/HousekeepingPage';
import RolesPage from './pages/Roles/RolesPage';
import RoomTypesPage from './pages/RoomTypes/RoomTypesPage';
import ArticlesPage from './pages/Articles/ArticlesPage';
import ArticleEditorPage from './pages/Articles/ArticleEditorPage';
import ArticleCategoriesPage from './pages/Articles/ArticleCategoriesPage';
import LocationsPage from './pages/Locations/LocationsPage';
import LocationMapPage from './pages/Locations/LocationMapPage';
import MembersPage from './pages/Members/MembersPage';
import VouchersPage from './pages/Vouchers/VouchersPage';
import AuditLogPage from './pages/AuditLog/AuditLogPage';
// Front Desk pages
import TodayArrivalsPage from './pages/FrontDesk/TodayArrivalsPage';
import CurrentGuestsPage from './pages/FrontDesk/CurrentGuestsPage';
import FrontDeskCheckoutPage from './pages/FrontDesk/CheckoutPage';
import CustomerCheckoutPage from './pages/Customer/Checkout/CheckoutPage';
import PaymentResultPage from './pages/Customer/Checkout/PaymentResultPage';

/**
 * App chính - Cấu hình routing với Auth & Private Routes.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* === Public Routes === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/payment-momo-result" element={<PaymentResultPage />} />
          <Route path="/checkout" element={<CustomerCheckoutPage />} />

          {/* === Private Routes (Admin) === */}
          <Route element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            {/* 1. Dashboard */}
            <Route path="/" element={<DashboardPage />} />

            {/* 2. Quản lý phòng */}
            <Route path="/rooms" element={<RoomsPage />} />

            {/* 3. Kho vật tư */}
            <Route path="/inventory" element={<InventoryPage />} />

            {/* 4. Thất thoát & đền bù */}
            <Route path="/losses" element={<LossesPage />} />

            {/* 5. Dọn phòng (Housekeeping) */}
            <Route path="/housekeeping" element={<HousekeepingPage />} />

            {/* 6. Booking */}
            <Route path="/bookings" element={<BookingsPage />} />

            {/* 7. Danh sách nhân sự */}
            <Route path="/users" element={<UsersPage />} />

            {/* 8. Vai trò & phân quyền */}
            <Route path="/roles" element={<RolesPage />} />

            {/* 9. Hạng phòng */}
            <Route path="/room-types" element={<RoomTypesPage />} />

            {/* 10. Địa điểm */}
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/locations/map" element={<LocationMapPage />} />

            {/* 11. Bài viết */}
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/categories" element={<ArticleCategoriesPage />} />
            <Route path="/articles/editor" element={<ArticleEditorPage />} />
            <Route path="/articles/editor/:id" element={<ArticleEditorPage />} />

            {/* 12. Thành viên */}
            <Route path="/members" element={<MembersPage />} />

            {/* 13. Voucher */}
            <Route path="/vouchers" element={<VouchersPage />} />

            {/* 14. Nhật ký hệ thống */}
            <Route path="/audit-logs" element={<AuditLogPage />} />

            {/* 15. Quầy lễ tân */}
            <Route path="/front-desk/today-arrivals" element={<TodayArrivalsPage />} />
            <Route path="/front-desk/current-guests" element={<CurrentGuestsPage />} />
            <Route path="/front-desk/checkout" element={<FrontDeskCheckoutPage />} />
            <Route path="/front-desk/bookings" element={<BookingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
