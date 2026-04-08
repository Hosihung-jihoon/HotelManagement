import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, RotateCcw, Plus, X, Pencil, Package, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { uploadToCloudinary, createLocalPreview } from '../../utils/cloudinaryUpload';
import axiosClient from '../../api/axiosClient';
import './InventoryPage.css';

const emptyForm = {
  itemCode: '', name: '', category: '', unit: '', supplier: '',
  totalQuantity: '', inUseQuantity: 0, damagedQuantity: 0, liquidatedQuantity: 0,
  basePrice: '', defaultPriceIfLost: '', imageUrl: '', isActive: true
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
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Equipments');
      setEquipments(res.data);
    } catch (err) {
      console.error('Lỗi tải danh mục vật tư:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = equipments.filter(e => {
    const q = search.toLowerCase();
    return !q || e.name.toLowerCase().includes(q) || (e.itemCode && e.itemCode.toLowerCase().includes(q));
  });

  /* ── Modal helpers ── */
  const openAdd  = () => { setEditItem(null); setForm(emptyForm); setImagePreview(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      itemCode: item.itemCode ?? '', name: item.name ?? '', category: item.category ?? '',
      unit: item.unit ?? '', supplier: item.supplier ?? '',
      totalQuantity: item.totalQuantity ?? '', inUseQuantity: item.inUseQuantity ?? 0,
      damagedQuantity: item.damagedQuantity ?? 0, liquidatedQuantity: item.liquidatedQuantity ?? 0,
      basePrice: item.basePrice ?? '', defaultPriceIfLost: item.defaultPriceIfLost ?? '',
      imageUrl: item.imageUrl ?? '', isActive: item.isActive ?? true
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
    if (!form.name || form.totalQuantity === '') { alert('Vui lòng điền tên vật tư và tổng số lượng!'); return; }
    setSaving(true);
    try {
      const payload = {
        itemCode: form.itemCode || null,
        name: form.name,
        category: form.category || null,
        unit: form.unit || null,
        totalQuantity: Number(form.totalQuantity),
        inUseQuantity: Number(form.inUseQuantity) || 0,
        damagedQuantity: Number(form.damagedQuantity) || 0,
        liquidatedQuantity: Number(form.liquidatedQuantity) || 0,
        basePrice: form.basePrice ? Number(form.basePrice) : null,
        defaultPriceIfLost: form.defaultPriceIfLost ? Number(form.defaultPriceIfLost) : null,
        supplier: form.supplier || null,
        imageUrl: form.imageUrl || null,
        isActive: form.isActive,
      };

      if (editItem) {
        await axiosClient.put(`/Equipments/${editItem.id}`, payload);
      } else {
        await axiosClient.post('/Equipments', payload);
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
    if (!window.confirm('Xóa vật tư này? Vật tư sẽ gỡ khỏi danh mục chính!')) return;
    try {
      await axiosClient.delete(`/Equipments/${id}`);
      setEquipments(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="page-title">Kho vật tư (Master Data)</h1>
          <p className="page-subtitle">{equipments.length} danh mục vật tư</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
          </button>
          <button className="btn-add" onClick={openAdd}><Plus size={18} /> Thêm vật tư gốc</button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Tìm theo tên hoặc mã..." value={search}
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
                <th>Tên vật tư (Mã)</th>
                <th style={{ textAlign: 'center' }}>Danh mục</th>
                <th style={{ textAlign: 'center', width: 60 }}>ĐVT</th>
                <th style={{ textAlign: 'center', width: 80 }}>Tổng</th>
                <th style={{ textAlign: 'center', width: 90 }}>Đang dùng</th>
                <th style={{ textAlign: 'center', width: 90 }}>Tồn kho</th>
                <th style={{ textAlign: 'center', width: 80 }}>Hỏng/Mất</th>
                <th style={{ width: 130 }}>Giá đền bù</th>
                <th style={{ textAlign: 'center', width: 70 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="empty-row">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Package size={32} style={{ opacity: 0.3 }} />
                    <span>{equipments.length === 0 ? 'Chưa có vật tư nào trong kho' : 'Không tìm thấy vật tư phù hợp'}</span>
                  </div>
                </td></tr>
              ) : filtered.map(item => {
                const stock = item.inStockQuantity ?? 0;
                return (
                  <tr key={item.id}>
                    <td style={{ padding: '8px 10px' }}>
                      <ItemThumb src={item.imageUrl} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="inv-name">{item.name}</span>
                        {item.itemCode && (
                          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                            Mã: {item.itemCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {item.category || '—'}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {item.unit || '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.totalQuantity ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        color: item.inUseQuantity > 0 ? '#2563eb' : 'var(--text-muted)',
                        fontWeight: item.inUseQuantity > 0 ? 700 : 400,
                      }}>{item.inUseQuantity ?? 0}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700,
                        color: stock === 0 ? '#ef4444' : stock < 5 ? '#f59e0b' : '#16a34a',
                      }}>{stock}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.damagedQuantity > 0 ? (
                        <span className="qty-damaged negative">-{item.damagedQuantity}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                      )}
                    </td>
                    <td>
                      {item.defaultPriceIfLost ? (
                        <span className="fine-amount">{Number(item.defaultPriceIfLost).toLocaleString('vi-VN')}đ</span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="btn-edit" onClick={() => openEdit(item)} title="Chỉnh sửa"><Pencil size={14} /></button>
                        <button className="btn-delete" onClick={() => handleDelete(item.id)} title="Xóa"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="table-footer">Hiển thị {filtered.length} / {equipments.length} danh mục vật tư</div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Chỉnh sửa vật tư gốc' : 'Thêm vật tư gốc mới'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-grid">
                
                {/* Cột Trái */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-col">
                    <label>Ảnh vật tư</label>
                    <ImageUploadArea preview={imagePreview} onFile={handleImageFile} uploading={uploading} finalUrl={form.imageUrl} />
                  </div>
                  
                  <div className="form-col">
                    <label>Tên vật tư <span className="req">*</span></label>
                    <input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="VD: Khăn tắm lớn" />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="form-col" style={{ flex: 1 }}>
                      <label>Mã vật tư</label>
                      <input className="form-input" value={form.itemCode} onChange={e => handleChange('itemCode', e.target.value)} placeholder="VD: KT01" />
                    </div>
                    <div className="form-col" style={{ flex: 1 }}>
                      <label>Danh mục</label>
                      <input className="form-input" value={form.category} onChange={e => handleChange('category', e.target.value)} placeholder="VD: Đồ vải" />
                    </div>
                  </div>
                </div>

                {/* Cột Phải */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="form-col" style={{ flex: 1 }}>
                      <label>Tổng Số lượng <span className="req">*</span></label>
                      <input className="form-input" type="number" min="0" value={form.totalQuantity} onChange={e => handleChange('totalQuantity', e.target.value)} />
                    </div>
                    <div className="form-col" style={{ flex: 1 }}>
                      <label>ĐVT</label>
                      <input className="form-input" value={form.unit} onChange={e => handleChange('unit', e.target.value)} placeholder="VD: Cái" />
                    </div>
                  </div>

                  {editItem && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div className="form-col" style={{ flex: 1 }}>
                        <label>Đang dùng</label>
                        <input className="form-input" type="number" min="0" value={form.inUseQuantity} onChange={e => handleChange('inUseQuantity', e.target.value)} />
                      </div>
                      <div className="form-col" style={{ flex: 1 }}>
                        <label>Bị hỏng/mất</label>
                        <input className="form-input" type="number" min="0" value={form.damagedQuantity} onChange={e => handleChange('damagedQuantity', e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="form-col" style={{ flex: 1 }}>
                      <label>Giá nhập (Base Price)</label>
                      <input className="form-input" type="number" step="1000" min="0" value={form.basePrice} onChange={e => handleChange('basePrice', e.target.value)} placeholder="VNĐ" />
                    </div>
                    <div className="form-col" style={{ flex: 1 }}>
                      <label>Giá đền bù</label>
                      <input className="form-input" type="number" step="1000" min="0" value={form.defaultPriceIfLost} onChange={e => handleChange('defaultPriceIfLost', e.target.value)} placeholder="VNĐ" />
                    </div>
                  </div>

                  <div className="form-col">
                    <label>Nhà cung cấp</label>
                    <input className="form-input" value={form.supplier} onChange={e => handleChange('supplier', e.target.value)} placeholder="VD: Cty TNHH ABC" />
                  </div>
                  
                  <div className="form-col" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} />
                    <label htmlFor="isActive" style={{ marginBottom: 0 }}>Đang sử dụng (Active)</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="btn-submit" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Đang lưu...' : (editItem ? 'Cập nhật' : 'Thêm vật tư')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
