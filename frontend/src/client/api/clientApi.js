import axiosClient from '../../api/axiosClient';
import { normalizePublicArticle } from '../utils/articleUtils';
import { DEFAULT_MEMBERSHIP_TIERS, normalizeMembershipTier } from '../utils/membershipUtils';

export const getRooms = async (params = {}) => {
  const res = await axiosClient.get('/Rooms', { params });
  const data = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  return {
    data: data.map((room) => ({
      id: room.id,
      name: `Phong ${room.roomNumber}${room.roomTypeName ? ` (${room.roomTypeName})` : ''}`,
      roomTypeName: room.roomTypeName,
      roomTypeId: room.roomTypeId,
      pricePerNight: Number(room.pricePerNight || 0),
      maxOccupancy: Number(room.capacityAdults || 0) + Number(room.capacityChildren || 0),
      capacityAdults: Number(room.capacityAdults || 0),
      capacityChildren: Number(room.capacityChildren || 0),
      area: room.sizeSqm != null ? Number(room.sizeSqm) : null,
      status: room.status,
      cleanStatus: room.cleanStatus,
      floor: room.floor,
      roomNumber: room.roomNumber,
      thumbnailUrl: room.thumbnailUrl || ROOM_IMG
    }))
  };
};

export const getRoomById = async (id) => {
  const res = await axiosClient.get(`/Rooms/${id}`);
  const room = res.data;
  let roomType = null;

  if (room.roomTypeId) {
    try {
      const roomTypeRes = await axiosClient.get(`/RoomTypes/${room.roomTypeId}`);
      roomType = roomTypeRes.data;
    } catch {
      roomType = null;
    }
  }

  const images = Array.isArray(roomType?.images) && roomType.images.length > 0
    ? roomType.images.map((image) => image.imageUrl).filter(Boolean)
    : [room.thumbnailUrl, ROOM_IMG, UNSPLASH.roomSuite, UNSPLASH.roomDeluxe].filter(Boolean);

  return {
    data: {
      id: room.id,
      name: `Phong ${room.roomNumber}${room.roomTypeName ? ` (${room.roomTypeName})` : ''}`,
      roomTypeName: room.roomTypeName,
      roomTypeId: room.roomTypeId,
      pricePerNight: Number(roomType?.basePrice || room.basePrice || 0),
      maxOccupancy: Number(roomType?.capacityAdults || room.capacityAdults || 0) + Number(roomType?.capacityChildren || room.capacityChildren || 0),
      capacityAdults: Number(roomType?.capacityAdults || room.capacityAdults || 0),
      capacityChildren: Number(roomType?.capacityChildren || room.capacityChildren || 0),
      area: roomType?.sizeSqm != null ? Number(roomType.sizeSqm) : (room.sizeSqm != null ? Number(room.sizeSqm) : null),
      status: room.status,
      cleanStatus: room.cleanStatus,
      floor: room.floor,
      roomNumber: room.roomNumber,
      description: roomType?.description || room.roomTypeDescription || '',
      images,
      thumbnailUrl: room.thumbnailUrl || roomType?.images?.find((image) => image.isPrimary)?.imageUrl || images[0] || ROOM_IMG,
      amenities: roomType?.amenities || [],
      amenityIds: roomType?.amenityIds || [],
      recommendedServices: roomType?.recommendedServices || [],
      recommendedServiceIds: roomType?.recommendedServiceIds || []
    }
  };
};

export const getRoomTypes = () => axiosClient.get('/RoomTypes');
export const getAmenities = () => axiosClient.get('/Amenities');

export const getRoomAvailability = async ({ roomId, checkInDate, checkOutDate, adults, children }) => {
  const res = await axiosClient.post('/Bookings/search', {
    checkInDate: new Date(checkInDate).toISOString(),
    checkOutDate: new Date(checkOutDate).toISOString(),
    capacityAdults: adults || null,
    capacityChildren: children || null
  });
  const items = Array.isArray(res.data) ? res.data : [];
  const matchedRoom = items.find((item) => Number(item.roomId) === Number(roomId));
  return {
    data: {
      isAvailable: Boolean(matchedRoom),
      room: matchedRoom || null,
      alternatives: items
    }
  };
};

