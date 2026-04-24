function buildSvgPlaceholder(label = 'Chưa có hình ảnh') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7fafc" />
          <stop offset="100%" stop-color="#e0e3e5" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <g fill="none" stroke="#00193c" stroke-opacity="0.18" stroke-width="24">
        <rect x="280" y="180" width="1040" height="540" rx="24" />
        <path d="M420 590l180-190 150 145 190-210 240 255" />
        <circle cx="1130" cy="330" r="56" />
      </g>
      <text x="800" y="760" text-anchor="middle" fill="#00193c" fill-opacity="0.78"
        font-family="Manrope, Arial, sans-serif" font-size="44" font-weight="600">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const fallbackRooms = [
  {
    id: 1,
    name: 'Standard Room',
    basePrice: 1200000,
    capacityAdults: 2,
    capacityChildren: 1,
    description: 'Phòng tiêu chuẩn tiện nghi với đầy đủ trang thiết bị cơ bản, không gian ấm cúng.',
    totalRooms: 5,
    amenities: [
      { id: 'wifi', name: 'Wi‑Fi tốc độ cao' },
      { id: 'tv', name: 'Smart TV' },
      { id: 'water', name: 'Nước uống miễn phí' },
    ],
    images: [],
  },
  {
    id: 2,
    name: 'Deluxe Ocean View',
    basePrice: 2850000,
    capacityAdults: 2,
    capacityChildren: 2,
    description: 'Phòng Deluxe view biển tuyệt đẹp, ban công rộng rãi đón gió biển.',
    totalRooms: 5,
    amenities: [
      { id: 'wifi', name: 'Wi‑Fi tốc độ cao' },
      { id: 'bathtub', name: 'Bồn tắm view cửa sổ' },
      { id: 'butler', name: 'Hỗ trợ check-in riêng' },
      { id: 'breakfast', name: 'Bữa sáng tại lounge' },
    ],
    images: [],
  },
  {
    id: 3,
    name: 'Family Suite',
    basePrice: 4500000,
    capacityAdults: 4,
    capacityChildren: 2,
    description: 'Không gian rộng lớn dành cho cả gia đình với khu vực sinh hoạt chung.',
    totalRooms: 5,
    amenities: [
      { id: 'pantry', name: 'Pantry mini' },
      { id: 'kid', name: 'Bố trí cho trẻ em' },
      { id: 'terrace', name: 'Terrace riêng' },
    ],
    images: [],
  },
  {
    id: 4,
    name: 'Presidential Suite',
    basePrice: 15000000,
    capacityAdults: 2,
    capacityChildren: 0,
    description: 'Hạng phòng đẳng cấp nhất với quản gia riêng và tiện nghi xa hoa.',
    totalRooms: 5,
    amenities: [
      { id: 'butler', name: 'Quản gia riêng 24/7' },
      { id: 'bar', name: 'Quầy bar cao cấp' },
      { id: 'spa', name: 'Phòng xông hơi riêng' },
    ],
    images: [],
  },
];

const keywordAmenities = {
  suite: ['Phòng khách riêng', 'Bồn tắm cao cấp', 'Minibar signature', 'Đón tiếp ưu tiên'],
  deluxe: ['Rain shower', 'Coffee station', 'Giường king hoặc twin', 'Bàn trang điểm'],
  family: ['Giường phụ trẻ em', 'Pantry mini', 'Tủ đồ rộng', 'Terrace riêng'],
  executive: ['Bàn làm việc executive', 'Wi‑Fi tốc độ cao', 'Ủi hơi cơ bản', 'Lounge access'],
  standard: ['Smart TV', 'Wi‑Fi tốc độ cao', 'Két an toàn', 'Nước chào phòng'],
};

function inferAmenities(roomName = '') {
  const lowerName = roomName.toLowerCase();
  const match = Object.entries(keywordAmenities).find(([key]) => lowerName.includes(key));
  const items = match?.[1] || keywordAmenities.standard;
  return items.map((name, index) => ({ id: `${lowerName}-${index}`, name }));
}

function buildImageMeta(image, roomName) {
  const imageUrl = typeof image === 'string' ? image : image.imageUrl;
  const isCloudinary = /res\.cloudinary\.com|cloudinary/i.test(imageUrl);

  return {
    ...image,
    imageUrl,
    isCloudinary,
    sourceLabel: isCloudinary ? 'Album Cloudinary' : `Bộ ảnh ${roomName}`,
  };
}

function orderImagesBySource(images = []) {
  return [...images].sort((left, right) => Number(Boolean(right.isCloudinary)) - Number(Boolean(left.isCloudinary)));
}

export function normalizeRoom(room, detail = null, fallback = null) {
  const base = fallback || {};
  const merged = {
    ...base,
    ...room,
    ...detail,
  };

  const rawImages = detail?.images?.length
    ? detail.images
    : room?.images?.length
      ? room.images
      : room?.primaryImageUrl
        ? [{ imageUrl: room.primaryImageUrl }]
        : base.images || [];

  const images = orderImagesBySource(
    rawImages
      .filter((image) => (typeof image === 'string' ? image : image?.imageUrl))
      .map((image) => buildImageMeta(image, merged.name || 'Room'))
  );

  const amenities = detail?.amenities?.length
    ? detail.amenities
    : room?.amenities?.length
      ? room.amenities
      : base.amenities?.length
        ? base.amenities
        : inferAmenities(merged.name);

  return {
    ...merged,
    images,
    amenities,
    primaryImageUrl: images[0]?.imageUrl,
    totalRooms: merged.totalRooms ?? base.totalRooms ?? 0,
  };
}

export function getFallbackRooms() {
  return fallbackRooms;
}

export function pickFallbackRoom(index = 0) {
  return fallbackRooms[index % fallbackRooms.length];
}

export function findFallbackRoomById(roomId) {
  return fallbackRooms.find((room) => String(room.id) === String(roomId)) || null;
}

export function getDefaultHotelImage(kind = 'hero') {
  if (kind === 'serverError') return buildSvgPlaceholder('Máy chủ chưa có hình ảnh');
  if (kind === 'notFound') return buildSvgPlaceholder('Không tìm thấy hình ảnh');
  return buildSvgPlaceholder('Hình ảnh khách sạn');
}
