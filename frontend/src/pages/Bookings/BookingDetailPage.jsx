import { useState, useEffect } from 'react';
import {
  ChevronLeft, User, Phone, Mail, Globe, Store,
  BedDouble, Calendar, DollarSign, Clock, CheckCircle,
  XCircle, CalendarCheck, RefreshCw, AlertCircle,
  Activity, Tag, Hash, LogIn, LogOut, Zap,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './BookingDetailPage.css';

/* ── helpers ── */
const fmt = (n) =>
  n !== undefined && n !== null
    ? Number(n).toLocaleString('vi-VN') + 'đ'
    : '—';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const calcNights = (checkIn, checkOut) =>
  Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000));

const STATUS_LABEL = {
  'Pending':    'Chờ xác nhận',
  'Confirmed':  'Đã xác nhận',
  'CheckedIn':  'Đang ở',
  'CheckedOut': 'Đã trả phòng',
  'Cancelled':  'Đã hủy',
};
const STATUS_BADGE = {
  'Pending':    'badge-pending',
  'Confirmed':  'badge-confirmed',
  'CheckedIn':  'badge-occupied',
  'CheckedOut': 'badge-checkout',
  'Cancelled':  'badge-cancelled',
};

/* ── Card wrapper ── */
function DetailCard({ icon, title, iconClass = 'card-icon-blue', children }) {
  return (
    <div className="detail-card">
      <div className="detail-card-header">
        <div className={`detail-card-icon ${iconClass}`}>{icon}</div>
        <h3>{title}</h3>
      </div>
      <div className="detail-card-body">{children}</div>
    </div>
  );
}