export const createBooking = async (data) => {
  const details = [];
  const numRooms = data.numRooms || 1;
  for (let i = 0; i < numRooms; i++) {
    details.push({
      roomId: parseInt(data.roomId, 10),
      checkInDate: new Date(data.checkInDate).toISOString(),
      checkOutDate: new Date(data.checkOutDate).toISOString(),
      pricePerNight: data.pricePerNight || 0
    });
  }

  const payload = {
    userId: data.userId || null,
    guestName: `${data.guestInfo.firstName} ${data.guestInfo.lastName}`.trim(),
    guestPhone: data.guestInfo.phone,
    guestEmail: data.guestInfo.email,
    voucherId: data.voucherId || null,
    prePayment: 0,
    paymentMethod: data.paymentMethod || 'Cash',
    details
  };

  return axiosClient.post('/Bookings/advanced-create', payload);
};

export const getMyBookings = async () => {
  const res = await axiosClient.get('/Bookings/my-bookings');
  const items = Array.isArray(res.data) ? res.data : [];
  return {
    data: items.map((booking) => ({
      id: booking.bookingCode || booking.id,
      bookingId: booking.id,
      roomId: booking.roomId,
      roomName: booking.roomTypeName || (booking.roomNumbers?.length ? `Phong ${booking.roomNumbers.join(', ')}` : 'Room'),
      bookingCode: booking.bookingCode,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      total: booking.finalTotal || 0,
      status: mapBookingStatus(booking.status),
      rawStatus: booking.status,
      roomNumbers: booking.roomNumbers || []
    }))
  };
};

export const cancelBooking = (id) => axiosClient.put(`/Bookings/${id}/cancel`);

export const validateVoucher = async (code) => {
  const res = await axiosClient.post('/Vouchers/validate', { code });
  const voucher = res.data;
  return {
    data: {
      id: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minBookingValue: voucher.minBookingValue,
      voucherType: voucher.voucherType,
      membershipTier: voucher.membershipTier,
      discountPercent: voucher.discountType === 'Percentage' ? voucher.discountValue : null,
      discountAmount: voucher.discountType === 'Percentage' ? null : voucher.discountValue
    }
  };
};

export const getMyMembership = () => axiosClient.get('/user-profile/membership');
export const getMyReviews = () => axiosClient.get('/Reviews/my-reviews');

export const getMembershipTiers = async () => {
  const res = await axiosClient.get('/Memberships');
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  const normalized = items.map((item, index) => normalizeMembershipTier(item, index));
  return {
    ...res,
    data: normalized.length > 0 ? normalized : DEFAULT_MEMBERSHIP_TIERS
  };
};

export const getPublicArticles = async (params = {}) => {
  const res = await axiosClient.get('/Articles', { params });
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  return {
    ...res,
    data: items
      .filter((article) => article.isActive !== false)
      .map(normalizePublicArticle)
  };
};

export const getArticleBySlug = async (slug) => {
  const res = await axiosClient.get(`/Articles/slug/${slug}`);
  return {
    ...res,
    data: normalizePublicArticle(res.data)
  };
};

export const getPublicLocations = async (params = {}) => {
  const res = await axiosClient.get('/Attractions', { params });
  const items = Array.isArray(res.data) ? res.data : [];
  return {
    data: items
      .filter((loc) => loc.isActive !== false)
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        nameVi: loc.name,
        distance: loc.distanceKm,
        imageUrl: loc.mapPreviewImageUrl || LOC_IMG,
        description: loc.description,
        mapEmbedLink: loc.mapEmbedLink,
        googleMapsUrl: loc.googleMapsUrl,
        address: loc.address,
        latitude: loc.latitude,
        longitude: loc.longitude
      }))
  };
};

export const getPublicBranches = async () => {
  const res = await axiosClient.get('/HotelBranches');
  const items = Array.isArray(res.data) ? res.data : [];
  return {
    data: items.filter((branch) => branch.isActive !== false)
  };
};

