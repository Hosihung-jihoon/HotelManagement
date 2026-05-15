import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — Bảo vệ /admin/* routes.
 * - Chưa đăng nhập → /login
 * - Đã đăng nhập nhưng không phải admin role → / (client site)
 */
function PrivateRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.1rem',
        color: '#666',
        fontFamily: 'Manrope, sans-serif',
      }}>
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/client-login" replace />;
  }

  if (!isAdmin) {
    // Đã đăng nhập nhưng là Guest/Customer → về client site
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
