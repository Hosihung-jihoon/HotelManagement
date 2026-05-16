import axiosClient from '../../api/axiosClient';

/**
 * Client-facing API helpers.
 * Dùng axiosClient (base http://localhost:5280/api) — token tự động gắn qua interceptor.
 */

// ── Rooms ──────────────────────────────────────────────────
export const getRooms = async (params = {}) => {
  try {
    const res = await axiosClient.get('/Rooms', { params });
    const data = res.data?.items || res.data || [];
    const mapped = data.map((r, i) => ({
      id: r.id,
      name: `Phòng ${r.roomNumber} (${r.roomTypeName || 'Standard'})`,
      roomTypeName: r.roomTypeName,
      roomTypeId: r.roomTypeId,
      pricePerNight: (r.roomTypeId || 1) * 800000 + 400000,
      maxOccupancy: (r.roomTypeId || 1) % 3 + 2,
      area: 25 + (r.roomTypeId || 1) * 10,
      averageRating: 4.5 + (i % 5) / 10,
      reviewCount: 15 + i * 12,
      status: r.status,
      floor: r.floor,
      roomNumber: r.roomNumber
    }));
    return { data: mapped };
  } catch {
    return { data: MOCK_ROOMS };
  }
};

export const getRoomById = async (id) => {
  try {
    const res = await axiosClient.get(`/Rooms/${id}`);
    const r = res.data;
    const mapped = {
      id: r.id,
      name: `Phòng ${r.roomNumber} (${r.roomTypeName || 'Standard'})`,
      roomTypeName: r.roomTypeName,
      roomTypeId: r.roomTypeId,
      pricePerNight: r.basePrice || ((r.roomTypeId || 1) * 800000 + 400000),
      maxOccupancy: r.capacityAdults || ((r.roomTypeId || 1) % 3 + 2),
      area: 25 + (r.roomTypeId || 1) * 10,
      averageRating: 4.8,
      reviewCount: 42,
      status: r.status,
      floor: r.floor,
      roomNumber: r.roomNumber,
      description: r.roomTypeDescription || 'Một không gian nghỉ dưỡng tuyệt vời.'
    };
    return { data: mapped };
  } catch {
    return { data: MOCK_ROOMS.find(m => m.id == id) || MOCK_ROOMS[0] };
  }
};

export const getRoomTypes = () =>
  axiosClient.get('/RoomTypes');

export const getAmenities = () =>
  axiosClient.get('/Amenities');

// ── Room Availability (API chưa có — trả về mock) ──────────
export const getRoomAvailability = async (roomId, checkIn, checkOut) => {
  try {
    return await axiosClient.get(`/Rooms/${roomId}/availability`, {
      params: { checkIn, checkOut },
    });
  } catch {
    // Mock: trả về array ngày đã đặt
    return { data: [] };
  }
};

// ── Bookings ───────────────────────────────────────────────
export const createBooking = (data) =>
  axiosClient.post('/Bookings', data);

export const getMyBookings = async () => {
  try {
    return await axiosClient.get('/Bookings/my-bookings');
  } catch {
    return { data: [] };
  }
};

export const cancelBooking = (id) =>
  axiosClient.put(`/Bookings/${id}/cancel`);

// ── Vouchers ───────────────────────────────────────────────
export const validateVoucher = async (code) => {
  try {
    return await axiosClient.post('/Vouchers/validate', { code });
  } catch (err) {
    throw err;
  }
};

// ── Members / Membership ───────────────────────────────────
export const getMyMembership = async () => {
  try {
    return await axiosClient.get('/Members/my-membership');
  } catch {
    return { data: null };
  }
};

// ── Articles / Blog ────────────────────────────────────────
export const getPublicArticles = async (params = {}) => {
  try {
    return await axiosClient.get('/Articles', { params });
  } catch {
    return { data: MOCK_ARTICLES };
  }
};

export const getArticleBySlug = async (slug) => {
  try {
    return await axiosClient.get(`/Articles/${slug}`);
  } catch {
    return { data: MOCK_ARTICLES.find(a => a.slug === slug) || MOCK_ARTICLES[0] };
  }
};

// ── Locations / Attractions ────────────────────────────────
export const getPublicLocations = async (params = {}) => {
  try {
    return await axiosClient.get('/Locations', { params });
  } catch {
    return { data: MOCK_LOCATIONS };
  }
};

// ── Services ───────────────────────────────────────────────
export const getPublicServices = async () => {
  try {
    return await axiosClient.get('/Services');
  } catch {
    return { data: MOCK_SERVICES };
  }
};