export const getPublicServices = async () => {
  const res = await axiosClient.get('/Services');
  const items = Array.isArray(res.data) ? res.data : [];
  return {
    data: items.map((service) => ({
      ...service,
      imageUrl: service.imageUrl || HOTEL_IMG,
      description: service.description || `${service.name} tai khach san`
    }))
  };
};

export const getAvailableVouchers = async (membershipTier) => {
  const res = await axiosClient.get('/Vouchers');
  const items = Array.isArray(res.data) ? res.data : [];
  const now = new Date();
  const normalizedTier = String(membershipTier || '').trim().toLowerCase();
  return {
    data: items.filter((voucher) => {
      if (!voucher.isActive) return false;
      if (voucher.validFrom && new Date(voucher.validFrom) > now) return false;
      if (voucher.validTo && new Date(voucher.validTo) < now) return false;
      if (voucher.voucherType === 'MembershipTier') {
        return String(voucher.membershipTier || '').trim().toLowerCase() === normalizedTier;
      }
      return voucher.voucherType === 'General';
    })
  };
};

export const getReviewsByRoom = (roomId) => axiosClient.get(`/Reviews/room/${roomId}`);
export const submitReview = (data) => axiosClient.post('/Reviews', data);
export const submitContactRequest = (data) => axiosClient.post('/ContactRequests', data);

export const loginUser = (email, password) => axiosClient.post('/Auth/login', { email, password });
export const registerUser = (data) => axiosClient.post('/Auth/register', data);
export const getUserProfile = () => axiosClient.get('/user-profile');
export const updateUserProfile = (data) => axiosClient.put('/user-profile', data);

export const sendPasswordResetCode = (email) =>
  axiosClient.post('/PasswordReset/send-code', { email });

export const verifyPasswordResetCode = (email, code) =>
  axiosClient.post('/PasswordReset/verify-code', { email, code });

export const resetPassword = (email, code, newPassword) =>
  axiosClient.post('/PasswordReset/reset-password', { email, code, newPassword });

function mapBookingStatus(status) {
  switch ((status || '').toLowerCase()) {
    case 'pending':
    case 'confirmed':
    case 'checkedin':
      return 'upcoming';
    case 'checkedout':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'completed';
  }
}

const HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80';
const ROOM_IMG = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80';
const BLOG_IMG = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80';
const LOC_IMG = 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=800&q=80';

export const UNSPLASH = {
  hotel: HOTEL_IMG,
  room: ROOM_IMG,
  roomSuite: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  roomDeluxe: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  roomFamily: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  pool: 'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=800&q=80',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  restaurant: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  lobby: 'https://images.unsplash.com/photo-1600200657746-41df58c09609?w=800&q=80',
  blog: BLOG_IMG,
  blog2: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  blog3: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  location: LOC_IMG,
  location2: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  hero: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=90'
};

export const MOCK_ARTICLES = [
  {
    id: 1,
    slug: 'top-destinations-2025',
    title: 'Top Destinations Near Hotel Management 2025',
    titleVi: 'Diem den noi bat gan Hotel Management 2025',
    excerpt: 'Discover the most breathtaking spots within a short drive from our hotel.',
    excerptVi: 'Kham pha nhung diem tham quan tuyet voi chi cach khach san vai phut lai xe.',
    thumbnail: BLOG_IMG,
    categoryName: 'Travel Tips',
    authorName: 'Hotel Management Team',
    publishedAt: '2025-05-01',
    readTime: 5
  }
];

export const MOCK_LOCATIONS = [
  { id: 1, name: 'Ben Thanh Market', nameVi: 'Cho Ben Thanh', distance: 1.2, category: 'Shopping', imageUrl: LOC_IMG, description: 'Iconic market in the heart of the city.' }
];

export const MOCK_SERVICES = [
  { id: 1, name: 'Spa & Wellness', nameVi: 'Spa & Cham soc suc khoe', description: 'Indulge in our signature treatments.', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' }
];

export const MOCK_REVIEWS = [
  { id: 1, guestName: 'Nguyen Van A', rating: 5, comment: 'Absolutely wonderful stay! The room was immaculate.', createdAt: '2025-04-15', avatarUrl: null }
];
