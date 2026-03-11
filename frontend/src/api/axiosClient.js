import axios from 'axios';

/**
 * Axios Client - Cấu hình sẵn cho team dùng chung.
 * 
 * Cách dùng trong component:
 *   import axiosClient from '../api/axiosClient';
 *   const response = await axiosClient.get('/RoomTypes');
 */
const axiosClient = axios.create({
  baseURL: 'http://localhost:5059/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ========== Request Interceptor ==========
// Tự động gắn token vào header nếu có (dùng cho Auth sau này)
axiosClient.interceptors.request.use(
  (config) => {
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
          // Có thể redirect về trang login ở đây
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
