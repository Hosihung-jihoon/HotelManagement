import { useState, useEffect } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import { useAuth } from '../../../context/AuthContext';
import { getMyBookings, getMyMembership } from '../../api/clientApi';
import { User, CalendarCheck, Crown, Star, Settings, ChevronRight, Award, Gem } from 'lucide-react';
import './AccountPage.css';

const TABS = [
  { key:'overview',   icon: <User size={18} />,          label_vi:'Tổng quan',        label_en:'Overview' },
  { key:'bookings',   icon: <CalendarCheck size={18} />,  label_vi:'Lịch đặt phòng',   label_en:'My Bookings' },
  { key:'membership', icon: <Crown size={18} />,          label_vi:'Thành viên',        label_en:'Membership' },
  { key:'profile',    icon: <Settings size={18} />,       label_vi:'Hồ sơ',            label_en:'Profile' },
  { key:'reviews',    icon: <Star size={18} />,           label_vi:'Đánh giá của tôi', label_en:'My Reviews' },
];

const MOCK_BOOKINGS = [
  { id:'BK001', roomName:'Deluxe King Room', checkIn:'2025-06-10', checkOut:'2025-06-13', total:5400000, status:'upcoming' },
  { id:'BK002', roomName:'Premier Suite',    checkIn:'2025-03-20', checkOut:'2025-03-22', total:7000000, status:'completed' },
  { id:'BK003', roomName:'Classic Twin',     checkIn:'2025-01-05', checkOut:'2025-01-07', total:2400000, status:'completed' },
];

const STATUS_BADGE = {
  upcoming:  { cls: 'badge-available', label_vi:'Sắp tới',         label_en:'Upcoming' },
  completed: { cls: 'badge-silver',    label_vi:'Đã hoàn thành',   label_en:'Completed' },
  cancelled: { cls: 'badge-sold-out',  label_vi:'Đã hủy',          label_en:'Cancelled' },
};

function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p) + '₫'; }

