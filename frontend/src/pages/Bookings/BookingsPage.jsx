import { useState, useEffect, useCallback } from 'react';
import {
  Search, RotateCcw, Plus, X, RefreshCw,
  CalendarCheck, Clock, CheckCircle, XCircle,
  Eye, ChevronLeft, User, Phone, Mail, CreditCard,
  BedDouble, Tag, Calendar, Hash, AlertCircle, DoorOpen, ChevronDown,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import BookingDetailPage from './BookingDetailPage';
import CustomSelect from '../../components/Common/CustomSelect';
import './BookingsPage.css';

const STATUS_LABEL = {
  'Pending':   'Chờ xác nhận',
  'Confirmed': 'Đã xác nhận',
  'CheckedIn': 'Đang ở',
  'CheckedOut':'Đã trả phòng',
  'Cancelled': 'Đã hủy',
};

const STATUS_BADGE = {
  'Pending':    { cls: 'badge-pending',    icon: <Clock size={12} /> },
  'Confirmed':  { cls: 'badge-confirmed',  icon: <CheckCircle size={12} /> },
  'CheckedIn':  { cls: 'badge-occupied',   icon: <CalendarCheck size={12} /> },
  'CheckedOut': { cls: 'badge-checkout',   icon: <CheckCircle size={12} /> },
  'Cancelled':  { cls: 'badge-cancelled',  icon: <XCircle size={12} /> },
};


const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const emptyCreateForm = {
  guestName: '', guestPhone: '', guestEmail: '',
  prePayment: '', paymentMethod: 'Cash',
  selectedRoomTypeId: '',
  selectedRoomId: '',
  checkIn: today(),
  checkOut: tomorrow(),
  selectedVoucherId: '',
};

// ===================== SUB-COMPONENT: Trang Tạo đơn mới =====================
function CreateBookingPage({ onBack, onSaved, vouchers, roomTypes }) {
  const [form, setForm] = useState(emptyCreateForm);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Available rooms search
  const [availableRooms, setAvailableRooms] = useState([]);
  const [searchingRooms, setSearchingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState('');
  const [roomsSearched, setRoomsSearched] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Tính voucher từ DB
  const activeDbVoucher = vouchers.find(v => String(v.id) === form.selectedVoucherId);

  // Lọc phòng trống theo hạng phòng đã chọn
  const filteredAvailableRooms = availableRooms.filter(
    r => !form.selectedRoomTypeId || String(r.roomTypeId) === form.selectedRoomTypeId
  );

  // Khi hạng phòng thay đổi → reset phòng đã chọn
  const handleRoomTypeSelect = (rtId) => {
    f('selectedRoomTypeId', form.selectedRoomTypeId === rtId ? '' : rtId);
    f('selectedRoomId', '');
  };

  // Tìm kiếm phòng trống theo ngày check-in/out
  const handleSearchRooms = useCallback(async () => {
    if (!form.checkIn || !form.checkOut) {
      setRoomsError('Vui lòng chọn ngày check-in và check-out!');
      return;
    }
    if (new Date(form.checkIn) >= new Date(form.checkOut)) {
      setRoomsError('Ngày check-out phải sau ngày check-in!');
      return;
    }
    setSearchingRooms(true);
    setRoomsError('');
    setRoomsSearched(false);
    setAvailableRooms([]);
    try {
      const res = await axiosClient.post('/Bookings/search', {
        checkInDate: new Date(form.checkIn).toISOString(),
        checkOutDate: new Date(form.checkOut).toISOString(),
      });
      setAvailableRooms(res.data || []);
      setRoomsSearched(true);
    } catch (err) {
      setRoomsError('Lỗi tìm phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setSearchingRooms(false);
    }
  }, [form.checkIn, form.checkOut]);

  useEffect(() => {
    if (form.checkIn && form.checkOut && new Date(form.checkIn) < new Date(form.checkOut)) {
      handleSearchRooms();
    }
  }, [handleSearchRooms]);

  const handleSave = async () => {
    if (!form.guestName.trim()) return alert('Vui lòng nhập tên khách hàng!');
    if (!form.selectedRoomId) return alert('Vui lòng chọn phòng!');
    if (!form.checkIn || !form.checkOut) return alert('Vui lòng chọn ngày check-in và check-out!');

    const selectedRoom = availableRooms.find(r => String(r.roomId) === form.selectedRoomId);
    if (!selectedRoom) return alert('Phòng đã chọn không hợp lệ!');

    setSaving(true);
    try {
      const payload = {
        guestName:  form.guestName.trim(),
        guestPhone: form.guestPhone.trim() || null,
        guestEmail: form.guestEmail.trim() || null,
        voucherId:  form.selectedVoucherId ? Number(form.selectedVoucherId) : null,
        prePayment: Number(form.prePayment) || 0,
        paymentMethod: form.paymentMethod || 'Cash',
        details: [{
          roomId: Number(form.selectedRoomId),
          checkInDate: new Date(form.checkIn).toISOString(),
          checkOutDate: new Date(form.checkOut).toISOString(),
          pricePerNight: selectedRoom.pricePerNight,
        }],
      };
      await axiosClient.post('/Bookings/advanced-create', payload);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
      onSaved();
    } catch (err) {
      alert('Lỗi tạo đơn: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const selectedRoomTypeObj = roomTypes.find(rt => String(rt.id) === form.selectedRoomTypeId);
  const selectedRoomObj = availableRooms.find(r => String(r.roomId) === form.selectedRoomId);

  // Tính số đêm
  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0;
  const totalPrice = selectedRoomObj ? selectedRoomObj.pricePerNight * nights : 0;

  return (
    <div style={{ animation: 'fadeSlideIn 0.25s ease' }}>
      {/* Back header */}
      <div className="rooms-page-header" style={{ marginBottom: 24 }}>
        <div>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
            background: 'transparent', border: 'none', padding: 0,
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
          }}>
            <ChevronLeft size={16} /> Quay lại danh sách
          </button>
          <h1 className="page-title">Tạo đơn đặt phòng mới</h1>
          <p className="page-subtitle">Điền thông tin khách hàng, chọn hạng phòng và xác nhận phòng trống</p>
        </div>
      </div>

      <div className="create-booking-grid">
        {/* ─── Card 1: Thông tin khách hàng ─── */}
        <div className="booking-card">
          <div className="booking-card-header">
            <div className="booking-card-icon card-icon-blue"><User size={18} /></div>
            <h3>Thông tin khách hàng</h3>
          </div>
          <div className="booking-card-body">
            <div className="form-group">
              <label>Họ và tên <span className="required">*</span></label>
              <div className="input-icon-wrap">
                <User size={15} className="input-icon" />
                <input className="form-input input-with-icon" value={form.guestName}
                  onChange={e => f('guestName', e.target.value)} placeholder="Nguyễn Văn A" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label>Số điện thoại</label>
                <div className="input-icon-wrap">
                  <Phone size={15} className="input-icon" />
                  <input className="form-input input-with-icon" value={form.guestPhone}
                    onChange={e => f('guestPhone', e.target.value)} placeholder="09xx xxx xxx" />
                </div>
              </div>
              <div className="form-col">
                <label>Email</label>
                <div className="input-icon-wrap">
                  <Mail size={15} className="input-icon" />
                  <input className="form-input input-with-icon" type="email" value={form.guestEmail}
                    onChange={e => f('guestEmail', e.target.value)} placeholder="email@example.com" />
                </div>
              </div>
            </div>

            {/* Voucher Dropdown */}
            <div className="form-group">
              <label><Tag size={13} style={{ marginRight: 5 }} />Voucher giảm giá</label>
              <CustomSelect
                value={form.selectedVoucherId}
                onChange={v => f('selectedVoucherId', v)}
                placeholder="-- Không dùng voucher --"
                options={[
                  { value: '', label: '-- Không dùng voucher --' },
                  ...vouchers.filter(v => v.isActive).map(v => {
                    const expired = v.validTo && new Date(v.validTo) < new Date();
                    const label = v.discountType === 'Percentage'
                      ? `Giảm ${v.discountValue}%`
                      : `Giảm ${Number(v.discountValue).toLocaleString('vi-VN')}đ`;
                    return {
                       value: v.id,
                       label: expired ? `${v.code} — ${label} (hết hạn)` : `${v.code} — ${label}`
                    };
                  })
                ]}
              />
              {activeDbVoucher && (
                <div className="voucher-preview" style={{ marginTop: 8 }}>
                  <Tag size={14} />
                  {activeDbVoucher.code}: Giảm {activeDbVoucher.discountType === 'Percentage' ? activeDbVoucher.discountValue + '%' : Number(activeDbVoucher.discountValue).toLocaleString('vi-VN') + 'đ'}
                </div>
              )}
            </div>

            {/* Summary box nếu đã chọn phòng */}
            {selectedRoomObj && nights > 0 && (
              <div className="booking-summary-box">
                <div className="booking-summary-title">📋 Tóm tắt đặt phòng</div>
                <div className="booking-summary-row">
                  <span>Phòng</span>
                  <strong>{selectedRoomObj.roomNumber} — {selectedRoomObj.roomTypeName}</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Số đêm</span>
                  <strong>{nights} đêm</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Giá/đêm</span>
                  <strong>{Number(selectedRoomObj.pricePerNight).toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Giảm giá Voucher</span>
                  <strong style={{ color: '#e94560' }}>
                    {activeDbVoucher ? (activeDbVoucher.discountType === 'Percentage' ? `-${activeDbVoucher.discountValue}%` : `-${Number(activeDbVoucher.discountValue).toLocaleString('vi-VN')}đ`) : '0đ'}
                  </strong>
                </div>
                {/* Tính toán tổng tạm tính để báo Deposit */}
                <div className="booking-summary-row booking-summary-total">
                  <span>Tổng tiền</span>
                  {(() => {
                     let finalSum = totalPrice;
                     if (activeDbVoucher) {
                       if (activeDbVoucher.discountType === 'Percentage') {
                         finalSum = finalSum - (finalSum * (activeDbVoucher.discountValue / 100));
                       } else {
                         finalSum = finalSum - activeDbVoucher.discountValue;
                       }
                     }
                     if (finalSum < 0) finalSum = 0;
                     return <strong style={{ color: '#2563eb' }}>{Number(finalSum).toLocaleString('vi-VN')}đ</strong>;
                  })()}
                </div>

                {/* Phần cọc thanh toán trả trước */}
                <div className="prepayment-section" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed #cce7ff' }}>
                  <div className="form-row">
                      <div className="form-col">
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#1e3a8a', fontWeight: 600, marginBottom: 8 }}>
                            <CreditCard size={14} style={{ marginRight: 4, verticalAlign: 'middle' }}/>
                            Khách cọc tiền / trả trước
                          </label>
                          <div className="input-icon-wrap">
                            <span className="input-icon" style={{ left: 12 }}>đ</span>
                            <input className="form-input" style={{ paddingLeft: 30 }} type="number" min="0" value={form.prePayment}
                              onChange={e => f('prePayment', e.target.value)} placeholder="0" />
                          </div>
                      </div>
                      <div className="form-col">
                          <label style={{ display: 'block', fontSize: '0.85rem', color: '#1e3a8a', fontWeight: 600, marginBottom: 8 }}>
                            Phương thức thanh toán
                          </label>
                          <CustomSelect
                            value={form.paymentMethod}
                            onChange={v => f('paymentMethod', v)}
                            options={[
                              { value: 'Cash', label: 'Tiền mặt' },
                              { value: 'Transfer', label: 'Chuyển khoản' }
                            ]}
                            placeholder="Chọn PT Thanh Toán"
                          />
                      </div>
                  </div>
                  {(() => {
                     let finalSum = totalPrice;
                     if (activeDbVoucher) {
                       if (activeDbVoucher.discountType === 'Percentage') finalSum -= finalSum * (activeDbVoucher.discountValue / 100);
                       else finalSum -= activeDbVoucher.discountValue;
                     }
                     if (finalSum < 0) finalSum = 0;
                     
                     const isEnoughDeposit = Number(form.prePayment || 0) >= (finalSum * 0.3);
                     if (finalSum > 0) {
                         return (
                            <div style={{ marginTop: 8, fontSize: '0.8rem', color: isEnoughDeposit ? '#2ecc71' : '#f39c12', display: 'flex', alignItems: 'center', gap: 4 }}>
                               {isEnoughDeposit ? <CheckCircle size={14} /> : <AlertCircle size={14} />} 
                               {isEnoughDeposit ? 'Thu cọc hợp lệ (>= 30%). Booking sẽ tự động Xác Nhận.' : `Mức yêu cầu cọc 30% (${Number(finalSum * 0.3).toLocaleString('vi-VN')}đ). Đơn sẽ chuyển Chờ xác nhận.`}
                            </div>
                         );
                     }
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Card 2: Chọn hạng phòng ─── */}
        <div className="booking-card booking-card-blue">
          <div className="booking-card-header">
            <div className="booking-card-icon card-icon-blue2"><BedDouble size={18} /></div>
            <h3>Chọn hạng phòng & Phòng</h3>
          </div>
          <div className="booking-card-body">

            {/* Ngày check-in / check-out */}
            <div className="form-row">
              <div className="form-col">
                <label><Calendar size={13} style={{ marginRight: 4 }} />Ngày check-in <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={form.checkIn}
                  min={today()}
                  onChange={e => {
                    const newCheckIn = e.target.value;
                    f('checkIn', newCheckIn);
                    
                    // Auto push checkout forward if checkIn >= checkOut
                    if (form.checkOut && newCheckIn >= form.checkOut) {
                        let d = new Date(newCheckIn);
                        d.setDate(d.getDate() + 1);
                        f('checkOut', d.toISOString().slice(0,10));
                    }
                    f('selectedRoomId', '');
                  }}
                />
              </div>
              <div className="form-col">
                <label><Calendar size={13} style={{ marginRight: 4 }} />Ngày check-out <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={form.checkOut}
                  min={form.checkIn || today()}
                  onChange={e => {
                    let nextDate = e.target.value;
                    if (nextDate && form.checkIn && nextDate <= form.checkIn) {
                       let d = new Date(form.checkIn);
                       d.setDate(d.getDate() + 1);
                       nextDate = d.toISOString().slice(0,10);
                    }
                    f('checkOut', nextDate);
                    f('selectedRoomId', '');
                  }}
                />
              </div>
            </div>

            {/* Hạng phòng */}
            <div className="form-group">
              <label>Hạng phòng</label>
              {roomTypes.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                  Không tải được hạng phòng — kiểm tra Backend
                </div>
              ) : (
                <div className="room-type-grid">
                  {roomTypes.map(rt => (
                    <div key={rt.id}
                      className={`room-type-card room-type-card-blue ${form.selectedRoomTypeId === String(rt.id) ? 'selected-blue' : ''}`}
                      onClick={() => handleRoomTypeSelect(String(rt.id))}
                    >
                      {rt.imageUrl && (
                        <img src={rt.imageUrl} alt={rt.name} className="room-type-img" />
                      )}
                      <div className="room-type-info">
                        <div className="room-type-name">{rt.name}</div>
                        {rt.basePrice ? (
                          <div className="room-type-price-blue">
                            {Number(rt.basePrice).toLocaleString('vi-VN')}đ<span>/đêm</span>
                          </div>
                        ) : null}
                        {rt.description && (
                          <div className="room-type-desc">{rt.description}</div>
                        )}
                      </div>
                      {form.selectedRoomTypeId === String(rt.id) && (
                        <div className="room-type-check-blue"><CheckCircle size={18} /></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>



            {/* Lỗi */}
            {roomsError && (
              <div className="rooms-error-msg">
                <AlertCircle size={15} /> {roomsError}
              </div>
            )}

            {/* Kết quả phòng trống */}
            {roomsSearched && (
              <div className="available-rooms-section">
                <div className="available-rooms-header">
                  <DoorOpen size={15} />
                  {filteredAvailableRooms.length > 0
                    ? `${filteredAvailableRooms.length} phòng${form.selectedRoomTypeId ? ` hạng "${selectedRoomTypeObj?.name}"` : ''} còn trống`
                    : `Không có phòng${form.selectedRoomTypeId ? ` hạng "${selectedRoomTypeObj?.name}"` : ''} nào trống trong khoảng thời gian này`
                  }
                </div>

                {filteredAvailableRooms.length > 0 && (
                  <div className="available-rooms-list">
                    {filteredAvailableRooms.map(room => (
                      <div
                        key={room.roomId}
                        className={`available-room-card ${form.selectedRoomId === String(room.roomId) ? 'selected-room' : ''}`}
                        onClick={() => f('selectedRoomId', form.selectedRoomId === String(room.roomId) ? '' : String(room.roomId))}
                      >
                        <div className="available-room-left">
                          <div className="available-room-number">
                            <Hash size={13} /> {room.roomNumber}
                          </div>
                          <div className="available-room-type">{room.roomTypeName}</div>
                          <div className="available-room-capacity">
                            👤 {room.capacityAdults} người lớn
                            {room.capacityChildren > 0 ? ` · ${room.capacityChildren} trẻ em` : ''}
                          </div>
                        </div>
                        <div className="available-room-right">
                          <div className="available-room-price">
                            {Number(room.pricePerNight).toLocaleString('vi-VN')}đ
                            <span>/đêm</span>
                          </div>
                          {form.selectedRoomId === String(room.roomId) && (
                            <div className="available-room-check"><CheckCircle size={16} /> Đã chọn</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredAvailableRooms.length === 0 && availableRooms.length > 0 && (
                  <div className="rooms-hint">
                    💡 Có {availableRooms.length} phòng trống hạng khác. Hãy bỏ chọn hạng phòng để xem tất cả.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="create-booking-footer">
        <button className="btn-back" onClick={onBack}>Hủy</button>
        <button className="btn-save" onClick={handleSave} disabled={saving || !form.selectedRoomId}>
          {saving ? 'Đang tạo...' : '✓ Xác nhận tạo đơn'}
        </button>
      </div>

      {successToast && (
         <div style={{ position: 'fixed', top: 20, right: 20, background: '#10b981', color: 'white', padding: '16px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'slideInRight 0.3s ease-out', zIndex: 9999 }}>
            <CheckCircle size={24} />
            <strong style={{ fontSize: '1rem', letterSpacing: '0.3px' }}>Tạo đơn thành toán thành công!</strong>
         </div>
      )}
    </div>
  );
}

// ===================== MAIN PAGE =====================
function BookingsPage() {
  const [bookings, setBookings]   = useState([]);
  const [vouchers, setVouchers]   = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [view, setView]           = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmDelete, setConfirmDelete]     = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [bookRes, voucherRes, typeRes] = await Promise.all([
        axiosClient.get('/Bookings'),
        axiosClient.get('/Vouchers'),
        axiosClient.get('/RoomTypes'),
      ]);
      setBookings(bookRes.data);
      setVouchers(voucherRes.data);
      setRoomTypes(typeRes.data);

      if (location.state?.bookingId) {
        setSelectedBooking(bookRes.data.find(b => b.id === location.state.bookingId));
        setView('detail');
        // Clear state to avoid reopening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    } catch (err) {
      console.error('Lỗi tải bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return (!q ||
      (b.guestName  || '').toLowerCase().includes(q) ||
      (b.guestEmail || '').toLowerCase().includes(q) ||
      (b.guestPhone || '').includes(q) ||
      (b.bookingCode || '').toLowerCase().includes(q))
      && (!filterStatus || b.status === filterStatus);
  });

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/Bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  const countByStatus = s => bookings.filter(b => b.status === s).length;

  // ── Render nested page: create ──
  if (view === 'create') {
    return (
      <div className="bookings-page-full">
        <CreateBookingPage
          onBack={() => setView('list')}
          onSaved={() => { fetchAll(); setView('list'); }}
          vouchers={vouchers}
          roomTypes={roomTypes}
        />
      </div>
    );
  }

  // ── Render nested page: detail ──
  if (view === 'detail' && selectedBooking) {
    return (
      <div className="bookings-page-full">
        <BookingDetailPage
          bookingId={selectedBooking.id}
          onBack={() => setView('list')}
        />
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="bookings-page-full">
      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="page-title">Quản lý đặt phòng</h1>
          <p className="page-subtitle">{bookings.length} đơn · {countByStatus('Pending')} chờ xác nhận</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          <button className="btn-add" onClick={() => setView('create')}>
            <Plus size={18} /> Tạo đơn mới
          </button>
        </div>
      </div>

      {/* KPI quick stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABEL).map(([status, label]) => {
          const cnt   = countByStatus(status);
          const badge = STATUS_BADGE[status];
          return (
            <div key={status}
              onClick={() => setFilterStatus(prev => prev === status ? '' : status)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
                background: filterStatus === status ? '#2563eb' : 'var(--surface-color)',
                color: filterStatus === status ? '#fff' : 'var(--text-primary)',
                border: `1px solid ${filterStatus === status ? '#2563eb' : 'var(--border-color)'}`,
                fontSize: '0.85rem', fontWeight: 500, transition: 'all .2s',
              }}>
              {badge?.icon}
              <span>{label}</span>
              <span style={{
                background: filterStatus === status ? 'rgba(255,255,255,0.2)' : 'var(--bg-color)',
                padding: '2px 8px', borderRadius: 99, fontWeight: 700, fontSize: '0.82rem',
              }}>{cnt}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 2 }}>
          <Search size={16} className="search-icon" />
          <input className="search-input"
            placeholder="Tìm mã booking, tên khách, email, SĐT..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="btn-reset" onClick={() => { setSearch(''); setFilterStatus(''); }} title="Xóa bộ lọc">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Đang tải danh sách đặt phòng...</p>
          </div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Mã booking</th>
                <th>Khách hàng</th>
                <th>Email / SĐT</th>
                <th>Voucher</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <CalendarCheck size={32} style={{ opacity: 0.3 }} />
                    <span>{bookings.length === 0 ? 'Chưa có đơn đặt phòng nào' : 'Không tìm thấy booking phù hợp'}</span>
                  </div>
                </td></tr>
              ) : filtered.map(b => {
                const badge = STATUS_BADGE[b.status] ?? { cls: '', icon: null };
                return (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#2563eb' }}>
                        {b.bookingCode}
                      </span>
                    </td>
                    <td>{b.guestName || <span style={{ color: 'var(--text-muted)' }}>Khách vãng lai</span>}</td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        {b.guestEmail && <div>{b.guestEmail}</div>}
                        {b.guestPhone && <div style={{ color: 'var(--text-secondary)' }}>{b.guestPhone}</div>}
                        {!b.guestEmail && !b.guestPhone && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </td>
                    <td>
                      {b.voucherId ? (() => {
                        const v = vouchers.find(x => x.id === b.voucherId);
                        if (!v) return <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>#{b.voucherId}</span>;
                        const lbl = v.discountType === 'Percentage'
                          ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString('vi-VN')}đ`;
                        return (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                            background: '#fef3c7', color: '#92400e',
                          }}>
                            🎫 {v.code} −{lbl}
                          </span>
                        );
                      })() : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${badge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {badge.icon}
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-detail"
                        onClick={() => { setSelectedBooking(b); setView('detail'); }}>
                        <Eye size={14} /> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && <div className="table-footer">Hiển thị {filtered.length} / {bookings.length} đơn</div>}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h4>Xác nhận xóa đơn đặt phòng</h4>
            <p>Bạn có chắc muốn xóa đơn này không? Hành động không thể hoàn tác.</p>
            <div className="confirm-actions">
              <button className="btn-back" onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="btn-delete-confirm" onClick={() => handleDelete(confirmDelete)}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