// ── Reviews ────────────────────────────────────────────────
export const getReviewsByRoom = async (roomId) => {
  try {
    return await axiosClient.get(`/Reviews/room/${roomId}`);
  } catch {
    return { data: MOCK_REVIEWS };
  }
};

export const submitReview = (data) =>
  axiosClient.post('/Reviews', data);

// ── Auth ───────────────────────────────────────────────────
export const loginUser = (email, password) =>
  axiosClient.post('/Auth/login', { email, password });

export const registerUser = (data) =>
  axiosClient.post('/Auth/register', data);

export const getUserProfile = () =>
  axiosClient.get('/user-profile');

// ── Mock Data (fallback khi API chưa có) ──────────────────

const MOCK_ROOMS = [
  { id:1, name:'Deluxe King Room',   roomTypeName:'Deluxe',   pricePerNight:1800000, maxOccupancy:2, area:32, averageRating:4.8, reviewCount:124, status:'Available', floor:5 },
  { id:2, name:'Premier Suite',      roomTypeName:'Suite',    pricePerNight:3500000, maxOccupancy:3, area:55, averageRating:4.9, reviewCount:87,  status:'Available', floor:8 },
  { id:3, name:'Family Room',        roomTypeName:'Family',   pricePerNight:2200000, maxOccupancy:4, area:48, averageRating:4.7, reviewCount:63,  status:'Available', floor:4 },
  { id:4, name:'Classic Twin',       roomTypeName:'Classic',  pricePerNight:1200000, maxOccupancy:2, area:26, averageRating:4.6, reviewCount:201, status:'Limited',   floor:3 },
  { id:5, name:'Penthouse Suite',    roomTypeName:'Suite',    pricePerNight:6800000, maxOccupancy:4, area:95, averageRating:5.0, reviewCount:32,  status:'Available', floor:12 },
  { id:6, name:'Superior Room',      roomTypeName:'Superior', pricePerNight:1500000, maxOccupancy:2, area:30, averageRating:4.7, reviewCount:156, status:'Available', floor:6 },
  { id:7, name:'Executive Suite',    roomTypeName:'Suite',    pricePerNight:4200000, maxOccupancy:2, area:68, averageRating:4.9, reviewCount:45,  status:'Available', floor:10 },
  { id:8, name:'Standard Room',      roomTypeName:'Standard', pricePerNight:900000,  maxOccupancy:2, area:22, averageRating:4.4, reviewCount:312, status:'Available', floor:2 },
];

const HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80';
const ROOM_IMG  = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80';
const BLOG_IMG  = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80';
const LOC_IMG   = 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=800&q=80';

export const UNSPLASH = {
  hotel:       HOTEL_IMG,
  room:        ROOM_IMG,
  roomSuite:   'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  roomDeluxe:  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  roomFamily:  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  pool:        'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=800&q=80',
  spa:         'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  restaurant:  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  lobby:       'https://images.unsplash.com/photo-1600200657746-41df58c09609?w=800&q=80',
  blog:        BLOG_IMG,
  blog2:       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  blog3:       'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  location:    LOC_IMG,
  location2:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  hero:        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=90',
};

const MOCK_ARTICLES = [
  {
    id: 1, slug: 'top-destinations-2025',
    title: 'Top Destinations Near Hotel Management 2025',
    titleVi: 'Địa điểm nổi bật gần Hotel Management 2025',
    excerpt: 'Discover the most breathtaking spots within a short drive from our hotel.',
    excerptVi: 'Khám phá những điểm tham quan tuyệt vời chỉ cách khách sạn vài phút lái xe.',
    thumbnail: BLOG_IMG,
    categoryName: 'Travel Tips',
    authorName: 'Hotel Management Team',
    publishedAt: '2025-05-01',
    readTime: 5,
  },
  {
    id: 2, slug: 'wellness-retreat-guide',
    title: 'Your Ultimate Wellness Retreat Guide',
    titleVi: 'Hướng dẫn nghỉ dưỡng chăm sóc sức khỏe toàn diện',
    excerpt: 'Everything you need to know for a perfect spa and wellness getaway.',
    excerptVi: 'Tất cả những gì bạn cần biết cho kỳ nghỉ dưỡng spa và chăm sóc sức khỏe hoàn hảo.',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    categoryName: 'Wellness',
    authorName: 'Spa Team',
    publishedAt: '2025-04-20',
    readTime: 7,
  },
  {
    id: 3, slug: 'fine-dining-experience',
    title: 'A Journey Through Our Fine Dining Experience',
    titleVi: 'Hành trình ẩm thực đẳng cấp tại nhà hàng của chúng tôi',
    excerpt: 'Our executive chef shares the stories behind our signature dishes.',
    excerptVi: 'Bếp trưởng chia sẻ câu chuyện đằng sau những món ăn đặc trưng.',
    thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    categoryName: 'Dining',
    authorName: 'Chef Pierre',
    publishedAt: '2025-04-10',
    readTime: 4,
  },
];