export default function AccountPage() {
  const [searchParams] = useSearchParams();
  const { t, lang } = useLang();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [bookings, setBookings] = useState([]);
  const [membership, setMembership] = useState(null);
  const [profile, setProfile] = useState({ firstName:'', lastName:'', email:'', phone:'' });
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated) return <Navigate to="/client-login" replace />;

  useEffect(() => {
    document.title = 'My Account — Hotel Management';
    Promise.all([
      getMyBookings().catch(() => ({ data: MOCK_BOOKINGS })),
      getMyMembership().catch(() => ({ data: null })),
    ]).then(([bRes, mRes]) => {
      setBookings(bRes.data || MOCK_BOOKINGS);
      setMembership(mRes.data);
    }).finally(() => setLoading(false));

    setProfile({
      firstName: user?.firstName || user?.fullName?.split(' ')[0] || '',
      lastName:  user?.lastName  || user?.fullName?.split(' ').slice(1).join(' ') || '',
      email:     user?.email     || '',
      phone:     user?.phone     || '',
    });
  }, [user]);

  const tierInfo = membership?.tier || 'Bronze';
  const tierPoints = membership?.totalPoints || 0;
  const NEXT_TIER_POINTS = { Bronze: 5000, Silver: 15000, Gold: Infinity };
  const nextPoints = NEXT_TIER_POINTS[tierInfo] || 5000;
  const progress = Math.min(100, (tierPoints / nextPoints) * 100);
  const tierIcon = { Gold: <Crown size={24} />, Silver: <Gem size={24} />, Bronze: <Award size={24} /> };
  const tierBadge = { Gold: 'badge-gold', Silver: 'badge-silver', Bronze: 'badge-bronze' };

  return (
    <div className="c-account" style={{ paddingTop:'72px' }}>
      <div className="container">
        <div className="c-account__layout">
          {/* Sidebar */}
          <aside className="c-account__sidebar">
            <div className="c-account__user-card card">
              <div className="c-account__avatar">
                {user?.fullName?.[0]?.toUpperCase() || <User size={28} />}
              </div>
              <h2 className="title-lg c-account__name">{user?.fullName || 'Guest'}</h2>
              <p className="text-muted" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)' }}>{user?.email}</p>
              {tierInfo && <span className={`badge ${tierBadge[tierInfo] || 'badge-bronze'}`} style={{ marginTop:'var(--sp-8)' }}>{tierInfo}</span>}
            </div>

            <nav className="c-account__tabs" aria-label="Account navigation">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`c-account__tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  id={`account-tab-${tab.key}`}
                  aria-selected={activeTab === tab.key}
                  role="tab"
                >
                  {tab.icon}
                  <span>{lang === 'vi' ? tab.label_vi : tab.label_en}</span>
                  <ChevronRight size={14} className="c-account__tab-arrow" />
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="c-account__content">

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="c-account__panel" role="tabpanel">
                <h1 className="headline-lg c-account__panel-title">
                  {lang === 'vi' ? `Xin chào, ${user?.fullName?.split(' ')[0] || 'bạn'}!` : `Welcome back, ${user?.fullName?.split(' ')[0] || 'Guest'}!`}
                </h1>
                <div className="c-account__stats-grid">
                  <div className="c-stat-card card">
                    <span className="c-stat-card__label">{lang === 'vi' ? 'Tổng đặt phòng' : 'Total Stays'}</span>
                    <span className="c-stat-card__value display-md">{bookings.length}</span>
                  </div>
                  <div className="c-stat-card card">
                    <span className="c-stat-card__label">{lang === 'vi' ? 'Điểm tích lũy' : 'Reward Points'}</span>
                    <span className="c-stat-card__value display-md">{tierPoints.toLocaleString()}</span>
                  </div>
                  <div className="c-stat-card card">
                    <span className="c-stat-card__label">{lang === 'vi' ? 'Hạng thành viên' : 'Member Tier'}</span>
                    <span className={`badge ${tierBadge[tierInfo]} c-stat-card__value`}>{tierIcon[tierInfo]} {tierInfo}</span>
                  </div>
                </div>

                {/* Upcoming booking */}
                {bookings.filter(b => b.status === 'upcoming').length > 0 && (
                  <div className="c-account__upcoming">
                    <h2 className="title-lg" style={{ marginBottom:'var(--sp-16)', fontFamily:'var(--font-serif)', color:'var(--c-primary)' }}>
                      {lang === 'vi' ? 'Đặt phòng sắp tới' : 'Upcoming Stay'}
                    </h2>
                    {bookings.filter(b => b.status === 'upcoming').slice(0,1).map(b => (
                      <div key={b.id} className="c-booking-mini-card card">
                        <div style={{ padding:'var(--sp-20) var(--sp-24)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <div>
                              <p className="title-lg" style={{ marginBottom:4 }}>{b.roomName}</p>
                              <p className="text-muted" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-lg)' }}>
                                {new Date(b.checkIn).toLocaleDateString()} — {new Date(b.checkOut).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="badge badge-available">{lang === 'vi' ? 'Sắp tới' : 'Upcoming'}</span>
                          </div>
                          <p className="text-primary-color title-lg" style={{ marginTop:'var(--sp-12)' }}>{formatPrice(b.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings */}
            {activeTab === 'bookings' && (
              <div className="c-account__panel" role="tabpanel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Lịch đặt phòng' : 'My Bookings'}</h1>
                <div className="c-bookings-list">
                  {bookings.map(b => {
                    const s = STATUS_BADGE[b.status] || STATUS_BADGE.completed;
                    return (
                      <div key={b.id} className="c-booking-card card" id={`booking-item-${b.id}`}>
                        <div style={{ padding:'var(--sp-20) var(--sp-24)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'var(--sp-12)' }}>
                            <div>
                              <p className="text-muted label-md" style={{ marginBottom:4 }}># {b.id}</p>
                              <h3 className="title-lg">{b.roomName}</h3>
                            </div>
                            <span className={`badge ${s.cls}`}>{lang === 'vi' ? s.label_vi : s.label_en}</span>
                          </div>
                          <div style={{ display:'flex', gap:'var(--sp-24)', flexWrap:'wrap' }}>
                            <p className="text-muted" style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-lg)' }}>
                              {new Date(b.checkIn).toLocaleDateString()} — {new Date(b.checkOut).toLocaleDateString()}
                            </p>
                            <p className="text-primary-color" style={{ fontFamily:'var(--font-sans)', fontWeight:700 }}>{formatPrice(b.total)}</p>
                          </div>
                          {b.status === 'completed' && (
                            <button className="btn btn-ghost btn-sm" style={{ marginTop:'var(--sp-12)' }} id={`write-review-${b.id}`}>
                              <Star size={14} /> {lang === 'vi' ? 'Viết đánh giá' : 'Write a Review'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Membership */}
            {activeTab === 'membership' && (
              <div className="c-account__panel" role="tabpanel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Chương trình thành viên' : 'Membership'}</h1>
                <div className={`c-membership-card card badge-${tierInfo.toLowerCase()}`} style={{ padding:'var(--sp-32)', marginBottom:'var(--sp-32)', background: tierInfo === 'Gold' ? 'linear-gradient(135deg,#f6e27a,#c9a84c)' : tierInfo === 'Silver' ? 'linear-gradient(135deg,#e8edf2,#8a9db5)' : 'linear-gradient(135deg,#f0d0b8,#a0674a)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-16)', marginBottom:'var(--sp-20)' }}>
                    {tierIcon[tierInfo]}
                    <div>
                      <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', fontWeight:700, opacity:0.7 }}>{lang === 'vi' ? 'Hạng hiện tại' : 'Current Tier'}</p>
                      <h2 className="headline-lg">{tierInfo} Member</h2>
                    </div>
                  </div>
                  <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-title-lg)', fontWeight:700 }}>
                    {tierPoints.toLocaleString()} {lang === 'vi' ? 'điểm' : 'points'}
                  </p>
                  {tierInfo !== 'Gold' && (
                    <>
                      <div className="c-membership-progress-bar">
                        <div className="c-membership-progress-fill" style={{ width:`${progress}%` }} />
                      </div>
                      <p style={{ fontFamily:'var(--font-sans)', fontSize:'var(--text-label-md)', marginTop:'var(--sp-8)', opacity:0.75 }}>
                        {(nextPoints - tierPoints).toLocaleString()} {lang === 'vi' ? 'điểm nữa để lên hạng tiếp theo' : 'more points to next tier'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="c-account__panel" role="tabpanel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Hồ sơ cá nhân' : 'My Profile'}</h1>
                <div className="card" style={{ padding:'var(--sp-32)' }}>
                  <div className="c-profile-grid">
                    {[
                      { key:'firstName', label_vi:'Họ',           label_en:'First Name', type:'text' },
                      { key:'lastName',  label_vi:'Tên',          label_en:'Last Name',  type:'text' },
                      { key:'email',     label_vi:'Email',        label_en:'Email',      type:'email' },
                      { key:'phone',     label_vi:'Số điện thoại',label_en:'Phone',      type:'tel' },
                    ].map(f => (
                      <div key={f.key} className="input-tray">
                        <label htmlFor={`profile-${f.key}`}>{lang === 'vi' ? f.label_vi : f.label_en}</label>
                        <input
                          id={`profile-${f.key}`}
                          type={f.type}
                          value={profile[f.key]}
                          onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ marginTop:'var(--sp-24)' }} id="save-profile-btn">
                    {lang === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="c-account__panel" role="tabpanel">
                <h1 className="headline-lg c-account__panel-title">{lang === 'vi' ? 'Đánh giá của tôi' : 'My Reviews'}</h1>
                <div className="c-empty-state">
                  <Star size={48} strokeWidth={1} style={{ color:'var(--c-outline)', marginBottom:'var(--sp-16)' }} />
                  <p className="title-lg" style={{ color:'var(--c-on-surface-variant)' }}>
                    {lang === 'vi' ? 'Bạn chưa có đánh giá nào.' : 'You have no reviews yet.'}
                  </p>
                  <p className="text-muted body-lg">{lang === 'vi' ? 'Sau khi lưu trú, hãy chia sẻ trải nghiệm của bạn!' : 'After your stay, share your experience!'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