/* ── Info row ── */
function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value ?? '—'}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────── */
export default function BookingDetailPage({ bookingId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionCode, setTransactionCode] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get(`/Bookings/${bookingId}/detail`);
      setDetail(res.data);
    } catch (err) {
      setError('Không thể tải chi tiết đơn: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái sang "${STATUS_LABEL[newStatus]}"?`)) return;
    setStatusUpdating(true);
    try {
      await axiosClient.put(`/Bookings/${bookingId}`, {
        guestName: detail.guestName,
        guestPhone: detail.guestPhone,
        guestEmail: detail.guestEmail,
        status: newStatus,
      });
      await fetchDetail();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setPaymentSubmitting(true);
    try {
      await axiosClient.post(`/Bookings/${bookingId}/payments`, {
        amount: Number(paymentAmount),
        paymentMethod,
        transactionCode,
        paymentDate: new Date().toISOString(),
      });
      
      setShowPaymentModal(false);
      setPaymentAmount('');
      setTransactionCode('');
      await fetchDetail();
    } catch (err) {
      alert('Lỗi ghi nhận thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setPaymentSubmitting(false);
    }
  };

  /* ── Loading / Error ── */
  if (loading) {
    return (
      <div className="detail-loading">
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Đang tải chi tiết đơn đặt phòng...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="detail-error">
        <AlertCircle size={22} />
        <span>{error}</span>
      </div>
    );
  }
  if (!detail) return null;

  const statusBadge = STATUS_BADGE[detail.status] ?? '';

  /* Determine booking source */
  const bookingSource = detail.userId
    ? <span className="source-badge source-store"><Store size={13} /> Tại quầy</span>
    : <span className="source-badge source-online"><Globe size={13} /> Online</span>;

  /* Next statuses to transition to */
  const nextStatuses = {
    'Pending':    ['Confirmed', 'Cancelled'],
    'Confirmed':  ['CheckedIn', 'Cancelled'],
    'CheckedIn':  ['CheckedOut'],
    'CheckedOut': [],
    'Cancelled':  [],
  };
  const allowedNext = nextStatuses[detail.status] ?? [];

  const statusBtnStyle = {
    'Confirmed':  { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    'CheckedIn':  { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
    'CheckedOut': { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
    'Cancelled':  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  };

  return (
    <div className="booking-detail-page" style={{ animation: 'fadeSlideIn 0.25s ease' }}>
      {/* ── Back header ── */}
      <div className="detail-page-header">
        <div>
          <button className="btn-back-link" onClick={onBack}>
            <ChevronLeft size={16} /> Quay lại danh sách
          </button>
          <div className="detail-title-row">
            <h1 className="page-title">
              Chi tiết đơn đặt phòng
              <span className="booking-code-badge">#{detail.bookingCode}</span>
            </h1>
            <span className={`status-badge ${statusBadge}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              {STATUS_LABEL[detail.status] ?? detail.status}
            </span>
          </div>
          <p className="page-subtitle" style={{ marginTop: 4 }}>
            Tạo lúc {fmtDateTime(detail.createdAt)}
            {detail.bookedByName && <> · Nhân viên: <strong>{detail.bookedByName}</strong></>}
          </p>
        </div>
      </div>

      <div className="detail-grid">
        {/* ════════════════════════════════════════
            Card 1 – Thông tin khách hàng & Báo giá
        ════════════════════════════════════════ */}
        <DetailCard
          icon={<User size={18} />}
          title="Thông tin khách hàng & Báo giá"
          iconClass="card-icon-blue"
        >
          <div className="guest-info-section">
            <div className="guest-avatar">
              {(detail.guestName?.[0] ?? 'K').toUpperCase()}
            </div>
            <div className="guest-info-rows">
              <div className="guest-name">{detail.guestName ?? 'Khách vãng lai'}</div>

              {detail.guestPhone && (
                <div className="guest-contact-row">
                  <Phone size={13} className="contact-icon" />
                  {detail.guestPhone}
                </div>
              )}
              {detail.guestEmail && (
                <div className="guest-contact-row">
                  <Mail size={13} className="contact-icon" />
                  {detail.guestEmail}
                </div>
              )}
            </div>
          </div>

          <div className="divider" />

          <InfoRow label="Nguồn booking" value={bookingSource} />
          {detail.voucherCode && (
            <InfoRow label="Voucher" value={
              <span className="voucher-pill"><Tag size={12} /> {detail.voucherCode}</span>
            } />
          )}

          <div className="divider" />

          {/* Financial summary */}
          <div className="finance-box">
            <div className="finance-row">
              <span>Tổng tiền phòng</span>
              <strong>{fmt(detail.totalAmount)}</strong>
            </div>
            {detail.discountAmount > 0 && (
              <div className="finance-row finance-discount">
                <span>Giảm giá</span>
                <strong>- {fmt(detail.discountAmount)}</strong>
              </div>
            )}
            <div className="finance-row finance-total">
              <span>Tổng cộng</span>
              <strong>{fmt(detail.finalTotal > 0 ? detail.finalTotal : detail.totalAmount)}</strong>
            </div>
            
            <div className="finance-divider" />
            
            <div className="finance-row finance-deposit">
              <span>Tiền cọc yêu cầu (30%)</span>
              <strong style={{ color: '#d97706' }}>{fmt(detail.depositAmount)}</strong>
            </div>

            <div className="finance-divider" />
            <div className="finance-row finance-paid">
              <span>Đã thu trước</span>
              <strong className="text-green">{fmt(detail.amountPaid)}</strong>
            </div>
            <div className="finance-row finance-remaining">
              <span>Còn lại</span>
              <strong className={detail.remainingAmount > 0 ? 'text-red' : 'text-green'}>
                {fmt(detail.remainingAmount)}
              </strong>
            </div>
          </div>
        </DetailCard>

        {/* ════════════════════════════════════════
            Card 2 – Danh sách hạng phòng booking
        ════════════════════════════════════════ */}
        <DetailCard
          icon={<BedDouble size={18} />}
          title="Danh sách hạng phòng booking"
          iconClass="card-icon-purple"
        >
          {detail.details.length === 0 ? (
            <div className="empty-rooms">
              <BedDouble size={28} style={{ opacity: 0.3 }} />
              <p>Chưa có thông tin phòng</p>
            </div>
          ) : (
            <div className="rooms-table-wrap">
              <table className="rooms-detail-table">
                <thead>
                  <tr>
                    <th>Hạng phòng</th>
                    <th>Số phòng</th>
                    <th>Thời gian</th>
                    <th style={{ textAlign: 'right' }}>Giá</th>
                    <th>Nghiệp vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.details.map((d) => {
                    const nights = calcNights(d.checkInDate, d.checkOutDate);
                    const total = d.pricePerNight * nights;
                    return (
                      <tr key={d.id}>
                        <td>
                          <span className="room-type-pill">{d.roomTypeName ?? '—'}</span>
                        </td>
                        <td>
                          <span className="room-number-cell">
                            <Hash size={12} /> {d.roomNumber ?? '—'}
                          </span>
                        </td>
                        <td>
                          <div className="date-cell">
                            <div className="date-row">
                              <LogIn size={12} className="date-icon date-in" />
                              <span>{fmtDate(d.checkInDate)}</span>
                            </div>
                            <div className="date-row">
                              <LogOut size={12} className="date-icon date-out" />
                              <span>{fmtDate(d.checkOutDate)}</span>
                            </div>
                            <div className="nights-badge">{nights} đêm</div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="price-cell">
                            <div className="price-per-night">{fmt(d.pricePerNight)}<span>/đêm</span></div>
                            <div className="price-total">{fmt(total)}</div>
                          </div>
                        </td>
                        <td>
                          <span className="nghiep-vu-badge">
                            <Zap size={11} /> Đặt phòng
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DetailCard>

        {/* ════════════════════════════════════════
            Card 3 – Hành động
        ════════════════════════════════════════ */}
        <DetailCard
          icon={<Zap size={18} />}
          title="Hành động"
          iconClass="card-icon-green"
        >
          <p className="action-hint">Thay đổi trạng thái đơn đặt phòng:</p>
          <div className="action-buttons">
            {allowedNext.length === 0 ? (
              <div className="action-none">
                Không có hành động nào khả dụng cho trạng thái hiện tại.
              </div>
            ) : (
              allowedNext.map((s) => {
                const style = statusBtnStyle[s] ?? {};
                const labels = {
                  'Confirmed':  { icon: <CheckCircle size={15} />, text: 'Xác nhận đơn' },
                  'CheckedIn':  { icon: <CalendarCheck size={15} />, text: 'Check-in' },
                  'CheckedOut': { icon: <LogOut size={15} />, text: 'Check-out' },
                  'Cancelled':  { icon: <XCircle size={15} />, text: 'Hủy đơn' },
                };
                const { icon, text } = labels[s] ?? { icon: null, text: s };
                return (
                  <button
                    key={s}
                    className="action-btn"
                    style={{
                      background: style.bg,
                      color: style.color,
                      borderColor: style.border,
                    }}
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange(s)}
                  >
                    {statusUpdating ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
                    {text}
                  </button>
                );
              })
            )}
          </div>

          <div className="divider" style={{ margin: '15px 0' }} />
          <p className="action-hint">Nghiệp vụ tài chính:</p>
          <button 
            className="action-btn"
            style={{ 
              background: '#eff6ff', 
              color: '#1d4ed8', 
              borderColor: '#bfdbfe',
              width: '100%',
              justifyContent: 'center'
            }}
            onClick={() => {
              setPaymentAmount(detail.remainingAmount > 0 ? detail.remainingAmount : '');
              setShowPaymentModal(true);
            }}
          >
            <DollarSign size={15} /> Thu tiền (Thanh toán)
          </button>


          {/* Quick info */}
          <div className="quick-info-grid">
            <div className="quick-info-item">
              <span className="qi-label">Mã đặt phòng</span>
              <span className="qi-value mono">{detail.bookingCode}</span>
            </div>
            <div className="quick-info-item">
              <span className="qi-label">Trạng thái</span>
              <span className={`status-badge ${statusBadge}`} style={{ fontSize: '0.78rem' }}>
                {STATUS_LABEL[detail.status] ?? detail.status}
              </span>
            </div>
            <div className="quick-info-item">
              <span className="qi-label">Số phòng đặt</span>
              <span className="qi-value">{detail.details.length} phòng</span>
            </div>
            <div className="quick-info-item">
              <span className="qi-label">Ngày tạo</span>
              <span className="qi-value">{fmtDate(detail.createdAt)}</span>
            </div>
          </div>
        </DetailCard>

        {/* ════════════════════════════════════════
            Card 4 – Lịch sử hoạt động
        ════════════════════════════════════════ */}
        <DetailCard
          icon={<Activity size={18} />}
          title="Lịch sử hoạt động"
          iconClass="card-icon-orange"
        >
          {detail.auditLogs.length === 0 ? (
            <div className="empty-logs">
              <Clock size={28} style={{ opacity: 0.3 }} />
              <p>Chưa có lịch sử hoạt động</p>
            </div>
          ) : (
            <div className="audit-timeline">
              {detail.auditLogs.map((log, idx) => (
                <div key={log.id} className="audit-item">
                  <div className={`audit-dot ${idx === 0 ? 'audit-dot-active' : ''}`} />
                  {idx < detail.auditLogs.length - 1 && <div className="audit-line" />}
                  <div className="audit-content">
                    <div className="audit-header">
                      <span className="audit-action">{log.action}</span>
                      {log.userName && (
                        <span className="audit-user">
                          <User size={11} /> {log.userName}
                        </span>
                      )}
                    </div>
                    <div className="audit-time">
                      <Clock size={11} /> {fmtDateTime(log.createdAt)}
                    </div>
                    {(log.oldValue || log.newValue) && (
                      <div className="audit-values">
                        {log.oldValue && (
                          <span className="audit-old">Cũ: {log.oldValue}</span>
                        )}
                        {log.newValue && (
                          <span className="audit-new">Mới: {log.newValue}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking creation as base event */}
          <div className="audit-base-event">
            <CalendarCheck size={14} />
            <span>Đơn đặt phòng được tạo lúc {fmtDateTime(detail.createdAt)}</span>
          </div>
        </DetailCard>
      </div>

      {/* ── Payment Modal ── */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Thu tiền thanh toán</h3>
              <button className="btn-close" onClick={() => setShowPaymentModal(false)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Số tiền thu (VNĐ)</label>
                  <input 
                    type="number" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="VD: 500000"
                    required
                    className="form-control"
                  />
                  {detail.remainingAmount > 0 && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                      Gợi ý: Còn lại {fmt(detail.remainingAmount)}
                    </p>
                  )}
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="form-group">
                    <label>Phương thức</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-control"
                    >
                      <option value="Cash">Tiền mặt</option>
                      <option value="Transfer">Chuyển khoản</option>
                      <option value="Card">Thẻ (POS)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mã giao dịch</label>
                    <input 
                      type="text" 
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      placeholder="Không bắt buộc"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={paymentSubmitting}>
                  {paymentSubmitting ? 'Đang xử lý...' : 'Xác nhận thu tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