const MOCK_LOCATIONS = [
  { id:1, name:'Ben Thanh Market', nameVi:'Chợ Bến Thành', distance:1.2, category:'Shopping',
    imageUrl: LOC_IMG, description:'Iconic market in the heart of the city.' },
  { id:2, name:'Reunification Palace', nameVi:'Dinh Thống Nhất', distance:2.1, category:'History',
    imageUrl:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', description:'Historic landmark.' },
  { id:3, name:'Notre-Dame Cathedral', nameVi:'Nhà thờ Đức Bà', distance:2.5, category:'Culture',
    imageUrl:'https://images.unsplash.com/photo-1555217851-6141535bd771?w=800&q=80', description:'A beautiful French colonial cathedral.' },
  { id:4, name:'War Remnants Museum', nameVi:'Bảo tàng Chứng tích Chiến tranh', distance:3.0, category:'Museum',
    imageUrl:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', description:'One of the most visited museums in Vietnam.' },
  { id:5, name:'Bui Vien Walking Street', nameVi:'Phố đi bộ Bùi Viện', distance:1.8, category:'Nightlife',
    imageUrl:'https://images.unsplash.com/photo-1599629954294-14df9ec8dfe4?w=800&q=80', description:'Vibrant street food and entertainment area.' },
  { id:6, name:'Saigon River Cruise', nameVi:'Du thuyền Sông Sài Gòn', distance:0.8, category:'Nature',
    imageUrl:'https://images.unsplash.com/photo-1594750817988-01e5ce3e9b55?w=800&q=80', description:'Scenic river cruise experience.' },
];

const MOCK_SERVICES = [
  { id:1, name:'Spa & Wellness', nameVi:'Spa & Chăm sóc sức khỏe',
    description:'Indulge in our signature treatments.',
    descriptionVi:'Trải nghiệm các liệu pháp chăm sóc sức khỏe đặc trưng.',
    icon:'Sparkles', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' },
  { id:2, name:'Fine Dining', nameVi:'Nhà hàng Fine Dining',
    description:'World-class culinary experiences.',
    descriptionVi:'Trải nghiệm ẩm thực đẳng cấp thế giới.',
    icon:'UtensilsCrossed', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { id:3, name:'Swimming Pool', nameVi:'Hồ bơi',
    description:'Infinity pool with stunning views.',
    descriptionVi:'Hồ bơi vô cực với tầm nhìn tuyệt đẹp.',
    icon:'Waves', imageUrl: 'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=800&q=80' },
  { id:4, name:'Fitness Center', nameVi:'Phòng tập thể hình',
    description:'State-of-the-art gym equipment.',
    descriptionVi:'Thiết bị tập luyện hiện đại nhất.',
    icon:'Dumbbell', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
  { id:5, name:'Laundry Service', nameVi:'Dịch vụ giặt ủi',
    description:'Express laundry and dry cleaning.',
    descriptionVi:'Giặt ủi nhanh và giặt khô.',
    icon:'WashingMachine', imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&q=80' },
  { id:6, name:'Tour Packages', nameVi:'Gói tour du lịch',
    description:'Curated city and day tours.',
    descriptionVi:'Các gói tour thành phố được chọn lọc.',
    icon:'Map', imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80' },
];

const MOCK_REVIEWS = [
  { id:1, guestName:'Nguyen Van A', rating:5, comment:'Absolutely wonderful stay! The room was immaculate.', createdAt:'2025-04-15', avatarUrl:null },
  { id:2, guestName:'Tran Thi B', rating:4, comment:'Great location and friendly staff. Will come back.', createdAt:'2025-04-10', avatarUrl:null },
  { id:3, guestName:'John Smith', rating:5, comment:'Best hotel in the city. The spa was exceptional.', createdAt:'2025-03-28', avatarUrl:null },
  { id:4, guestName:'Maria Garcia', rating:4, comment:'Elegant rooms, superb breakfast. Highly recommended.', createdAt:'2025-03-20', avatarUrl:null },
];

export { MOCK_ARTICLES, MOCK_LOCATIONS, MOCK_SERVICES, MOCK_REVIEWS };
