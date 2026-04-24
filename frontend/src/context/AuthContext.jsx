import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

function normalizeRoleName(roleName) {
  return (roleName || '').trim().toLowerCase();
}

/**
 * AuthProvider - Quản lý trạng thái đăng nhập.
 * Dùng sessionStorage thay localStorage để mỗi tab có thể login với account khác nhau.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axiosClient.get('/user-profile')
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          sessionStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosClient.post('/Auth/login', { email, password });
    const { token: newToken, userInfo: userData } = res.data;
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: normalizeRoleName(user?.roleName) === 'admin',
    isGuest: normalizeRoleName(user?.roleName) === 'guest',
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
