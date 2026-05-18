import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './client/i18n/LangContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';

// ── Admin pages ─────────────────────────────────────────────
import DashboardPage       from './pages/Dashboard/DashboardPage';
import RoomsPage           from './pages/Rooms/RoomsPage';
import BookingsPage        from './pages/Bookings/BookingsPage';
import UsersPage           from './pages/Users/UsersPage';
import InventoryPage       from './pages/Inventory/InventoryPage';
import LossesPage          from './pages/Losses/LossesPage';
import HousekeepingPage    from './pages/Housekeeping/HousekeepingPage';
import RolesPage           from './pages/Roles/RolesPage';
import RoomTypesPage       from './pages/RoomTypes/RoomTypesPage';
import ArticlesPage        from './pages/Articles/ArticlesPage';
import ArticleEditorPage   from './pages/Articles/ArticleEditorPage';
import ArticleCategoriesPage from './pages/Articles/ArticleCategoriesPage';
import LocationsPage       from './pages/Locations/LocationsPage';
import LocationMapPage     from './pages/Locations/LocationMapPage';
import MembersPage         from './pages/Members/MembersPage';
import VouchersPage        from './pages/Vouchers/VouchersPage';
import AuditLogPage        from './pages/AuditLog/AuditLogPage';
import TodayArrivalsPage   from './pages/FrontDesk/TodayArrivalsPage';
import CurrentGuestsPage   from './pages/FrontDesk/CurrentGuestsPage';
import CheckoutPage        from './pages/FrontDesk/CheckoutPage';
import AdminServicesPage   from './pages/Services/ServicesPage';
import AmenitiesPage       from './pages/Amenities/AmenitiesPage';

// Login pages
import LoginPage           from './pages/Login/LoginPage';
import ForgotPasswordPage   from './pages/Login/ForgotPasswordPage';

// Payment & Checkout pages
import CustomerCheckoutPage from './pages/Customer/Checkout/CheckoutPage';
import PaymentResultPage    from './pages/Customer/Checkout/PaymentResultPage';
import BookingHistoryPage   from './pages/Customer/BookingHistory/BookingHistoryPage';

// ── Client pages ─────────────────────────────────────────────
import ClientLayout        from './client/layouts/ClientLayout';
import HomePage            from './client/pages/Home/HomePage';
import RoomListingPage     from './client/pages/Rooms/RoomListingPage';
import RoomDetailPage      from './client/pages/Rooms/RoomDetailPage';
import BookingPage         from './client/pages/Booking/BookingPage';
import BookingSuccessPage  from './client/pages/Booking/BookingSuccessPage';
import AccountPage         from './client/pages/Account/AccountPage';
import BlogListPage        from './client/pages/Blog/BlogListPage';
import BlogDetailPage      from './client/pages/Blog/BlogDetailPage';
import AttractionsPage     from './client/pages/Attractions/AttractionsPage';
import ServicesPage        from './client/pages/Services/ServicesPage';
import AboutPage           from './client/pages/About/AboutPage';
import ContactPage         from './client/pages/Contact/ContactPage';
import SearchPage          from './client/pages/Search/SearchPage';
import ClientLoginPage     from './client/pages/Auth/ClientLoginPage';
import ClientRegisterPage  from './client/pages/Auth/ClientRegisterPage';
import ClientMembershipPage from './client/pages/Membership/MembershipPage';

/**
 * App — Routing tổng:
 *  /              → Client site (public)
 *  /admin/*       → Admin site (PrivateRoute, roles: Admin/Staff)
 *  /client-login  → Login (dùng chung AuthContext)
 */
function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Client Site routes (root, public) ── */}
            <Route element={<ClientLayout />}>
              <Route path="/"                element={<HomePage />} />
              <Route path="/rooms"           element={<RoomListingPage />} />
              <Route path="/rooms/:id"       element={<RoomDetailPage />} />
              <Route path="/booking/:roomId" element={<BookingPage />} />
              <Route path="/booking/success" element={<BookingSuccessPage />} />
              <Route path="/account"         element={<AccountPage />} />
              <Route path="/blog"            element={<BlogListPage />} />
              <Route path="/blog/:slug"      element={<BlogDetailPage />} />
              <Route path="/attractions"     element={<AttractionsPage />} />
              <Route path="/services"        element={<ServicesPage />} />
              <Route path="/about"           element={<AboutPage />} />
              <Route path="/contact"         element={<ContactPage />} />
              <Route path="/search"          element={<SearchPage />} />
              <Route path="/client-login"    element={<ClientLoginPage />} />
              <Route path="/register"        element={<ClientRegisterPage />} />
              <Route path="/membership"      element={<ClientMembershipPage />} />
              {/* VietQR / Customer Checkout / Forgot Password / Payment Result (styled inside ClientLayout) */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/checkout"        element={<CustomerCheckoutPage />} />
              <Route path="/payment-result"  element={<PaymentResultPage />} />
              <Route path="/payment-momo-result" element={<PaymentResultPage />} />
              <Route path="/my-bookings"      element={<BookingHistoryPage />} />
            </Route>

            {/* ── Auth routes (Admin/General) ── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Admin Site routes (/admin/*) ── */}
            <Route path="/admin" element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="rooms"                    element={<RoomsPage />} />
              <Route path="room-types"               element={<RoomTypesPage />} />
              <Route path="inventory"                element={<InventoryPage />} />
              <Route path="losses"                   element={<LossesPage />} />
              <Route path="housekeeping"             element={<HousekeepingPage />} />
              <Route path="bookings"                 element={<BookingsPage />} />
              <Route path="users"                    element={<UsersPage />} />
              <Route path="roles"                    element={<RolesPage />} />
              <Route path="locations"                element={<LocationsPage />} />
              <Route path="locations/map"            element={<LocationMapPage />} />
              <Route path="articles"                 element={<ArticlesPage />} />
              <Route path="articles/categories"      element={<ArticleCategoriesPage />} />
              <Route path="articles/editor"          element={<ArticleEditorPage />} />
              <Route path="articles/editor/:id"      element={<ArticleEditorPage />} />
              <Route path="members"                  element={<MembersPage />} />
              <Route path="vouchers"                 element={<VouchersPage />} />
              <Route path="audit-logs"               element={<AuditLogPage />} />
              <Route path="front-desk/bookings"      element={<BookingsPage />} />
              <Route path="front-desk/today-arrivals" element={<TodayArrivalsPage />} />
              <Route path="front-desk/current-guests" element={<CurrentGuestsPage />} />
              <Route path="front-desk/checkout"      element={<CheckoutPage />} />
              <Route path="services"                 element={<AdminServicesPage />} />
              <Route path="amenities"                element={<AmenitiesPage />} />
            </Route>

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  );
}

export default App;
