import { useState, useEffect, useCallback } from 'react';
import {
  Plus, X, RefreshCw, Tag, Percent, DollarSign, Calendar,
  AlertCircle, ToggleLeft, ToggleRight, Gift, Star, PartyPopper, Sparkles,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import CustomSelect from '../../components/Common/CustomSelect';
import './VouchersPage.css';

const DISCOUNT_TYPE_LABEL = {
  'Percentage': 'Phần trăm (%)',
  'Fixed': 'Số tiền cố định (đ)',
};

const VOUCHER_TYPE_CONFIG = {
  General:       { label: 'Chung',        icon: <Tag size={14} />,        color: '#2563eb', bg: '#dbeafe' },
  MembershipTier:{ label: 'Theo hạng thành viên', icon: <Star size={14} />,  color: '#7c3aed', bg: '#ede9fe' },
  Birthday:      { label: 'Sinh nhật',    icon: <PartyPopper size={14} />, color: '#db2777', bg: '#fce7f3' },
  Holiday:       { label: 'Ngày lễ',      icon: <Sparkles size={14} />,   color: '#d97706', bg: '#fef3c7' },
};

const TABS = [
  { key: 'all',           label: 'Tất cả' },
  { key: 'General',       label: 'Chung' },
  { key: 'MembershipTier',label: 'Theo hạng' },
  { key: 'Birthday',      label: 'Sinh nhật' },
  { key: 'Holiday',       label: 'Ngày lễ' },
  { key: 'inactive',      label: 'Đã tắt' },
];

const emptyForm = {
  code: '', discountType: 'Percentage', discountValue: '',
  minBookingValue: '', validFrom: '', validTo: '', usageLimit: '',
  isActive: true, voucherType: 'General', holidayName: '', membershipTier: '',
};

function formatDiscount(v) {
  if (!v) return '—';
  if (v.discountType === 'Percentage') return `${v.discountValue}%`;
  return `${Number(v.discountValue).toLocaleString('vi-VN')}đ`;
}

function isExpired(v) {
  return v.validTo && new Date(v.validTo) < new Date();
}

function isActive(v) {
  if (!v.isActive) return false;
  const now = new Date();
  const from = v.validFrom ? new Date(v.validFrom) : null;
  const to = v.validTo ? new Date(v.validTo) : null;
  if (from && now < from) return false;
  if (to && now > to) return false;
  return true;
}

function VoucherTypeBadge({ type }) {
  const cfg = VOUCHER_TYPE_CONFIG[type] ?? VOUCHER_TYPE_CONFIG.General;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [toggling, setToggling] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Vouchers');
      setVouchers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi tải vouchers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (v) => {
    setEditItem(v);
    setForm({
      code: v.code,
      discountType: v.discountType,
      discountValue: String(v.discountValue),
      minBookingValue: v.minBookingValue != null ? String(v.minBookingValue) : '',
      validFrom: v.validFrom ? v.validFrom.slice(0, 10) : '',
      validTo: v.validTo ? v.validTo.slice(0, 10) : '',
      usageLimit: v.usageLimit != null ? String(v.usageLimit) : '',
      isActive: v.isActive,
      voucherType: v.voucherType || 'General',
      holidayName: v.holidayName || '',
      membershipTier: v.membershipTier || '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditItem(null); };
  const field = (k, val) => setForm(p => ({ ...p, [k]: val }));

  const handleToggle = async (v) => {
    setToggling(v.id);
    try {
      await axiosClient.patch(`/Vouchers/${v.id}/toggle`);
      setVouchers(prev => prev.map(x => x.id === v.id ? { ...x, isActive: !x.isActive } : x));
    } catch (err) {
      alert('Lỗi thay đổi trạng thái: ' + (err.response?.data?.message || err.message));
    } finally {
      setToggling(null);
    }
  };

  const handleSave = async () => {
    if (!form.code.trim()) return alert('Vui lòng nhập mã voucher!');
    if (!form.discountValue || isNaN(Number(form.discountValue))) return alert('Giá trị giảm giá không hợp lệ!');
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minBookingValue: form.minBookingValue ? Number(form.minBookingValue) : null,
        validFrom: form.validFrom || null,
        validTo: form.validTo || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        isActive: form.isActive,
        voucherType: form.voucherType,
        holidayName: form.voucherType === 'Holiday' ? form.holidayName : null,
        membershipTier: form.voucherType === 'MembershipTier' ? form.membershipTier : null,
      };
      if (editItem) {
        await axiosClient.put(`/Vouchers/${editItem.id}`, payload);
      } else {
        await axiosClient.post('/Vouchers', payload);
      }
      closeModal();
      fetchAll();
    } catch (err) {
      alert('Lỗi lưu voucher: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/Vouchers/${id}`);
      setVouchers(prev => prev.filter(v => v.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter by tab
  const tabFilteredVouchers = vouchers.filter(v => {
    if (activeTab === 'all') return true;
    if (activeTab === 'inactive') return !v.isActive;
    return v.voucherType === activeTab;
  });

  const activeCount = vouchers.filter(v => isActive(v)).length;
  const expiredCount = vouchers.filter(v => isExpired(v)).length;
  const pctCount = vouchers.filter(v => v.discountType === 'Percentage').length;
  const inactiveCount = vouchers.filter(v => !v.isActive).length;

  return (
    <div className="vouchers-page">
      {/* Header */}
      <div className="vouchers-header">
        <div>
          <h1 className="page-title">Quản lý Voucher</h1>
          <p className="page-subtitle">{vouchers.length} voucher · {activeCount} đang hoạt động · {expiredCount} hết hạn · {inactiveCount} đã tắt</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          <button className="btn-add" onClick={openAdd}>
            <Plus size={18} /> Tạo voucher mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="voucher-kpis">
        <div className="voucher-kpi-card">
          <div className="kpi-icon kpi-blue"><Tag size={22} /></div>
          <div><div className="kpi-value">{vouchers.length}</div><div className="kpi-label">Tổng voucher</div></div>
        </div>
        <div className="voucher-kpi-card">
          <div className="kpi-icon kpi-green"><Percent size={22} /></div>
          <div><div className="kpi-value">{pctCount}</div><div className="kpi-label">Giảm theo %</div></div>
        </div>
        <div className="voucher-kpi-card">
          <div className="kpi-icon kpi-amber"><DollarSign size={22} /></div>
          <div><div className="kpi-value">{vouchers.length - pctCount}</div><div className="kpi-label">Giảm cố định</div></div>
        </div>
        <div className="voucher-kpi-card">
          <div className="kpi-icon kpi-red"><Calendar size={22} /></div>
          <div><div className="kpi-value">{expiredCount}</div><div className="kpi-label">Hết hạn</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="voucher-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`voucher-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="tab-count">
              {tab.key === 'all' ? vouchers.length
               : tab.key === 'inactive' ? inactiveCount
               : vouchers.filter(v => v.voucherType === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Đang tải danh sách voucher...</p>
          </div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Mã voucher</th>
                <th>Loại</th>
                <th>Giảm giá</th>
                <th>Đơn tối thiểu</th>
                <th>Thời hạn</th>
                <th>Giới hạn dùng</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Bật/Tắt</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tabFilteredVouchers.length === 0 ? (
                <tr><td colSpan={9} className="empty-row">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Tag size={32} style={{ opacity: 0.3 }} />
                    <span>Không có voucher nào trong tab này</span>
                  </div>
                </td></tr>
              ) : tabFilteredVouchers.map(v => {
                const expired = isExpired(v);
                const active = isActive(v);
                return (
                  <tr key={v.id} style={{ opacity: !v.isActive ? 0.5 : expired ? 0.7 : 1 }}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary, #2563eb)', background: '#eff6ff', padding: '3px 8px', borderRadius: 6 }}>
                        {v.code}
                      </span>
                    </td>
                    <td><VoucherTypeBadge type={v.voucherType || 'General'} /></td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: v.discountType === 'Percentage' ? '#0369a1' : '#065f46' }}>
                          {formatDiscount(v)}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {v.discountType === 'Percentage' ? 'Phần trăm' : 'Cố định'}
                        </div>
                        {v.holidayName && <div style={{ fontSize: '0.72rem', color: '#d97706' }}>🎉 {v.holidayName}</div>}
                        {v.membershipTier && <div style={{ fontSize: '0.72rem', color: '#7c3aed' }}>⭐ {v.membershipTier}</div>}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {v.minBookingValue ? `${Number(v.minBookingValue).toLocaleString('vi-VN')}đ` : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {v.validFrom || v.validTo ? (
                        <div>
                          <div>{v.validFrom ? new Date(v.validFrom).toLocaleDateString('vi-VN') : '—'}</div>
                          <div style={{ color: expired ? '#dc2626' : 'var(--text-muted)' }}>
                            → {v.validTo ? new Date(v.validTo).toLocaleDateString('vi-VN') : '—'}
                          </div>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>Không giới hạn</span>}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {v.usageLimit ? `${v.usageLimit} lượt` : 'Không giới hạn'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                        background: !v.isActive ? '#f1f5f9' : expired ? '#fee2e2' : active ? '#dcfce7' : '#fef3c7',
                        color: !v.isActive ? '#64748b' : expired ? '#dc2626' : active ? '#15803d' : '#b45309',
                      }}>
                        {!v.isActive ? 'Đã tắt' : expired ? 'Hết hạn' : active ? 'Đang dùng' : 'Chưa kích hoạt'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="toggle-switch-btn"
                        onClick={() => handleToggle(v)}
                        disabled={toggling === v.id}
                        title={v.isActive ? 'Tắt voucher' : 'Bật voucher'}
                      >
                        {v.isActive
                          ? <ToggleRight size={28} style={{ color: '#22c55e' }} />
                          : <ToggleLeft size={28} style={{ color: '#94a3b8' }} />}
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="action-btns" style={{ justifyContent: 'center' }}>
                        <button className="btn-detail" onClick={() => openEdit(v)} style={{ padding: '6px 14px', borderRadius: 20, background: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                          Sửa
                        </button>
                        <button className="btn-delete" onClick={() => setConfirmDelete(v.id)} style={{ marginLeft: 6 }}>
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
        {!loading && <div className="table-footer">Hiển thị {tabFilteredVouchers.length} / {vouchers.length} voucher</div>}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h4>Xóa voucher</h4>
            <p>Voucher sẽ bị xóa vĩnh viễn. Các booking đã dùng voucher này không bị ảnh hưởng.</p>
            <div className="confirm-actions">
              <button className="btn-back" onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="btn-delete-confirm" onClick={() => handleDelete(confirmDelete)}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{editItem ? 'Cập nhật voucher' : 'Tạo voucher mới'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Mã voucher */}
              <div className="form-group">
                <label>Mã voucher <span className="required">*</span></label>
                <input className="form-input" value={form.code}
                  onChange={e => field('code', e.target.value.toUpperCase())}
                  placeholder="VD: SUMMER20" disabled={!!editItem}
                  style={editItem ? { background: '#f9fafb', cursor: 'not-allowed' } : {}} />
                {!editItem && <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Mã sẽ được tự động viết hoa.</small>}
              </div>

              {/* Loại voucher */}
              <div className="form-group">
                <label>Loại voucher</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {Object.entries(VOUCHER_TYPE_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => field('voucherType', key)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.voucherType === key ? cfg.color : '#e2e8f0'}`,
                        background: form.voucherType === key ? cfg.bg : '#fff',
                        color: form.voucherType === key ? cfg.color : 'var(--text-secondary)',
                        fontWeight: form.voucherType === key ? 700 : 400,
                        fontSize: '0.75rem', transition: 'all 0.2s',
                      }}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra field theo loại */}
              {form.voucherType === 'Holiday' && (
                <div className="form-group">
                  <label>Tên ngày lễ</label>
                  <input className="form-input" value={form.holidayName}
                    onChange={e => field('holidayName', e.target.value)}
                    placeholder="VD: Tết Nguyên Đán, Giáng Sinh..." />
                </div>
              )}
              {form.voucherType === 'MembershipTier' && (
                <div className="form-group">
                  <label>Hạng thành viên áp dụng</label>
                  <CustomSelect 
                    value={form.membershipTier} 
                    onChange={val => field('membershipTier', val)}
                    options={[
                      { value: '', label: '-- Chọn hạng thành viên --' },
                      { value: 'Khách mới', label: 'Khách mới' },
                      { value: 'Đồng', label: 'Đồng' },
                      { value: 'Bạc', label: 'Bạc' },
                      { value: 'Vàng', label: 'Vàng' },
                      { value: 'Bạch kim', label: 'Bạch kim' }
                    ]}
                  />
                </div>
              )}

              {/* Loại + Giá trị */}
              <div className="form-row">
                <div className="form-col">
                  <label>Loại giảm giá <span className="required">*</span></label>
                  <CustomSelect 
                    value={form.discountType} 
                    onChange={val => field('discountType', val)}
                    options={[
                      { value: 'Percentage', label: 'Theo phần trăm (%)' },
                      { value: 'Fixed', label: 'Số tiền cố định (đ)' }
                    ]}
                  />
                </div>
                <div className="form-col">
                  <label>
                    Giá trị giảm <span className="required">*</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                      {form.discountType === 'Percentage' ? '(%)' : '(đ)'}
                    </span>
                  </label>
                  <input className="form-input" type="number" min="0"
                    max={form.discountType === 'Percentage' ? 100 : undefined}
                    value={form.discountValue}
                    onChange={e => field('discountValue', e.target.value)}
                    placeholder={form.discountType === 'Percentage' ? '20' : '100000'} />
                </div>
              </div>

              {/* Preview */}
              {form.discountValue && (
                <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 10, fontSize: '0.88rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} />
                  {form.discountType === 'Percentage'
                    ? `Voucher này sẽ giảm ${form.discountValue}% tổng hóa đơn của khách`
                    : `Voucher này sẽ giảm ${Number(form.discountValue).toLocaleString('vi-VN')}đ từ tổng hóa đơn`}
                </div>
              )}

              {/* Đơn tối thiểu + Giới hạn */}
              <div className="form-row">
                <div className="form-col">
                  <label>Đơn tối thiểu (đ)</label>
                  <input className="form-input" type="number" min="0" value={form.minBookingValue}
                    onChange={e => field('minBookingValue', e.target.value)}
                    placeholder="0 = không yêu cầu" />
                </div>
                <div className="form-col">
                  <label>Giới hạn số lần dùng</label>
                  <input className="form-input" type="number" min="1" value={form.usageLimit}
                    onChange={e => field('usageLimit', e.target.value)}
                    placeholder="Để trống = không giới hạn" />
                </div>
              </div>

              {/* Thời hạn */}
              <div className="form-row">
                <div className="form-col">
                  <label>Ngày bắt đầu</label>
                  <input className="form-input" type="date" value={form.validFrom}
                    onChange={e => field('validFrom', e.target.value)} />
                </div>
                <div className="form-col">
                  <label>Ngày hết hạn</label>
                  <input className="form-input" type="date" value={form.validTo}
                    onChange={e => field('validTo', e.target.value)} />
                </div>
              </div>

              {/* Bật/Tắt */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Trạng thái:</label>
                <button type="button" onClick={() => field('isActive', !form.isActive)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}>
                  {form.isActive
                    ? <><ToggleRight size={28} style={{ color: '#22c55e' }} /> <span style={{ color: '#22c55e', fontWeight: 700 }}>Bật</span></>
                    : <><ToggleLeft size={28} style={{ color: '#94a3b8' }} /> <span style={{ color: '#94a3b8' }}>Tắt</span></>}
                </button>
                {!form.isActive && (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Voucher tắt sẽ không xuất hiện khi đặt phòng</span>
                )}
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-back" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : `✓ ${editItem ? 'Cập nhật' : 'Tạo voucher'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VouchersPage;
