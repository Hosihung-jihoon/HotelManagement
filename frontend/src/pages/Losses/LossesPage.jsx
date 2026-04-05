import { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, TriangleAlert, Calendar, Pencil, Trash2, Plus, X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { uploadToCloudinary, createLocalPreview } from '../../utils/cloudinaryUpload';
import axiosClient from '../../api/axiosClient';
import './LossesPage.css';

const emptyForm = { roomInventoryId: '', quantity: 1, penaltyAmount: 0, description: '', imageUrl: '' };

// Thumbnail bằng chứng — fallback sang placeholder SVG nếu ảnh lỗi
function EvidenceThumb({ src }) {
  const [errored, setErrored] = useState(false);

  const thumbStyle = {
    width: 52, height: 52, borderRadius: 8, display: 'block',
    objectFit: 'cover', border: '1px solid var(--border-color)',
  };

  const placeholderStyle = {
    width: 52, height: 52, borderRadius: 8,
    background: '#f3f4f6', border: '1px dashed #d1d5db',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };

  if (!src || errored) {
    return (
      <div style={placeholderStyle} title="Chưa có ảnh bằng chứng">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
          fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="bằng chứng"
      style={thumbStyle}
      onError={() => setErrored(true)}
    />
  );
}

function LossesPage() {
  const [losses, setLosses]       = useState([]);
  const [inventory, setInventory] = useState([]); // danh sách vật tư để chọn
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [lossRes, invRes] = await Promise.all([
        axiosClient.get('/LossAndDamages'),
        axiosClient.get('/RoomInventories'),
      ]);
      setLosses(lossRes.data);
      setInventory(invRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu thất thoát:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalQty  = losses.reduce((s, l) => s + Number(l.quantity), 0);
  const totalFine = losses.reduce((s, l) => s + Number(l.penaltyAmount), 0);
  const lastDate  = losses.length
    ? new Date(losses[0].createdAt).toLocaleDateString('vi-VN')
    : '—';

  const openAdd = () => {
    setEditItem(null); setForm(emptyForm); setImagePreview(null); setShowModal(true);
  };
  const openEdit = (l) => {
    setEditItem(l);
    setForm({ roomInventoryId: l.roomInventoryId ?? '', quantity: l.quantity, penaltyAmount: l.penaltyAmount, description: l.description ?? '', imageUrl: '' });
    setImagePreview(null);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setImagePreview(null); };
  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImagePreview(createLocalPreview(file));
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, 'hotel/losses');
      setForm(prev => ({ ...prev, imageUrl: url }));
    } catch { alert('❌ Upload thất bại.'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.quantity || !form.penaltyAmount) {
      alert('Vui lòng điền số lượng và tiền phạt!'); return;
    }
    setSaving(true);
    try {
      const payload = {
        roomInventoryId: form.roomInventoryId ? Number(form.roomInventoryId) : null,
        quantity: Number(form.quantity),
        penaltyAmount: Number(form.penaltyAmount),
        description: form.description,
      };
      if (editItem) {
        await axiosClient.put(`/LossAndDamages/${editItem.id}`, payload);
      } else {
        await axiosClient.post('/LossAndDamages', payload);
      }
      closeModal();
      fetchAll();
    } catch (err) {
      alert('Lỗi lưu báo cáo: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/LossAndDamages/${id}`);
      setLosses(prev => prev.filter(l => l.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // Khi chọn vật tư → tự điền tiền phạt
  const handleInventoryChange = (id) => {
    const item = inventory.find(i => String(i.id) === String(id));
    setForm(prev => ({
      ...prev,
      roomInventoryId: id,
      penaltyAmount: item?.priceIfLost ? Number(item.priceIfLost) * Number(prev.quantity) : prev.penaltyAmount,
    }));
  };

  // Khi thay số lượng → cập nhật tiền phạt
  const handleQtyChange = (qty) => {
    const item = inventory.find(i => String(i.id) === String(form.roomInventoryId));
    const unitPrice = item?.priceIfLost ?? 0;
    setForm(prev => ({ ...prev, quantity: qty, penaltyAmount: unitPrice ? unitPrice * qty : prev.penaltyAmount }));
  };

  return (
    <div className="losses-page">
      <div className="inv-header">
        <div>
          <h1 className="page-title">Thất thoát &amp; đền bù</h1>
          <p className="page-subtitle">Theo dõi hư hỏng, mất mát vật tư</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          <button className="btn-add" onClick={openAdd}><Plus size={18} /> Thêm báo cáo</button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card red">
          <div className="stat-icon"><TriangleAlert size={22} /></div>
          <div>
            <div className="stat-value">{totalQty}</div>
            <div className="stat-label">Tổng hỏng / mất</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><AlertTriangle size={22} /></div>
          <div>
            <div className="stat-value">{totalFine.toLocaleString('vi-VN')}đ</div>
            <div className="stat-label">Tổng tiền đền bù</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><Calendar size={22} /></div>
          <div>
            <div className="stat-value">{lastDate}</div>
            <div className="stat-label">Báo cáo gần nhất</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Đang tải dữ liệu thất thoát...</p>
          </div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Bằng chứng</th>
                <th>Số phòng</th>
                <th>Vật tư</th>
                <th>SL hỏng</th>
                <th>Tiền phạt</th>
                <th>Mô tả</th>
                <th>Ngày báo cáo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {losses.length === 0 ? (
                <tr><td colSpan={9} className="empty-row">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={32} style={{ opacity: 0.3 }} />
                    <span>Chưa có báo cáo thất thoát nào</span>
                  </div>
                </td></tr>
              ) : losses.map((l, idx) => (
                <tr key={l.id}>
                  <td><span className="loss-id">#{l.id}</span></td>
                  <td><EvidenceThumb src={l.imageUrl} /></td>
                  <td>
                    {l.roomNumber ? <strong>P.{l.roomNumber}</strong> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>{l.itemName ?? '—'}</td>
                  <td><span className="qty-damaged negative">-{l.quantity}</span></td>
                  <td><span className="fine-amount">{Number(l.penaltyAmount).toLocaleString('vi-VN')}đ</span></td>
                  <td>
                    <span className="desc-cell" title={l.description}>
                      {l.description ? (l.description.length > 40 ? l.description.slice(0, 40) + '...' : l.description) : '—'}
                    </span>
                  </td>
                  <td>
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => openEdit(l)}><Pencil size={13} /></button>
                      <button className="btn-delete" onClick={() => setConfirmDelete(l.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && <div className="table-footer">Tổng {losses.length} báo cáo</div>}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h4>Xác nhận xóa</h4>
            <p>Bạn có chắc chắn muốn xóa báo cáo này không?</p>
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
              <h3>{editItem ? 'Sửa báo cáo' : 'Thêm báo cáo thất thoát'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Vật tư (từ kho)</label>
                <select className="form-input" value={form.roomInventoryId} onChange={e => handleInventoryChange(e.target.value)}>
                  <option value="">-- Chọn vật tư --</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.itemName} {i.priceIfLost ? `(${Number(i.priceIfLost).toLocaleString('vi-VN')}đ/cái)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <label>Số lượng hỏng <span className="required">*</span></label>
                  <input className="form-input" type="number" min="1" value={form.quantity}
                    onChange={e => handleQtyChange(e.target.value)} />
                </div>
                <div className="form-col">
                  <label>Tiền phạt (VNĐ) <span className="required">*</span></label>
                  <input className="form-input" type="number" min="0" value={form.penaltyAmount}
                    onChange={e => handleChange('penaltyAmount', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea className="form-input" rows={3} value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết tình trạng..." />
              </div>
              <div className="form-group">
                <label>Bằng chứng (ảnh – tùy chọn)</label>
                <div className="upload-area" onClick={() => fileRef.current.click()}>
                  {imagePreview ? <img src={imagePreview} alt="evidence" className="upload-preview" /> : (
                    <div className="upload-placeholder"><ImageIcon size={28} /><span>Chụp / chọn ảnh bằng chứng</span></div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                {uploading && <p className="upload-status">⏳ Đang tải lên...</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-back" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : `✓ ${editItem ? 'Cập nhật' : 'Lưu'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LossesPage;
