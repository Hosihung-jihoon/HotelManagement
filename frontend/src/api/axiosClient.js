import axios from 'axios';

/**
 * Axios Client - Cấu hình sẵn cho team dùng chung.
 * 
 * Cách dùng trong component:
 *   import axiosClient from '../api/axiosClient';
 *   const response = await axiosClient.get('/RoomTypes');
 */
const axiosClient = axios.create({
  // Sử dụng biến môi trường (Lấy từ PR)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5280/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Giữ timeout (Từ code cũ)
  timeout: 10000, 
});

// ========== Request Interceptor ==========
// Tự động gắn token vào header nếu có
axiosClient.interceptors.request.use(
  (config) => {
    // Chuyển sang localStorage (Lấy từ PR)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== Response Interceptor ==========
// Xử lý lỗi chung (401, 403, 500,...)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Chưa đăng nhập hoặc token hết hạn');
          // Xóa token và thông tin user khi 401 (Lấy từ PR)
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Có thể redirect về trang login ở đây: window.location.href = '/login'
          break;
        case 403:
          console.error('Không có quyền truy cập');
          break;
        case 500:
          console.error('Lỗi server');
          break;
        default:
          console.error('Lỗi:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
