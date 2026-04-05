import { useState, useEffect, useCallback } from 'react';
import { Search, RotateCcw, Plus, X, RefreshCw, CalendarCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
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

const emptyForm = {
  guestName: '', guestPhone: '', guestEmail: '', status: 'Pending', voucherId: '',
};

function BookingsPage() {
  const [bookings, setBookings]   = useState([]);
  const [vouchers, setVouchers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [bookRes, voucherRes] = await Promise.all([
        axiosClient.get('/Bookings'),
        axiosClient.get('/Vouchers'),
      ]);
      setBookings(bookRes.data);
      setVouchers(voucherRes.data);
    } catch (err) {
      console.error('Lỗi tải bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch  = !q ||
      (b.guestName  || '').toLowerCase().includes(q) ||
      (b.guestEmail || '').toLowerCase().includes(q) ||
      (b.guestPhone || '').includes(q) ||
      (b.bookingCode || '').toLowerCase().includes(q);
    const matchStatus  = !filterStatus || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd  = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b) => {
    setEditItem(b);
    setForm({ guestName: b.guestName ?? '', guestPhone: b.guestPhone ?? '', guestEmail: b.guestEmail ?? '', status: b.status ?? 'Pending', voucherId: b.voucherId ?? '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditItem(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await axiosClient.put(`/Bookings/${editItem.id}`, {
          guestName:  form.guestName,
          guestPhone: form.guestPhone,
          guestEmail: form.guestEmail,
          status:     form.status,
        });
      } else {
        await axiosClient.post('/Bookings', {
          guestName:  form.guestName,
          guestPhone: form.guestPhone,
          guestEmail: form.guestEmail,
          voucherId:  form.voucherId ? Number(form.voucherId) : null,
        });
      }
      closeModal();
      fetchAll();
    } catch (err) {
      alert('Lỗi lưu booking: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/Bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // KPI counts
  const countByStatus = (s) => bookings.filter(b => b.status === s).length;

  return (
    <div className="bookings-page-full">
      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="page-title">Booking &amp; Voucher</h1>
          <p className="page-subtitle">{bookings.length} đơn đặt phòng · {countByStatus('Pending')} chờ xác nhận</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          <button className="btn-add" onClick={openAdd}><Plus size={18} /> Tạo đơn mới</button>
        </div>
      </div>

      {/* KPI quick stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(STATUS_LABEL).map(([status, label]) => {
          const cnt = countByStatus(status);
          const badge = STATUS_BADGE[status];
          return (
            <div key={status}
              onClick={() => setFilterStatus(prev => prev === status ? '' : status)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                background: filterStatus === status ? 'var(--primary)' : 'var(--surface-color)',
                color: filterStatus === status ? '#fff' : 'var(--text-primary)',
                border: `1px solid ${filterStatus === status ? 'var(--primary)' : 'var(--border-color)'}`,
                fontSize: '0.85rem', fontWeight: 500, transition: 'all .2s',
              }}>
              {badge?.icon}
              <span>{label}</span>
              <span style={{
                background: filterStatus === status ? 'rgba(255,255,255,0.2)' : 'var(--surface-hover)',
                padding: '2px 8px', borderRadius: 99, fontWeight: 700,
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
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">
                  {bookings.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <CalendarCheck size={32} style={{ opacity: 0.3 }} />
                      <span>Chưa có đơn đặt phòng nào</span>
                    </div>
                  ) : 'Không tìm thấy booking phù hợp'}
                </td></tr>
              ) : filtered.map(b => {
                const badge = STATUS_BADGE[b.status] ?? { cls: '', icon: null };
                return (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
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
                      {b.voucherId ? (
                        <span className="role-badge role-manager">Voucher #{b.voucherId}</span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${badge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {badge.icon}
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => openEdit(b)}>Sửa</button>
                        <button className="btn-delete" onClick={() => setConfirmDelete(b.id)} style={{ marginLeft: 6 }}>
                          <X size={14} />
                        </button>
                      </div>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Cập nhật đơn đặt phòng' : 'Tạo đơn đặt phòng mới'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên khách hàng</label>
                <input className="form-input" value={form.guestName}
                  onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))}
                  placeholder="Nguyễn Văn A" />
              </div>
              <div className="form-row">
                <div className="form-col">
                  <label>Email</label>
                  <input className="form-input" type="email" value={form.guestEmail}
                    onChange={e => setForm(p => ({ ...p, guestEmail: e.target.value }))}
                    placeholder="email@example.com" />
                </div>
                <div className="form-col">
                  <label>Số điện thoại</label>
                  <input className="form-input" value={form.guestPhone}
                    onChange={e => setForm(p => ({ ...p, guestPhone: e.target.value }))}
                    placeholder="09xx xxx xxx" />
                </div>
              </div>
              {editItem && (
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select className="form-input" value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              )}
              {!editItem && (
                <div className="form-group">
                  <label>Voucher (tùy chọn)</label>
                  <select className="form-input" value={form.voucherId}
                    onChange={e => setForm(p => ({ ...p, voucherId: e.target.value }))}>
                    <option value="">-- Không dùng voucher --</option>
                    {vouchers.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.code} — Giảm {v.discountPercent ?? 0}%
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-back" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : `✓ ${editItem ? 'Cập nhật' : 'Tạo đơn'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
