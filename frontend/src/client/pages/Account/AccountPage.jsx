import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../../context/AuthContext';
import { cancelBooking, getAvailableVouchers, getMyBookings, getMyMembership, getMyReviews, updateUserProfile } from '../../api/clientApi';
import { User, CalendarCheck, Crown, Star, Settings, ChevronRight, Award, Gem, Gift } from 'lucide-react';
import { getMembershipVisual, POINT_TO_VND_RATE } from '../../utils/membershipUtils';
import './AccountPage.css';

const TABS = [
  { key: 'overview', icon: <User size={18} />, label_vi: 'Tong quan', label_en: 'Overview' },
  { key: 'bookings', icon: <CalendarCheck size={18} />, label_vi: 'Lich dat phong', label_en: 'My Bookings' },
  { key: 'membership', icon: <Crown size={18} />, label_vi: 'Thanh vien', label_en: 'Membership' },
  { key: 'profile', icon: <Settings size={18} />, label_vi: 'Ho so', label_en: 'Profile' },
  { key: 'reviews', icon: <Star size={18} />, label_vi: 'Danh gia cua toi', label_en: 'My Reviews' }
];

const STATUS_BADGE = {
  upcoming: { cls: 'badge-available', label_vi: 'Sap toi', label_en: 'Upcoming' },
  completed: { cls: 'badge-silver', label_vi: 'Da hoan thanh', label_en: 'Completed' },
  cancelled: { cls: 'badge-sold-out', label_vi: 'Da huy', label_en: 'Cancelled' }
};

