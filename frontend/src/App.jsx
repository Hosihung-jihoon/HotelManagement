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
import ArticleCategoriesPage from './pages/Articles/ArticleCategoriesPage';
import LocationsPage from './pages/Locations/LocationsPage';
import LocationMapPage from './pages/Locations/LocationMapPage';
import MembersPage from './pages/Members/MembersPage';

/**
 * App chính - Cấu hình routing với Auth & Private Routes.
 * 8 menu: Dashboard | Quản lý phòng | Kho vật tư | Thất thoát & đền bù
 *         Dọn phòng | Booking & Voucher | Danh sách nhân sự | Vai trò & phân quyền
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* === Public Routes === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />


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

            {/* 6. Booking & Voucher */}
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

            {/* 12. Thành viên */}
            <Route path="/members" element={<MembersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
