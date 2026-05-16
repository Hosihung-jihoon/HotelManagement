/**
 * Utility upload ảnh qua backend (POST /api/Upload/image).
 * Backend sẽ forward lên Cloudinary bằng signed upload — không cần preset.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5280/api';

/**
 * Upload 1 file ảnh qua backend → Cloudinary
 * @param {File} file   - File object từ input[type=file]
 * @param {string} folder - Folder trên Cloudinary (vd: 'hotel/inventory')
 * @returns {Promise<{url: string}>}
 */
export async function uploadToCloudinary(file, folder = 'hotel') {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(
    `${API_BASE}/Upload/image?folder=${encodeURIComponent(folder)}`,
    { method: 'POST', body: formData, headers }
  );

  if (!response.ok) {
    let msg = 'Upload thất bại';
    try { const err = await response.json(); msg = err.message ?? msg; } catch (_) {}
    throw new Error(msg);
  }

  const data = await response.json();
  return { url: data.url };
}

/**
 * Tạo URL preview local từ File object (dùng trước khi upload thật)
 * @param {File} file
 * @returns {string} object URL
 */
export function createLocalPreview(file) {
  return URL.createObjectURL(file);
}

/**
 * Giải phóng bộ nhớ object URL
 * @param {string} url
 */
export function revokeLocalPreview(url) {
  URL.revokeObjectURL(url);
}