function formatPrice(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value || 0)}d`;
}

function getTierIcon(tierKey) {
  if (tierKey === 'diamond' || tierKey === 'gold') return <Crown size={24} />;
  if (tierKey === 'silver') return <Gem size={24} />;
  return <Award size={24} />;
}

export default function AccountPage() {
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [bookings, setBookings] = useState([]);
  const [membership, setMembership] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');

  if (!isAuthenticated) return <Navigate to="/client-login" replace />;

  useEffect(() => {
    document.title = 'My Account - Hotel Management';
    Promise.all([getMyBookings(), getMyMembership(), getMyReviews()])
      .then(([bookingRes, membershipRes, reviewsRes]) => {
        const membershipData = membershipRes.data || null;
        setBookings(bookingRes.data || []);
        setMembership(membershipData);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        return getAvailableVouchers(membershipData?.tier || membershipData?.membershipName);
      })
      .then((voucherRes) => setAvailableVouchers(voucherRes.data || []))
      .catch(() => {
        setBookings([]);
        setMembership(null);
        setReviews([]);
        setAvailableVouchers([]);
      })
      .finally(() => setLoading(false));

    const fullName = user?.fullName || '';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    setProfile({
      firstName: parts.slice(0, -1).join(' ') || parts[0] || '',
      lastName: parts.length > 1 ? parts[parts.length - 1] : '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  }, [user]);

  const tierInfo = membership?.tier || membership?.membershipName || 'Dong';
  const tierPoints = membership?.totalPoints || 0;
  const tierVisual = getMembershipVisual(tierInfo);
  const nextPoints = membership?.remainingPoints != null ? membership.remainingPoints + tierPoints : Infinity;
  const progress = Number.isFinite(nextPoints) && nextPoints > 0 ? Math.min(100, (tierPoints / nextPoints) * 100) : 100;
  const upcomingBookings = bookings.filter((item) => item.status === 'upcoming');

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    completedReviews: reviews.length,
    totalVouchers: availableVouchers.length,
  }), [bookings.length, reviews.length, availableVouchers.length]);

  return (
    <div className="c-account" style={{ paddingTop: '72px' }}>
      <div className="container">
        <div className="c-account__layout">
          <aside className="c-account__sidebar">
            <div className="c-account__user-card card">
              <div className="c-account__avatar">{user?.fullName?.[0]?.toUpperCase() || <User size={28} />}</div>
              <h2 className="title-lg c-account__name">{user?.fullName || 'Guest'}</h2>
              <p className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)' }}>{user?.email}</p>
              <span className="badge" style={{ marginTop: 'var(--sp-8)', background: tierVisual.gradient, color: tierVisual.key === 'diamond' ? '#fff' : tierVisual.color }}>
                {tierInfo}
              </span>
            </div>

            <nav className="c-account__tabs" aria-label="Account navigation">
              {TABS.map((tab) => (
                <button key={tab.key} className={`c-account__tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                  {tab.icon}
                  <span>{lang === 'vi' ? tab.label_vi : tab.label_en}</span>
                  <ChevronRight size={14} className="c-account__tab-arrow" />
                </button>
              ))}
            </nav>
          </aside>

          <div className="c-account__content">
            {activeTab === 'overview' && (
              <div className="c-account__panel">
                <h1 className="headline-lg c-account__panel-title">
                  {lang === 'vi' ? `Xin chao, ${user?.fullName?.split(' ')[0] || 'ban'}!` : `Welcome back, ${user?.fullName?.split(' ')[0] || 'Guest'}!`}
                </h1>
                <div className="c-account__stats-grid">
                  <div className="c-stat-card card">
                    <span className="c-stat-card__label">{lang === 'vi' ? 'Tong dat phong' : 'Total stays'}</span>
                    <span className="c-stat-card__value display-md">{stats.totalBookings}</span>
                  </div>
                  <div className="c-stat-card card">
                    <span className="c-stat-card__label">{lang === 'vi' ? 'Diem tich luy' : 'Reward points'}</span>
                    <span className="c-stat-card__value display-md">{tierPoints.toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="c-stat-card card">
                    <span className="c-stat-card__label">{lang === 'vi' ? 'Voucher kha dung' : 'Available vouchers'}</span>
                    <span className="c-stat-card__value display-md">{stats.totalVouchers}</span>
                  </div>
                  <div className="c-stat-card card">
                    <span className="c-stat-card__label">{lang === 'vi' ? 'Hang hien tai' : 'Current tier'}</span>
                    <span className="badge c-stat-card__value" style={{ background: tierVisual.gradient, color: tierVisual.key === 'diamond' ? '#fff' : tierVisual.color }}>
                      {getTierIcon(tierVisual.key)} {tierInfo}
                    </span>
                  </div>
                </div>

                {upcomingBookings.length > 0 && (
                  <div className="c-account__upcoming">
                    <h2 className="title-lg" style={{ marginBottom: 'var(--sp-16)', fontFamily: 'var(--font-serif)', color: 'var(--c-primary)' }}>
                      {lang === 'vi' ? 'Dat phong sap toi' : 'Upcoming stay'}
                    </h2>
                    {upcomingBookings.slice(0, 1).map((booking) => (
                      <div key={booking.id} className="c-booking-mini-card card">
                        <div style={{ padding: 'var(--sp-20) var(--sp-24)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p className="title-lg" style={{ marginBottom: 4 }}>{booking.roomName}</p>
                              <p className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-lg)' }}>
                                {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '-'} - {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '-'}
                              </p>
                              <p className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', marginTop: 8 }}>#{booking.bookingCode}</p>
                            </div>
                            <span className="badge badge-available">{lang === 'vi' ? 'Sap toi' : 'Upcoming'}</span>
                          </div>
                          <p className="text-primary-color title-lg" style={{ marginTop: 'var(--sp-12)' }}>{formatPrice(booking.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="c-account__panel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Lich dat phong' : 'My bookings'}</h1>
                {loading ? (
                  <div className="c-empty-state"><p>{lang === 'vi' ? 'Dang tai...' : 'Loading...'}</p></div>
                ) : bookings.length === 0 ? (
                  <div className="c-empty-state"><p>{lang === 'vi' ? 'Chua co booking nao.' : 'No bookings yet.'}</p></div>
                ) : (
                  <div className="c-bookings-list">
                    {bookingMessage && <p style={{ marginBottom: 'var(--sp-12)', color: '#166534' }}>{bookingMessage}</p>}
                    {bookings.map((booking) => {
                      const status = STATUS_BADGE[booking.status] || STATUS_BADGE.completed;
                      return (
                        <div key={booking.id} className="c-booking-card card">
                          <div style={{ padding: 'var(--sp-20) var(--sp-24)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-12)' }}>
                              <div>
                                <p className="text-muted label-md" style={{ marginBottom: 4 }}># {booking.bookingCode}</p>
                                <h3 className="title-lg">{booking.roomName}</h3>
                              </div>
                              <span className={`badge ${status.cls}`}>{lang === 'vi' ? status.label_vi : status.label_en}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--sp-24)', flexWrap: 'wrap' }}>
                              <p className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-lg)' }}>
                                {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '-'} - {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '-'}
                              </p>
                              <p className="text-primary-color" style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{formatPrice(booking.total)}</p>
                              {booking.roomNumbers?.length > 0 && (
                                <p className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-lg)' }}>
                                  Rooms: {booking.roomNumbers.join(', ')}
                                </p>
                              )}
                            </div>
                            <p className="text-muted" style={{ marginTop: 'var(--sp-10)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)' }}>
                              Raw status: {booking.rawStatus || '-'}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--sp-12)', marginTop: 'var(--sp-12)', flexWrap: 'wrap' }}>
                              {booking.status === 'upcoming' && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={async () => {
                                    try {
                                      await cancelBooking(booking.bookingId);
                                      setBookings((prev) => prev.map((item) => item.bookingId === booking.bookingId ? { ...item, status: 'cancelled', rawStatus: 'Cancelled' } : item));
                                      setBookingMessage(lang === 'vi' ? 'Da huy booking thanh cong.' : 'Booking cancelled.');
                                    } catch (err) {
                                      setBookingMessage(err.response?.data?.message || (lang === 'vi' ? 'Khong the huy booking.' : 'Unable to cancel booking.'));
                                    }
                                  }}
                                >
                                  {lang === 'vi' ? 'Huy dat phong' : 'Cancel booking'}
                                </button>
                              )}
                              {booking.status === 'completed' && booking.roomId && (
                                <Link className="btn btn-ghost btn-sm" to={`/rooms/${booking.roomId}`}>
                                  <Star size={14} /> {lang === 'vi' ? 'Viet danh gia' : 'Write a review'}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'membership' && (
              <div className="c-account__panel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Chuong trinh thanh vien' : 'Membership'}</h1>
                <div className={`c-membership-card card badge-${tierVisual.key}`} style={{ padding: 'var(--sp-32)', marginBottom: 'var(--sp-32)', background: tierVisual.gradient, color: tierVisual.key === 'diamond' ? '#fff' : 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-16)', marginBottom: 'var(--sp-20)' }}>
                    {getTierIcon(tierVisual.key)}
                    <div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', fontWeight: 700, opacity: 0.8 }}>{lang === 'vi' ? 'Hang hien tai' : 'Current tier'}</p>
                      <h2 className="headline-lg">{tierInfo}</h2>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-title-lg)', fontWeight: 700 }}>{tierPoints.toLocaleString('vi-VN')} {lang === 'vi' ? 'diem' : 'points'}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', marginTop: 'var(--sp-8)', opacity: 0.85 }}>
                    1 diem = {POINT_TO_VND_RATE.toLocaleString('vi-VN')}d chi tieu hop le
                  </p>
                  {Number.isFinite(progress) && progress < 100 && (
                    <>
                      <div className="c-membership-progress-bar">
                        <div className="c-membership-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)', marginTop: 'var(--sp-8)', opacity: 0.8 }}>
                        {Number(membership?.remainingPoints || 0).toLocaleString('vi-VN')} {lang === 'vi' ? `diem nua de len ${membership?.nextTierName || 'hang tiep theo'}` : `more points to reach ${membership?.nextTierName || 'the next tier'}`}
                      </p>
                    </>
                  )}
                </div>

                <div className="table-card" style={{ marginBottom: 'var(--sp-24)' }}>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Gift size={18} /> Voucher kha dung</h3>
                    {availableVouchers.length > 0 ? availableVouchers.map((voucher) => (
                      <div key={voucher.id} style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                        <strong>{voucher.code}</strong>
                        <div style={{ color: '#64748b', marginTop: 4 }}>
                          {voucher.discountType === 'Percentage' ? `${voucher.discountValue}%` : `${Number(voucher.discountValue || 0).toLocaleString('vi-VN')}d`}
                          {voucher.minBookingValue ? ` • Min ${Number(voucher.minBookingValue).toLocaleString('vi-VN')}d` : ''}
                        </div>
                      </div>
                    )) : <p className="text-muted">Chua co voucher phu hop cho hang thanh vien hien tai.</p>}
                  </div>
                </div>
                <Link to="/membership" className="btn btn-secondary">Xem quyen loi va cach doi diem</Link>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="c-account__panel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Ho so ca nhan' : 'My profile'}</h1>
                <div className="card" style={{ padding: 'var(--sp-32)' }}>
                  <div className="c-profile-grid">
                    {[
                      { key: 'firstName', label_vi: 'Ho', label_en: 'First name', type: 'text' },
                      { key: 'lastName', label_vi: 'Ten', label_en: 'Last name', type: 'text' },
                      { key: 'email', label_vi: 'Email', label_en: 'Email', type: 'email', disabled: true },
                      { key: 'phone', label_vi: 'So dien thoai', label_en: 'Phone', type: 'tel' }
                    ].map((field) => (
                      <div key={field.key} className="input-tray">
                        <label htmlFor={`profile-${field.key}`}>{lang === 'vi' ? field.label_vi : field.label_en}</label>
                        <input
                          id={`profile-${field.key}`}
                          type={field.type}
                          disabled={field.disabled}
                          value={profile[field.key]}
                          onChange={(event) => setProfile((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  {profileMessage && <p style={{ marginTop: 'var(--sp-16)', color: '#166534' }}>{profileMessage}</p>}
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--sp-24)' }}
                    disabled={savingProfile}
                    onClick={async () => {
                      setSavingProfile(true);
                      setProfileMessage('');
                      try {
                        await updateUserProfile({ fullName: `${profile.firstName} ${profile.lastName}`.trim(), phone: profile.phone });
                        setProfileMessage(lang === 'vi' ? 'Da luu thay doi ho so.' : 'Profile updated.');
                      } catch (err) {
                        setProfileMessage(err.response?.data?.message || (lang === 'vi' ? 'Khong the luu ho so.' : 'Unable to update profile.'));
                      } finally {
                        setSavingProfile(false);
                      }
                    }}
                  >
                    {savingProfile ? (lang === 'vi' ? 'Dang luu...' : 'Saving...') : (lang === 'vi' ? 'Luu thay doi' : 'Save changes')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="c-account__panel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Danh gia cua toi' : 'My reviews'}</h1>
                {loading ? (
                  <div className="c-empty-state"><p>Dang tai...</p></div>
                ) : reviews.length > 0 ? (
                  <div className="c-bookings-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="c-booking-card card">
                        <div style={{ padding: 'var(--sp-20) var(--sp-24)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-12)' }}>
                            <div>
                              <h3 className="title-lg">{review.roomTypeName || 'Room review'}</h3>
                              <p className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label-md)' }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="badge badge-silver">{review.rating}/5</span>
                          </div>
                          <p className="text-muted body-lg">{review.comment}</p>
                          {review.roomId && (
                            <Link className="btn btn-ghost btn-sm" to={`/rooms/${review.roomId}`} style={{ marginTop: 'var(--sp-12)' }}>
                              <Star size={14} /> {lang === 'vi' ? 'Xem hang phong' : 'View room'}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="c-empty-state">
                    <Star size={48} strokeWidth={1} style={{ color: 'var(--c-outline)', marginBottom: 'var(--sp-16)' }} />
                    <p className="title-lg" style={{ color: 'var(--c-on-surface-variant)' }}>
                      {lang === 'vi' ? 'Ban chua co danh gia nao.' : 'You do not have any reviews yet.'}
                    </p>
                    <p className="text-muted body-lg">
                      {lang === 'vi' ? 'Sau khi hoan tat luu tru, ban co the gui danh gia tu trang chi tiet phong.' : 'After a completed stay, you can submit reviews from room detail pages.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
