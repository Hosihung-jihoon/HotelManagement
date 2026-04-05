/**
 * Utility upload ảnh lên Cloudinary qua unsigned upload preset.
 * Không dùng API Key trực tiếp ở frontend (bảo mật).
 * Cần tạo "unsigned upload preset" tên "hotel_unsigned" tại:
 * https://console.cloudinary.com/settings/upload
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload 1 file ảnh lên Cloudinary
 * @param {File} file - File object từ input[type=file]
 * @param {string} folder - Tên folder trên Cloudinary (vd: 'rooms', 'inventory')
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(file, folder = 'hotel') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary chưa được cấu hình. Kiểm tra .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Upload thất bại');
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

/**
 * Tạo URL preview local từ File object (dùng trước khi upload)
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
