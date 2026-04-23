import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, ChevronRight, ChevronLeft, Upload, Search, RotateCcw, RefreshCw, Pencil, Layers, AlertCircle, Trash2, Eye, BedDouble, Box, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { uploadToCloudinary, createLocalPreview } from '../../utils/cloudinaryUpload';
import axiosClient from '../../api/axiosClient';
import CustomSelect from '../../components/Common/CustomSelect';
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
function LossReportModal({ room, inventories, onClose, onSaved }) {
  const [form, setForm] = useState({
    roomInventoryId: '',
    quantity: 1,
    penaltyAmount: 0,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleInventoryChange = (roomInventoryId) => {
    const selectedInventory = inventories.find(i => String(i.id) === String(roomInventoryId));
    setForm(prev => ({
      ...prev,
      roomInventoryId,
      penaltyAmount: selectedInventory?.priceIfLost ? Number(selectedInventory.priceIfLost) * Number(prev.quantity) : 0,
    }));
  };

  const handleQuantityChange = (quantity) => {
    const selectedInventory = inventories.find(i => String(i.id) === String(form.roomInventoryId));
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    setForm(prev => ({
      ...prev,
      quantity: safeQuantity,
      penaltyAmount: selectedInventory?.priceIfLost ? Number(selectedInventory.priceIfLost) * safeQuantity : prev.penaltyAmount,
    }));
  };

  const handleSave = async () => {
    if (!form.roomInventoryId) {
      alert('Vui lòng chọn vật tư.');
      return;
    }

    setSaving(true);
    try {
      await axiosClient.post('/LossAndDamages', {
        roomInventoryId: Number(form.roomInventoryId),
        quantity: Number(form.quantity),
        penaltyAmount: Number(form.penaltyAmount),
        description: form.description.trim() || null,
        imageUrl: null,
      });
      onSaved();
    } catch (err) {
      alert('Lỗi tạo báo cáo thất thoát: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Thất thoát & đền bù - Phòng {room.roomNumber}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {inventories.length === 0 && (
            <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', fontSize: '0.85rem' }}>
              Phòng này chưa có vật tư để tạo báo cáo thất thoát.
            </div>
          )}
          <div className="form-group">
            <label>Vật tư <span className="required">*</span></label>
            <select className="form-input" value={form.roomInventoryId} onChange={e => handleInventoryChange(e.target.value)}>
              <option value="">-- Chọn vật tư --</option>
              {inventories.map(item => (
                <option key={item.id} value={item.id}>
                  {item.itemName} {item.priceIfLost ? `(${Number(item.priceIfLost).toLocaleString('vi-VN')}đ/cái)` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label>Số lượng hỏng/mất <span className="required">*</span></label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => handleQuantityChange(e.target.value)}
              />
            </div>
            <div className="form-col">
              <label>Tiền đền bù <span className="required">*</span></label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={form.penaltyAmount}
                onChange={e => setForm(prev => ({ ...prev, penaltyAmount: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className="form-input"
              rows={3}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả thất thoát hoặc hư hỏng..."
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-back" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn-save" onClick={handleSave} disabled={saving || inventories.length === 0}>
            {saving ? 'Đang lưu...' : 'Tạo task thất thoát'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== MODAL THÊM / SỬA 1 PHÒNG ========================
function RoomModal({ onClose, onSaved, roomTypes, editRoom, rooms }) {
  const fileRef = useRef();
  const [step, setStep]     = useState(1);
  const [activeTab, setActiveTab] = useState('basic');
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

  const [inventories, setInventories] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invForm, setInvForm] = useState({ equipmentId: '', quantity: 1, note: '' });

  useEffect(() => {
    if (editRoom && activeTab === 'inventory') {
      const fetchInv = async () => {
        setInvLoading(true);
        try {
          const [invRes, eqRes] = await Promise.all([
            axiosClient.get(`/RoomInventories/room/${editRoom.id}`),
            axiosClient.get('/Equipments')
          ]);
          setInventories(invRes.data);
          setEquipments(eqRes.data.filter(e => e.isActive !== false));
        } catch (err) {
          console.error("Lỗi lấy vật tư:", err);
        } finally {
          setInvLoading(false);
        }
      };
      fetchInv();
    }
  }, [editRoom, activeTab]);

  const handleAddInventory = async () => {
    if (!invForm.equipmentId || !invForm.quantity) return;
    const eq = equipments.find(e => String(e.id) === String(invForm.equipmentId));
    if (!eq) return;

    try {
      setInvLoading(true);
      const payload = {
        roomId: editRoom.id,
        itemName: eq.name,
        unit: eq.unit,
        quantity: Number(invForm.quantity),
        priceIfLost: eq.defaultPriceIfLost || eq.basePrice || 0,
        imageUrl: eq.imageUrl,
        note: invForm.note,
        itemType: eq.category || 'Vật tư',
      };
      const res = await axiosClient.post('/RoomInventories', payload);
      setInventories(prev => [res.data, ...prev]);
      setInvForm({ equipmentId: '', quantity: 1, note: '' });
    } catch (err) {
      alert('Lỗi thêm vật tư: ' + (err.response?.data?.message || err.message));
    } finally {
      setInvLoading(false);
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Xóa vật tư này khỏi phòng?')) return;
    try {
      await axiosClient.delete(`/RoomInventories/${id}`);
      setInventories(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

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
        cleanStatus: editRoom?.cleanStatus ?? 'clean',
      };
      if (editRoom) {
        await axiosClient.put(`/Rooms/${editRoom.id}`, payload);
      } else {
        const res = await axiosClient.post('/Rooms', payload);
        const newRoomId = res.data.id;
        
        // Mặc định clone vật tư của hạng phòng từ một phòng đã có cùng hạng
        const templateRoom = rooms?.find(r => r.roomTypeId === Number(form.roomTypeId));
        if (templateRoom) {
          try {
            await axiosClient.post(`/RoomInventories/clone?fromRoomId=${templateRoom.id}&toRoomId=${newRoomId}`);
          } catch (err) {
            console.warn('Lỗi khi clone vật tư từ hạng phòng:', err);
          }
        }
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
  const STEPS = editRoom ? ['Cập nhật thông tin'] : ['Thông tin chung', 'Xác nhận'];

  return (
    <div className="page-in-page" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="rooms-page-header" style={{ marginBottom: 20 }}>
        <div>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, background: 'transparent', border: 'none', padding: 0, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Quay lại danh sách
          </button>
          <h1 className="page-title">{editRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</h1>
        </div>
      </div>
      <div className="table-card" style={{ padding: '24px' }}>

        {editRoom && (
          <div className="room-tabs">
            <button className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>Thông tin cơ bản</button>
            <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Quản lý vật tư</button>
          </div>
        )}

        {/* Stepper */}
        {!editRoom && (
          <div className="stepper" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
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
        )}

        <div className="modal-body">
          {(activeTab === 'basic' && step === 1) && (
            <div className={`modal-step ${editRoom ? 'basic-grid' : ''}`}>
              <div className={editRoom ? "basic-card" : ""}>
                {editRoom && <h4>Tổng quan phòng</h4>}
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
                          {rt.name} {rt.basePrice ? `— ${(Number(rt.basePrice) || 0).toLocaleString('vi-VN')}đ/đêm` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
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

              {editRoom && (
                <div className="basic-card">
                  <h4>Trạng thái vận hành</h4>
                  <div className="form-group">
                    <label>Trạng thái kinh doanh</label>
                    <input className="form-input" value={STATUS_LABEL[form.status] || form.status} disabled style={{ background: '#f9fafb' }} />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái phòng</label>
                    <select className="form-input" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && !editRoom && (
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

          {activeTab === 'inventory' && editRoom && (
            <div className="inventory-tab">
              <div className="inv-add-form" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div className="form-col" style={{ flex: 2 }}>
                  <label>Chọn vật tư từ kho</label>
                  <select className="form-input" value={invForm.equipmentId} onChange={e => setInvForm({...invForm, equipmentId: e.target.value})}>
                    <option value="">-- Chọn vật tư --</option>
                    {equipments.map(eq => (
                      <option key={eq.id} value={eq.id}>[{eq.itemCode || '—'}] {eq.name} ({eq.inStockQuantity} sẵn)</option>
                    ))}
                  </select>
                </div>
                <div className="form-col" style={{ flex: 1 }}>
                  <label>Số lượng</label>
                  <input type="number" min="1" className="form-input" value={invForm.quantity} onChange={e => setInvForm({...invForm, quantity: Number(e.target.value)})} />
                </div>
                <div className="form-col" style={{ flex: 2 }}>
                  <label>Ghi chú</label>
                  <input className="form-input" value={invForm.note || ''} onChange={e => setInvForm({...invForm, note: e.target.value})} placeholder="..." />
                </div>
                <div className="form-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn-save" style={{ height: '38px', padding: '0 16px' }} onClick={handleAddInventory} disabled={invLoading}>
                    <Plus size={16} /> Thêm
                  </button>
                </div>
              </div>

              {invLoading && inventories.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải danh sách vật tư...</div>
              ) : (
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>Mã vật tư</th>
                      <th>Tên vật tư</th>
                      <th>Loại</th>
                      <th>Số lượng</th>
                      <th>Giá đền bù</th>
                      <th>Ghi chú</th>
                      <th style={{ textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventories.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>Chưa có vật tư nào trong phòng</td></tr>
                    ) : inventories.map((inv) => {
                      const mappedCode = equipments.find(e => e.name === inv.itemName)?.itemCode || '—';
                      return (
                        <tr key={inv.id}>
                          <td><strong>{mappedCode}</strong></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {inv.imageUrl && <img src={inv.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />}
                              {inv.itemName}
                            </div>
                          </td>
                          <td>{inv.itemType || '—'}</td>
                          <td>{inv.quantity} {inv.unit}</td>
                          <td>{Number(inv.priceIfLost || 0).toLocaleString('vi-VN')}đ</td>
                          <td>{inv.note || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button className="btn-delete" onClick={() => handleDeleteInventory(inv.id)}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', marginTop: 24, paddingTop: 20 }}>
          {(!editRoom && step > 1) && (
            <button className="btn-back" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={saving}>
              <ChevronLeft size={16} /> Quay lại bước trước
            </button>
          )}
          
          {(step < 2 && !editRoom) ? (
            <button className="btn-next" onClick={handleNext}>
              Tiếp theo <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang phân tích...' : (editRoom ? '✓ Lưu thay đổi' : '✓ Lưu mới phòng')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================== MODAL THÊM PHÒNG HÀNG LOẠT ========================
function BulkCreateModal({ onClose, onSaved, roomTypes, rooms }) {
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
      const res = await axiosClient.post('/Rooms/bulk-create', {
        floor: Number(form.floor),
        roomTypeId: Number(form.roomTypeId),
        numberOfRooms: Number(form.count),
        prefix: form.prefix.trim() || null,
      });

      // Clone vật tư cho hàng loạt phòng vừa tạo
      const templateRoom = rooms?.find(r => r.roomTypeId === Number(form.roomTypeId));
      if (templateRoom && Array.isArray(res.data)) {
        await Promise.allSettled(
          res.data.map(newRoom => 
            axiosClient.post(`/RoomInventories/clone?fromRoomId=${templateRoom.id}&toRoomId=${newRoom.id}`)
          )
        );
      }

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
  const [allInventory, setAllInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch]       = useState('');
  const [filterFloor, setFilterFloor]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTypeId, setFilterTypeId] = useState('');
  const [showModal, setShowModal]       = useState(false);   // single
  const [showBulk, setShowBulk]         = useState(false);   // bulk
  const [lossRoom, setLossRoom]         = useState(null);
  const [editRoom, setEditRoom]         = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [roomsRes, typesRes, inventoryRes] = await Promise.all([
        axiosClient.get('/Rooms'),
        axiosClient.get('/RoomTypes'),
        axiosClient.get('/RoomInventories'),
      ]);
      setRooms(roomsRes.data);
      setRoomTypes(typesRes.data);
      setAllInventory(inventoryRes.data);
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

  const handleCleanStatusChange = async (roomId, value) => {
    if (value === 'loss') {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;
      setLossRoom(room);
      return;
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Khi chuyển sang 'cần dọn' → tự động set trạng thái kinh doanh = 'Cleaning'
    // Khi chuyển từ 'dirty' sang 'clean' → tự động set trạng thái kinh doanh = 'Available'
    let newBusinessStatus = room.status;
    if (value === 'dirty' && room.status !== 'Cleaning') {
      newBusinessStatus = 'Cleaning';
    } else if (value === 'clean' && (room.status === 'Cleaning' || room.status === 'Available')) {
      // Bất kể đang dọn dẹp hay gì, nếu đã sạch sẽ thì là Available (trừ đang có khách chờ)
      newBusinessStatus = 'Available';
    }

    try {
      await axiosClient.patch('/Rooms/patch-clean-status', { roomId, cleanStatus: value });
      if (newBusinessStatus !== room.status) {
        await axiosClient.put(`/Rooms/${roomId}`, {
          roomNumber: room.roomNumber,
          floor: room.floor,
          roomTypeId: room.roomTypeId,
          status: newBusinessStatus,
          cleanStatus: value,
        });
      }
      setRooms(prev => prev.map(r =>
        r.id === roomId ? { ...r, cleanStatus: value, status: newBusinessStatus } : r
      ));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái vệ sinh: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCleanAll = async () => {
    // Bỏ qua phòng đang có khách (Occupied) và bảo trì (Maintenance)
    const eligibleRooms = rooms.filter(r => r.status !== 'Occupied' && r.status !== 'Maintenance');
    if (eligibleRooms.length === 0) {
      alert('Không có phòng nào có thể yêu cầu dọn (tất cả đang có khách hoặc bảo trì).');
      return;
    }
    if (!window.confirm(
      `Yêu cầu dọn toàn bộ ${eligibleRooms.length} phòng?\n` +
      `(Bỏ qua phòng đang có khách hoặc bảo trì)\n\n` +
      `Tất cả phòng đủ điều kiện sẽ được đặt về:\n` +
      `• Vệ sinh: Cần dọn\n• Kinh doanh: Dọn phòng`
    )) return;

    try {
      await Promise.all(
        eligibleRooms.map(room =>
          Promise.all([
            axiosClient.patch('/Rooms/patch-clean-status', { roomId: room.id, cleanStatus: 'dirty' }),
            axiosClient.put(`/Rooms/${room.id}`, {
              roomNumber: room.roomNumber,
              floor: room.floor,
              roomTypeId: room.roomTypeId,
              status: 'Cleaning',
              cleanStatus: 'dirty',
            }),
          ])
        )
      );
      setRooms(prev =>
        prev.map(r =>
          eligibleRooms.find(e => e.id === r.id)
            ? { ...r, cleanStatus: 'dirty', status: 'Cleaning' }
            : r
        )
      );
    } catch (err) {
      alert('Lỗi yêu cầu dọn phòng: ' + (err.response?.data?.message || err.message));
      fetchAll();
    }
  };

  const handleLossSaved = async (roomId) => {
    try {
      await axiosClient.patch('/Rooms/patch-clean-status', { roomId, cleanStatus: 'loss' });
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, cleanStatus: 'loss' } : r));
      setLossRoom(null);
    } catch (err) {
      alert('L?i c?p nh?t tr?ng th?i v? sinh: ' + (err.response?.data?.message || err.message));
    }
  };

  const getRoomInventory = (roomId) =>
    allInventory.filter(i => String(i.roomId) === String(roomId));

  const handleStatusChange = async (room, newStatus) => {
    try {
      await axiosClient.put(`/Rooms/${room.id}`, {
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomTypeId: room.roomTypeId,
        status: newStatus,
        cleanStatus: room.cleanStatus ?? 'clean',
      });
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="rooms-page">
      {/* Nested Page logic */}
      {showModal ? (
        <RoomModal
          onClose={() => setShowModal(false)}
          onSaved={fetchAll}
          roomTypes={roomTypes}
          editRoom={editRoom}
          rooms={rooms}
        />
      ) : showBulk ? (
        <BulkCreateModal
          onClose={() => setShowBulk(false)}
          onSaved={fetchAll}
          roomTypes={roomTypes}
          rooms={rooms}
        />
      ) : (
        <>
          {/* Header */}
          <div className="rooms-page-header">
        <div>
          <h1 className="page-title">Quản lý phòng</h1>
          <p className="page-subtitle">
            {rooms.length} phòng · {rooms.filter(r => r.status === 'Available').length} trống · {rooms.filter(r => r.status === 'Occupied').length} có khách
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          {/* Clean all rooms */}
          <button
            onClick={handleCleanAll}
            title="Đánh dấu toàn bộ phòng (trừ đang có khách / bảo trì) là sạch sẽ & sẵn sàng"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid #16a34a', borderRadius: 8, background: '#f0fdf4', cursor: 'pointer', fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
            ✓ Dọn tất cả phòng
            {rooms.filter(r => (r.cleanStatus || 'clean') === 'dirty').length > 0 && (
              <span style={{ background: '#16a34a', color: '#fff', borderRadius: 12, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700 }}>
                {rooms.filter(r => (r.cleanStatus || 'clean') === 'dirty').length}
              </span>
            )}
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
        <div style={{ width: 140 }}>
          <CustomSelect 
            value={filterFloor} 
            onChange={val => setFilterFloor(val)} 
            placeholder="Tất cả tầng"
            options={[
              { value: '', label: 'Tất cả tầng' },
              ...uniqueFloors.map(f => ({ value: f, label: `Tầng ${f}` }))
            ]}
          />
        </div>
        <div style={{ width: 160 }}>
          <CustomSelect 
            value={filterTypeId} 
            onChange={val => setFilterTypeId(val)} 
            placeholder="Tất cả hạng"
            options={[
              { value: '', label: 'Tất cả hạng' },
              ...roomTypes.map(rt => ({ value: rt.id, label: rt.name }))
            ]}
          />
        </div>
        <div style={{ width: 180 }}>
          <CustomSelect 
            value={filterStatus} 
            onChange={val => setFilterStatus(val)} 
            placeholder="Tất cả trạng thái"
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              ...ALL_STATUSES.map(s => ({ value: s, label: STATUS_LABEL[s] }))
            ]}
          />
        </div>
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
                <th>Vệ sinh</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">
                  {rooms.length === 0 ? 'Chưa có phòng nào trong hệ thống' : 'Không tìm thấy phòng phù hợp'}
                </td></tr>
              ) : filtered.map(room => {
                const roomClean = room.cleanStatus || 'clean';
                return (
                  <tr key={room.id} className={roomClean === 'dirty' ? 'row-needs-cleaning' : ''}>
                    <td><span className="room-number-cell">P.{room.roomNumber}</span></td>
                    <td>Tầng {room.floor ?? '—'}</td>
                    <td>{room.roomTypeName ?? '—'}</td>
                    <td>
                      <CustomSelect
                        className={`status-select ${STATUS_BADGE[room.status] ?? ''}`}
                        value={room.status}
                        onChange={val => handleStatusChange(room, val)}
                        options={ALL_STATUSES.map(s => ({ value: s, label: STATUS_LABEL[s] }))}
                      />
                    </td>
                    <td>
                      <CustomSelect
                        className={`clean-select ${roomClean === 'dirty' ? 'clean-dirty' : roomClean === 'loss' ? 'clean-loss' : 'clean-ok'}`}
                        value={roomClean}
                        onChange={val => handleCleanStatusChange(room.id, val)}
                        options={[
                          { value: 'clean', label: 'Sạch sẽ' },
                          { value: 'dirty', label: 'Cần dọn' },
                          { value: 'loss', label: 'Thất thoát & đền bù' }
                        ]}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-detail"
                        onClick={() => { setEditRoom(room); setShowModal(true); }}
                      >
                        <Eye size={14} /> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="table-footer">
            <span>Hiển thị {filtered.length} / {rooms.length} phòng</span>
          </div>
        )}
      </div>

          {lossRoom && (
            <LossReportModal
              room={lossRoom}
              inventories={getRoomInventory(lossRoom.id)}
              onClose={() => setLossRoom(null)}
              onSaved={() => handleLossSaved(lossRoom.id)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default RoomsPage;
