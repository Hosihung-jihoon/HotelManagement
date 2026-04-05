import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, ChevronRight, ChevronLeft, Upload, Search, RotateCcw, RefreshCw, Pencil, Layers, AlertCircle } from 'lucide-react';
import { uploadToCloudinary, createLocalPreview } from '../../utils/cloudinaryUpload';
import axiosClient from '../../api/axiosClient';
import './RoomsPage.css';

// Map status API (tiếng Anh) → nhãn tiếng Việt
const STATUS_LABEL = {
  'Available':    'Sẵn sàng',
  'Occupied':     'Đang có khách',
  'Maintenance':  'Bảo trì',
  'Cleaning':     'Dọn phòng',
  'Locked':       'Khóa',
};

const STATUS_BADGE = {
  'Available':   'badge-available',
  'Occupied':    'badge-occupied',
  'Maintenance': 'badge-maintenance',
  'Cleaning':    'badge-checking',
  'Locked':      'badge-locked',
};

const ALL_STATUSES = Object.keys(STATUS_LABEL);

// ======================== MODAL THÊM / SỬA 1 PHÒNG ========================
function RoomModal({ onClose, onSaved, roomTypes, editRoom }) {
  const fileRef = useRef();
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState({
    roomNumber: editRoom?.roomNumber ?? '',
    floor: editRoom?.floor ?? '',
    roomTypeId: editRoom?.roomTypeId ?? '',
    status: editRoom?.status ?? 'Available',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImagePreview(createLocalPreview(file));
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, 'hotel/rooms');
      setForm(prev => ({ ...prev, imageUrl: url }));
    } catch { alert('❌ Upload thất bại.'); }
    finally { setUploading(false); }
  };

  const handleNext = () => {
    if (step === 1 && (!form.roomNumber || !form.floor || !form.roomTypeId)) {
      alert('Vui lòng điền đầy đủ: Số phòng, Tầng và Hạng phòng!'); return;
    }
    setStep(s => Math.min(s + 1, 2));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        roomNumber: form.roomNumber,
        floor: Number(form.floor),
        roomTypeId: Number(form.roomTypeId),
        status: editRoom ? form.status : 'Available',
      };
      if (editRoom) {
        await axiosClient.put(`/Rooms/${editRoom.id}`, payload);
      } else {
        await axiosClient.post('/Rooms', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      alert('Lỗi lưu phòng: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const selectedType = roomTypes.find(rt => rt.id === Number(form.roomTypeId));
  const STEPS = ['Thông tin chung', 'Xác nhận'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((label, idx) => {
            const s = idx + 1;
            return (
              <div key={s} className={`step-item ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
                <div className="step-circle">{step > s ? '✓' : s}</div>
                <span className="step-label">{label}</span>
                {idx < STEPS.length - 1 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
              </div>
            );
          })}
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="modal-step">
              <div className="form-row">
                <div className="form-col">
                  <label>Số phòng <span className="required">*</span></label>
                  <input className="form-input" value={form.roomNumber} onChange={e => handleChange('roomNumber', e.target.value)} placeholder="VD: 101" />
                </div>
                <div className="form-col">
                  <label>Tầng <span className="required">*</span></label>
                  <input className="form-input" type="number" min="1" max="20" value={form.floor} onChange={e => handleChange('floor', e.target.value)} placeholder="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Hạng phòng <span className="required">*</span></label>
                {roomTypes.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: '0.85rem', color: '#c2410c' }}>
                    <AlertCircle size={16} />
                    Không tải được danh sách hạng phòng — kiểm tra kết nối backend
                  </div>
                ) : (
                  <select className="form-input" value={form.roomTypeId} onChange={e => handleChange('roomTypeId', e.target.value)}>
                    <option value="">-- Chọn hạng phòng --</option>
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} {rt.basePrice ? `— ${Number(rt.basePrice).toLocaleString('vi-VN')}đ/đêm` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {editRoom && (
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select className="form-input" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Hình ảnh (tùy chọn)</label>
                <div className="upload-area" onClick={() => fileRef.current.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="upload-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={28} /><span>Nhấn để chọn ảnh</span>
                      <small>JPG, PNG, WEBP — tối đa 5MB</small>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                {uploading && <p className="upload-status">⏳ Đang tải lên Cloudinary...</p>}
                {form.imageUrl && !uploading && <p className="upload-success">✅ Ảnh đã được lưu</p>}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="modal-step">
              <div className="amenities-header"><h4>Xác nhận thông tin phòng</h4></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Số phòng',   value: form.roomNumber },
                  { label: 'Tầng',       value: `Tầng ${form.floor}` },
                  { label: 'Hạng phòng', value: selectedType?.name ?? '—' },
                  { label: 'Trạng thái', value: editRoom ? (STATUS_LABEL[form.status] ?? form.status) : 'Sẵn sàng (mặc định)' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-back" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={step === 1 || saving}>
            <ChevronLeft size={16} /> Quay lại
          </button>
          {step < 2 ? (
            <button className="btn-next" onClick={handleNext}>
              Tiếp theo <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : `✓ ${editRoom ? 'Cập nhật phòng' : 'Lưu phòng'}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================== MODAL THÊM PHÒNG HÀNG LOẠT ========================
function BulkCreateModal({ onClose, onSaved, roomTypes }) {
  const [form, setForm] = useState({
    floor: '',
    roomTypeId: '',
    count: 1,
    prefix: '',
    startNumber: 1,
  });
  const [preview, setPreview] = useState([]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  // Sinh preview số phòng khi thay đổi
  useEffect(() => {
    if (!form.floor || !form.count || form.count < 1) { setPreview([]); return; }
    const arr = [];
    for (let i = 0; i < Math.min(Number(form.count), 20); i++) {
      const n = Number(form.startNumber) + i;
      const pfx = form.prefix.trim() || String(form.floor);
      arr.push(`${pfx}${String(n).padStart(2, '0')}`);
    }
    setPreview(arr);
  }, [form.floor, form.count, form.prefix, form.startNumber]);

  const handleSave = async () => {
    if (!form.floor || !form.roomTypeId || !form.count) {
      setError('Vui lòng điền đầy đủ tầng, hạng phòng và số lượng!'); return;
    }
    if (Number(form.count) > 50) {
      setError('Tối đa 50 phòng mỗi lần tạo.'); return;
    }
    setSaving(true); setError('');
    try {
      await axiosClient.post('/Rooms/bulk-create', {
        floor: Number(form.floor),
        roomTypeId: Number(form.roomTypeId),
        numberOfRooms: Number(form.count),
        prefix: form.prefix.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tạo phòng hàng loạt.');
    } finally {
      setSaving(false);
    }
  };

  const selectedType = roomTypes.find(rt => rt.id === Number(form.roomTypeId));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Layers size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />Thêm phòng hàng loạt</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff2f0', border: '1px solid #ffa39e', borderRadius: 8, color: '#cf1322', fontSize: '0.85rem', marginBottom: 8 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-col">
              <label>Tầng <span className="required">*</span></label>
              <input className="form-input" type="number" min="1" max="20" value={form.floor}
                onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} placeholder="VD: 3" />
            </div>
            <div className="form-col">
              <label>Số lượng phòng <span className="required">*</span></label>
              <input className="form-input" type="number" min="1" max="50" value={form.count}
                onChange={e => setForm(p => ({ ...p, count: e.target.value }))} placeholder="VD: 5" />
            </div>
          </div>

          <div className="form-group">
            <label>Hạng phòng <span className="required">*</span></label>
            {roomTypes.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: '0.85rem', color: '#c2410c' }}>
                <AlertCircle size={16} /> Không tải được danh sách hạng phòng — kiểm tra kết nối backend
              </div>
            ) : (
              <select className="form-input" value={form.roomTypeId}
                onChange={e => setForm(p => ({ ...p, roomTypeId: e.target.value }))}>
                <option value="">-- Chọn hạng phòng --</option>
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} {rt.basePrice ? `— ${Number(rt.basePrice).toLocaleString('vi-VN')}đ/đêm` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Tiền tố số phòng</label>
              <input className="form-input" value={form.prefix}
                onChange={e => setForm(p => ({ ...p, prefix: e.target.value }))}
                placeholder={`Tự động: "${form.floor || '?'}"`} />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Bỏ trống → dùng số tầng làm tiền tố</small>
            </div>
            <div className="form-col">
              <label>Số thứ tự bắt đầu</label>
              <input className="form-input" type="number" min="1" value={form.startNumber}
                onChange={e => setForm(p => ({ ...p, startNumber: e.target.value }))} placeholder="1" />
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6, display: 'block' }}>
                Xem trước số phòng sẽ được tạo:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {preview.map(n => (
                  <span key={n} style={{ padding: '4px 10px', background: 'var(--primary-light, #eff6ff)', color: 'var(--primary, #2563eb)', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600, border: '1px solid var(--primary-border, #bfdbfe)' }}>
                    P.{n}
                  </span>
                ))}
                {Number(form.count) > 20 && (
                  <span style={{ padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    ... và {Number(form.count) - 20} phòng nữa
                  </span>
                )}
              </div>
              {selectedType && (
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Hạng: <strong>{selectedType.name}</strong>
                  {selectedType.basePrice ? ` — ${Number(selectedType.basePrice).toLocaleString('vi-VN')}đ/đêm` : ''}
                  · Tất cả trạng thái: <strong style={{ color: '#16a34a' }}>Sẵn sàng</strong>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-back" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn-save" onClick={handleSave} disabled={saving || roomTypes.length === 0}>
            {saving ? `Đang tạo ${form.count} phòng...` : `✓ Tạo ${form.count || 0} phòng`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== MAIN COMPONENT ========================
function RoomsPage() {
  const [rooms, setRooms]         = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch]       = useState('');
  const [filterFloor, setFilterFloor]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [showModal, setShowModal]       = useState(false);   // single
  const [showBulk, setShowBulk]         = useState(false);   // bulk
  const [editRoom, setEditRoom]         = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [roomsRes, typesRes] = await Promise.all([
        axiosClient.get('/Rooms'),
        axiosClient.get('/RoomTypes'),
      ]);
      setRooms(roomsRes.data);
      setRoomTypes(typesRes.data);
    } catch (err) {
      console.error('Lỗi tải phòng:', err);
      setLoadError(`Lỗi kết nối API: ${err.response?.status ?? err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleReset = () => { setSearch(''); setFilterFloor(''); setFilterStatus(''); setFilterTypeId(''); };

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase();
    const matchSearch  = !q || r.roomNumber.toLowerCase().includes(q) || (r.roomTypeName || '').toLowerCase().includes(q);
    const matchFloor   = !filterFloor  || String(r.floor) === filterFloor;
    const matchStatus  = !filterStatus || r.status === filterStatus;
    const matchType    = !filterTypeId || String(r.roomTypeId) === filterTypeId;
    return matchSearch && matchFloor && matchStatus && matchType;
  });

  const uniqueFloors = [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort((a, b) => a - b);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa phòng này? Hành động không thể hoàn tác!')) return;
    try {
      await axiosClient.delete(`/Rooms/${id}`);
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Lỗi xóa phòng: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="rooms-page">
      {/* Header */}
      <div className="rooms-page-header">
        <div>
          <h1 className="page-title">Quản lý phòng</h1>
          <p className="page-subtitle">
            {rooms.length} phòng · {rooms.filter(r => r.status === 'Available').length} trống · {rooms.filter(r => r.status === 'Occupied').length} có khách
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          {/* Bulk create */}
          <button
            onClick={() => { setShowBulk(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--primary, #2563eb)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary, #2563eb)', fontWeight: 600 }}>
            <Layers size={16} /> Thêm hàng loạt
          </button>
          <button className="btn-add" onClick={() => { setEditRoom(null); setShowModal(true); }}>
            <Plus size={18} /> Thêm phòng mới
          </button>
        </div>
      </div>

      {/* Load error banner */}
      {loadError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff2f0', border: '1px solid #ffa39e', borderRadius: 10, color: '#cf1322', fontSize: '0.875rem', marginBottom: 4 }}>
          <AlertCircle size={18} />
          <span>{loadError} — <button onClick={fetchAll} style={{ background: 'none', border: 'none', color: '#cf1322', textDecoration: 'underline', cursor: 'pointer' }}>Thử lại</button></span>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Tìm số phòng, hạng phòng..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterFloor} onChange={e => setFilterFloor(e.target.value)}>
          <option value="">Tất cả tầng</option>
          {uniqueFloors.map(f => <option key={f} value={f}>Tầng {f}</option>)}
        </select>
        <select className="filter-select" value={filterTypeId} onChange={e => setFilterTypeId(e.target.value)}>
          <option value="">Tất cả hạng</option>
          {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button className="btn-reset" onClick={handleReset} title="Xóa bộ lọc"><RotateCcw size={16} /></button>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Đang tải danh sách phòng từ database...</p>
          </div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Tầng</th>
                <th>Hạng phòng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">
                  {rooms.length === 0 ? 'Chưa có phòng nào trong hệ thống' : 'Không tìm thấy phòng phù hợp'}
                </td></tr>
              ) : filtered.map(room => (
                <tr key={room.id}>
                  <td><span className="room-number-cell">P.{room.roomNumber}</span></td>
                  <td>Tầng {room.floor ?? '—'}</td>
                  <td>{room.roomTypeName ?? '—'}</td>
                  <td>
                    <span className={`status-badge ${STATUS_BADGE[room.status] ?? ''}`}>
                      {STATUS_LABEL[room.status] ?? room.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-detail" onClick={() => { setEditRoom(room); setShowModal(true); }}>
                        <Pencil size={14} /> Sửa
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(room.id)} style={{ marginLeft: 6 }}>
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="table-footer">
            <span>Hiển thị {filtered.length} / {rooms.length} phòng</span>
          </div>
        )}
      </div>

      {showModal && (
        <RoomModal
          onClose={() => setShowModal(false)}
          onSaved={fetchAll}
          roomTypes={roomTypes}
          editRoom={editRoom}
        />
      )}

      {showBulk && (
        <BulkCreateModal
          onClose={() => setShowBulk(false)}
          onSaved={fetchAll}
          roomTypes={roomTypes}
        />
      )}
    </div>
  );
}

export default RoomsPage;
