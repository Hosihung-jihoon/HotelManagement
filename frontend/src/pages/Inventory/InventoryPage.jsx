import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, RotateCcw, Plus, X, Pencil, Package, RefreshCw } from 'lucide-react';
import { uploadToCloudinary, createLocalPreview } from '../../utils/cloudinaryUpload';
import axiosClient from '../../api/axiosClient';
import './InventoryPage.css';

const emptyForm = { itemName: '', roomId: '', quantity: '', priceIfLost: '' };

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef();

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

  const getRoomLabel = (roomId) => {
    const r = rooms.find(r => r.id === roomId);
    return r ? `P.${r.roomNumber}` : `Phòng #${roomId}`;
  };

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.itemName.toLowerCase().includes(q);
    const matchRoom   = !filterRoom || String(item.roomId) === filterRoom;
    return matchSearch && matchRoom;
  });

  const handleReset  = () => { setSearch(''); setFilterRoom(''); };
  const openAdd      = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit     = (item) => {
    setEditItem(item);
    setForm({ itemName: item.itemName, roomId: item.roomId ?? '', quantity: item.quantity ?? '', priceIfLost: item.priceIfLost ?? '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditItem(null); };
  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.itemName || !form.quantity) { alert('Vui lòng điền tên vật tư và số lượng!'); return; }
    setSaving(true);
    try {
      const payload = {
        itemName: form.itemName,
        roomId: form.roomId ? Number(form.roomId) : null,
        quantity: Number(form.quantity),
        priceIfLost: form.priceIfLost ? Number(form.priceIfLost) : null,
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

  // Nhóm theo phòng để hiển thị filter
  const uniqueRoomIds = [...new Set(inventory.map(i => i.roomId).filter(Boolean))];

  return (
    <div className="inventory-page">
      <div className="inv-header">
        <div>
          <h1 className="page-title">Kho vật tư</h1>
          <p className="page-subtitle">{inventory.length} mục vật tư trong {uniqueRoomIds.length} phòng</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-add" onClick={fetchAll} disabled={loading}
            style={{ background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Làm mới
          </button>
          <button className="btn-add" onClick={openAdd}><Plus size={18} /> Thêm vật tư mới</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Tìm theo tên vật tư..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
          <option value="">Tất cả phòng</option>
          {uniqueRoomIds.map(rid => (
            <option key={rid} value={rid}>{getRoomLabel(rid)}</option>
          ))}
        </select>
        <button className="btn-reset" onClick={handleReset} title="Làm mới"><RotateCcw size={16} /></button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Đang tải dữ liệu kho vật tư...</p>
          </div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Tên vật tư</th>
                <th>Phòng</th>
                <th style={{ textAlign: 'center' }}>Số lượng</th>
                <th>Giá đền bù</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="empty-row">
                  {inventory.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Package size={32} style={{ opacity: 0.3 }} />
                      <span>Chưa có vật tư nào trong kho</span>
                    </div>
                  ) : 'Không tìm thấy vật tư phù hợp'}
                </td></tr>
              ) : filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="inv-thumb-placeholder" style={{ display: 'inline-flex', marginRight: 8 }}><Package size={16} /></div>
                    <span className="inv-name">{item.itemName}</span>
                  </td>
                  <td>
                    {item.roomId ? (
                      <span className="role-badge role-receptionist">{getRoomLabel(item.roomId)}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Kho chung</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <strong>{item.quantity ?? '—'}</strong>
                  </td>
                  <td>
                    {item.priceIfLost ? (
                      <span className="fine-amount">{Number(item.priceIfLost).toLocaleString('vi-VN')}đ</span>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => openEdit(item)}><Pencil size={14} /> Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}>
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && <div className="table-footer">Hiển thị {filtered.length} / {inventory.length} vật tư</div>}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên vật tư <span className="required">*</span></label>
                <input className="form-input" value={form.itemName} onChange={e => handleChange('itemName', e.target.value)} placeholder="VD: Khăn tắm lớn" />
              </div>
              <div className="form-row">
                <div className="form-col">
                  <label>Phòng (tùy chọn)</label>
                  <select className="form-input" value={form.roomId} onChange={e => handleChange('roomId', e.target.value)}>
                    <option value="">-- Kho chung --</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.roomNumber} (Tầng {r.floor})</option>)}
                  </select>
                </div>
                <div className="form-col">
                  <label>Số lượng <span className="required">*</span></label>
                  <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => handleChange('quantity', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Giá đền bù nếu mất/hỏng (VNĐ)</label>
                <input className="form-input" type="number" min="0" value={form.priceIfLost} onChange={e => handleChange('priceIfLost', e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-back" onClick={closeModal} disabled={saving}>Hủy</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
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
