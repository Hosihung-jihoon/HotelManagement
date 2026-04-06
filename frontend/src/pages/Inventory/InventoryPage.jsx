import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Search, RotateCcw, Plus, X, Pencil, Package, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary, createLocalPreview } from '../../utils/cloudinaryUpload';
import axiosClient from '../../api/axiosClient';
import './InventoryPage.css';

const emptyForm = {
  itemName: '', unit: '', roomId: '',
  quantity: '', quantityInUse: 0, quantityDamaged: 0,
  priceIfLost: '', imageUrl: '', note: '', itemType: '',
};

/* ── Thumbnail ảnh vật tư ── */
function ItemThumb({ src }) {
  const [err, setErr] = useState(false);
  const style = {
    width: 44, height: 44, borderRadius: 8, objectFit: 'cover',
    border: '1px solid var(--border-color)', display: 'block', flexShrink: 0,
  };
  const placeholder = {
    width: 44, height: 44, borderRadius: 8, flexShrink: 0,
    background: '#f3f4f6', border: '1px dashed #d1d5db',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  if (!src || err) {
    return (
      <div style={placeholder} title="Chưa có ảnh">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return <img src={src} alt="vật tư" style={style} onError={() => setErr(true)} />;
}

/* ── Upload ảnh area ── */
function ImageUploadArea({ preview, onFile, uploading, finalUrl }) {
  const ref = useRef();
  return (
    <div>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: '2px dashed var(--border-color)', borderRadius: 10, padding: 16,
          textAlign: 'center', cursor: 'pointer', background: 'var(--surface-hover, #f9fafb)',
          transition: 'border-color .2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary, #2563eb)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        {preview ? (
          <img src={preview} alt="preview"
            style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'cover', margin: '0 auto', display: 'block' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <ImageIcon size={28} />
            <span style={{ fontSize: '0.85rem' }}>Nhấn để chọn / kéo ảnh vào đây</span>
            <small style={{ fontSize: '0.75rem' }}>JPG, PNG, WEBP — tối đa 5MB</small>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>⏳ Đang tải lên Cloudinary...</p>}
      {finalUrl && !uploading && <p style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: 4 }}>✅ Ảnh đã lưu</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════ */
function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [invRes, roomsRes] = await Promise.all([
        axiosClient.get('/RoomInventories'),
        axiosClient.get('/Rooms'),
      ]);
      setInventory(invRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      console.error('Lỗi tải kho vật tư:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Group by itemName — gom tất cả phòng thành 1 dòng mỗi loại vật tư ── */
  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of inventory) {
      const key = item.itemName.trim().toLowerCase();
      if (map.has(key)) {
        const g = map.get(key);
        g.quantity        += (item.quantity ?? 0);
        g.quantityInUse   += (item.quantityInUse ?? 0);
        g.quantityDamaged += (item.quantityDamaged ?? 0);
        g.roomCount       += 1;
        g._ids.push(item.id);
        // dùng ảnh đầu tiên tìm được
        if (!g.imageUrl && item.imageUrl) g.imageUrl = item.imageUrl;
      } else {
        map.set(key, {
          _key:            key,
          _ids:            [item.id],
          _firstId:        item.id,
          itemName:        item.itemName,
          unit:            item.unit,
          imageUrl:        item.imageUrl,
          priceIfLost:     item.priceIfLost,
          itemType:        item.itemType,
          quantity:        item.quantity ?? 0,
          quantityInUse:   item.quantityInUse ?? 0,
          quantityDamaged: item.quantityDamaged ?? 0,
          roomCount:       1,
          // giữ raw item đầu để edit
          _raw:            item,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.itemName.localeCompare(b.itemName, 'vi'));
  }, [inventory]);

  const filtered = grouped.filter(g => {
    const q = search.toLowerCase();
    return !q || g.itemName.toLowerCase().includes(q);
  });

  /* ── Modal helpers ── */
  const openAdd  = () => { setEditItem(null); setForm(emptyForm); setImagePreview(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      itemName: item.itemName ?? '', unit: item.unit ?? '', roomId: item.roomId ?? '',
      quantity: item.quantity ?? '', quantityInUse: item.quantityInUse ?? 0,
      quantityDamaged: item.quantityDamaged ?? 0, priceIfLost: item.priceIfLost ?? '',
      imageUrl: item.imageUrl ?? '', note: item.note ?? '', itemType: item.itemType ?? '',
    });
    setImagePreview(item.imageUrl || null);
    setShowModal(true);
  };
  const closeModal  = () => { setShowModal(false); setEditItem(null); setImagePreview(null); };
  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImageFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImagePreview(createLocalPreview(file));
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, 'hotel/inventory');
      setForm(prev => ({ ...prev, imageUrl: url }));
    } catch { alert('❌ Upload ảnh thất bại.'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.itemName || !form.quantity) { alert('Vui lòng điền tên vật tư và số lượng!'); return; }
    setSaving(true);
    try {
      const payload = {
        itemName:        form.itemName,
        unit:            form.unit || null,
        roomId:          form.roomId ? Number(form.roomId) : null,
        quantity:        Number(form.quantity),
        quantityInUse:   Number(form.quantityInUse) || 0,
        quantityDamaged: Number(form.quantityDamaged) || 0,
        priceIfLost:     form.priceIfLost ? Number(form.priceIfLost) : null,
        imageUrl:        form.imageUrl || null,
        note:            form.note || null,
        itemType:        form.itemType || null,
      };
      if (editItem) {
        await axiosClient.put(`/RoomInventories/${editItem.id}`, payload);
      } else {
        await axiosClient.post('/RoomInventories', payload);
      }
      closeModal();
      fetchAll();
    } catch (err) {
      alert('Lỗi lưu vật tư: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa vật tư này?')) return;
    try {
      await axiosClient.delete(`/RoomInventories/${id}`);
      setInventory(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  /* ── Số lượng còn lại (không âm) ── */
  const remaining = (item) =>
    Math.max(0, (item.quantity ?? 0) - (item.quantityInUse ?? 0) - (item.quantityDamaged ?? 0));

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="page-title">Kho vật tư</h1>
          <p className="page-subtitle">{grouped.length} loại vật tư · {inventory.length} bản ghi</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          <button className="btn-add" onClick={openAdd}><Plus size={18} /> Thêm vật tư</button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Tìm theo tên vật tư..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-reset" onClick={() => { setSearch(''); }} title="Xóa bộ lọc">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Đang tải kho vật tư...</p>
          </div>
        ) : (
          <table className="rooms-table inv-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>Ảnh</th>
                <th>Tên vật tư</th>
                <th style={{ textAlign: 'center', width: 60 }}>ĐVT</th>
                <th style={{ textAlign: 'center', width: 80 }}>Tổng</th>
                <th style={{ textAlign: 'center', width: 90 }}>Đang dùng</th>
                <th style={{ textAlign: 'center', width: 90 }}>Còn lại</th>
                <th style={{ textAlign: 'center', width: 80 }}>Hỏng/Mất</th>
                <th style={{ width: 130 }}>Giá đền bù</th>
                <th style={{ textAlign: 'center', width: 70 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="empty-row">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Package size={32} style={{ opacity: 0.3 }} />
                    <span>{inventory.length === 0 ? 'Chưa có vật tư nào trong kho' : 'Không tìm thấy vật tư phù hợp'}</span>
                  </div>
                </td></tr>
              ) : filtered.map(g => {
                const left = remaining(g);
                return (
                  <tr key={g._key}>
                    <td style={{ padding: '8px 10px' }}>
                      <ItemThumb src={g.imageUrl} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="inv-name">{g.itemName}</span>
                        {g.roomCount > 1 && (
                          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                            Tổng hợp từ {g.roomCount} phòng
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {g.unit || '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{g.quantity}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        color: g.quantityInUse > 0 ? '#2563eb' : 'var(--text-muted)',
                        fontWeight: g.quantityInUse > 0 ? 700 : 400,
                      }}>{g.quantityInUse}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700,
                        color: left === 0 ? '#ef4444' : left < 3 ? '#f59e0b' : '#16a34a',
                      }}>{left}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {g.quantityDamaged > 0 ? (
                        <span className="qty-damaged negative">-{g.quantityDamaged}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                      )}
                    </td>
                    <td>
                      {g.priceIfLost ? (
                        <span className="fine-amount">{Number(g.priceIfLost).toLocaleString('vi-VN')}đ</span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-edit"
                        onClick={() => openEdit(g._raw)}
                        title="Chỉnh sửa"
                        style={{ padding: '6px 8px' }}
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="table-footer">Hiển thị {filtered.length} / {grouped.length} loại vật tư</div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Tên + ĐVT */}
              <div className="form-row">
                <div className="form-col" style={{ flex: 2 }}>
                  <label>Tên vật tư <span className="required">*</span></label>
                  <input className="form-input" value={form.itemName}
                    onChange={e => handleChange('itemName', e.target.value)} placeholder="VD: Khăn tắm" />
                </div>
                <div className="form-col" style={{ flex: 1 }}>
                  <label>ĐVT</label>
                  <input className="form-input" value={form.unit}
                    onChange={e => handleChange('unit', e.target.value)} placeholder="cái / bộ / m..." />
                </div>
              </div>

              {/* Phòng + Loại */}
              <div className="form-row">
                <div className="form-col">
                  <label>Phòng</label>
                  <select className="form-input" value={form.roomId} onChange={e => handleChange('roomId', e.target.value)}>
                    <option value="">-- Kho chung --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>Phòng {r.roomNumber} (Tầng {r.floor})</option>
                    ))}
                  </select>
                </div>
                <div className="form-col">
                  <label>Loại vật tư</label>
                  <input className="form-input" value={form.itemType}
                    onChange={e => handleChange('itemType', e.target.value)} placeholder="Đồ dùng / Thiết bị..." />
                </div>
              </div>

              {/* Số lượng */}
              <div className="form-row">
                <div className="form-col">
                  <label>Tổng số lượng <span className="required">*</span></label>
                  <input className="form-input" type="number" min="0" value={form.quantity}
                    onChange={e => handleChange('quantity', e.target.value)} />
                </div>
                <div className="form-col">
                  <label>Đang sử dụng</label>
                  <input className="form-input" type="number" min="0" value={form.quantityInUse}
                    onChange={e => handleChange('quantityInUse', e.target.value)} />
                </div>
                <div className="form-col">
                  <label>Hỏng / Mất</label>
                  <input className="form-input" type="number" min="0" value={form.quantityDamaged}
                    onChange={e => handleChange('quantityDamaged', e.target.value)} />
                </div>
              </div>

              {/* Giá đền bù */}
              <div className="form-group">
                <label>Giá đền bù nếu mất/hỏng (VNĐ)</label>
                <input className="form-input" type="number" min="0" value={form.priceIfLost}
                  onChange={e => handleChange('priceIfLost', e.target.value)} placeholder="0" />
              </div>

              {/* Ảnh upload */}
              <div className="form-group">
                <label>Ảnh vật tư (tùy chọn)</label>
                <ImageUploadArea
                  preview={imagePreview}
                  onFile={handleImageFile}
                  uploading={uploading}
                  finalUrl={form.imageUrl}
                />
              </div>

              {/* Ghi chú */}
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea className="form-input" rows={2} value={form.note}
                  onChange={e => handleChange('note', e.target.value)}
                  placeholder="Ghi chú thêm về vật tư..." />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-back" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="btn-save" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Đang lưu...' : `✓ ${editItem ? 'Cập nhật' : 'Thêm mới'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
