import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

/**
 * AuthProvider — Quản lý trạng thái đăng nhập.
 * Sau login: đọc role từ userInfo → redirect đến đúng site.
 *   - Role "Admin" / "Staff" / "Receptionist" / "Housekeeping" → /admin
 *   - Role "Guest" / "Customer" / default → / (client site)
 */

const ADMIN_ROLES = ['Admin', 'Manager', 'Staff', 'Receptionist', 'Housekeeping'];

export function isAdminRole(role) {
  if (!role) return false;
  return ADMIN_ROLES.some(r => r.toLowerCase() === role.toLowerCase());
}

export function getRedirectPath(userInfo) {
  const role = userInfo?.role || userInfo?.roleName || '';
  return isAdminRole(role) ? '/admin' : '/';
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axiosClient.get('/user-profile')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  /**
   * login — trả về { redirectPath } để caller biết redirect đâu.
   */
  const login = async (email, password) => {
    const res = await axiosClient.post('/Auth/login', { email, password });
    const { token: newToken, userInfo: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    const redirectPath = getRedirectPath(userData);
    return { ...res.data, redirectPath };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: isAdminRole(user?.role || user?.roleName),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
