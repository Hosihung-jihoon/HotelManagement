import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, CheckCircle, Camera, AlertTriangle, RefreshCw } from 'lucide-react';
import { uploadToCloudinary, createLocalPreview } from '../../utils/cloudinaryUpload';
import axiosClient from '../../api/axiosClient';
import './HousekeepingPage.css';

const FINE_MAP = {
  'Khăn tắm lớn': 120000, 'Khăn tắm nhỏ': 60000, 'Dép phòng': 45000,
  'Điều khiển TV': 250000, 'Bình nước 500ml': 15000, 'Trà túi lọc': 5000,
  'Cà phê gói': 8000, 'Coca Cola 330ml': 25000, 'Oreo 115g': 22000, 'Snickers': 18000,
};

// ======================== REPORT MODAL ========================
function ReportModal({ item, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileRef = useRef();
  const fine = (item.priceIfLost || FINE_MAP[item.itemName] || 0) * qty;

  const handleImageChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImagePreview(createLocalPreview(file));
    setUploading(true);
    try {
      const { url } = await uploadToCloudinary(file, 'hotel/housekeeping');
      setImageUrl(url);
    } catch { alert('❌ Upload thất bại.'); }
    finally { setUploading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box report-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Báo hỏng / mất — {item.itemName}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-col">
              <label>Số lượng hỏng <span className="required">*</span></label>
              <input className="form-input" type="number" min="1" max={item.quantity ?? 99} value={qty} onChange={e => setQty(Number(e.target.value))} />
            </div>
            <div className="form-col">
              <label>Tiền phạt (tự động)</label>
              <input className="form-input readonly-field" value={fine.toLocaleString('vi-VN') + 'đ'} readOnly />
            </div>
          </div>
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea className="form-input" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Mô tả tình trạng..." />
          </div>
          <div className="form-group">
            <label>Chụp ảnh bằng chứng</label>
            <div className="upload-area small-upload" onClick={() => fileRef.current.click()}>
              {imagePreview ? <img src={imagePreview} alt="proof" className="upload-preview" /> : (
                <div className="upload-placeholder"><Camera size={24} /><span>Chụp / chọn ảnh</span></div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageChange} />
            {uploading && <p className="upload-status">⏳ Đang tải lên...</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-back" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={() => onConfirm({ qty, fine, note, imageUrl })}>✓ Xác nhận báo cáo</button>
        </div>
      </div>
    </div>
  );
}

function CancelConfirm({ itemName, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <AlertTriangle size={40} style={{ color: '#f59e0b', marginBottom: 8 }} />
        <h4>Bạn có chắc chắn không?</h4>
        <p>Hủy báo cáo <strong>{itemName}</strong>?</p>
        <div className="confirm-actions">
          <button className="btn-back" onClick={onCancel}>Giữ lại</button>
          <button className="btn-delete-confirm" onClick={onConfirm}>Hủy báo cáo</button>
        </div>
      </div>
    </div>
  );
}

// ======================== ROOM PANEL ========================
function RoomPanel({ room, roomInventory, onClose, onFinish }) {
  const [inventoryState, setInventoryState] = useState(
    roomInventory.map(i => ({ ...i, reported: false, reportData: null }))
  );
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Đang kiểm tra');
  const [reportModal, setReportModal]   = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const filtered = inventoryState.filter(i => !search || i.itemName.toLowerCase().includes(search.toLowerCase()));

  const handleReportConfirm = (idx, data) => {
    setInventoryState(prev => prev.map((i, k) => k === idx ? { ...i, reported: true, reportData: data } : i));
    setReportModal(null);
  };
  const handleCancelConfirm = (idx) => {
    setInventoryState(prev => prev.map((i, k) => k === idx ? { ...i, reported: false, reportData: null } : i));
    setCancelConfirm(null);
  };

  const handleFinish = () => {
    setStatus('Hoàn tất');
    onFinish(room.id, inventoryState.filter(i => i.reported));
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="room-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h3>Phòng {room.roomNumber}</h3>
            <p>Tầng {room.floor} · {room.roomTypeName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`panel-status ${status === 'Hoàn tất' ? 'status-done' : 'status-checking'}`}>{status}</span>
            <button className="modal-close" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {status !== 'Hoàn tất' && (
          <div className="panel-finish-bar">
            <button className="btn-finish" onClick={handleFinish}>
              <CheckCircle size={18} /> Hoàn tất (Sạch sẽ)
            </button>
          </div>
        )}

        <div className="panel-body">
          <div className="panel-search">
            <Search size={15} className="search-icon" />
            <input className="search-input" placeholder="Tìm vật tư..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {inventoryState.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Phòng này chưa có danh sách vật tư trong hệ thống
            </div>
          ) : (
            <table className="rooms-table hk-table">
              <thead>
                <tr>
                  <th>Tên vật tư</th>
                  <th style={{ textAlign: 'center' }}>SL trong phòng</th>
                  <th style={{ textAlign: 'right' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const realIdx = inventoryState.findIndex(i => i.id === item.id);
                  return (
                    <tr key={item.id} className={item.reported ? 'reported-row' : ''}>
                      <td>{item.itemName}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity ?? '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {item.reported ? (
                          <button className="btn-reported" onClick={() => setCancelConfirm(realIdx)}>
                            ✓ Đã báo (nhấn để hủy)
                          </button>
                        ) : (
                          <button className="btn-report" onClick={() => setReportModal(realIdx)}>
                            Báo hỏng / mất
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {reportModal !== null && (
          <ReportModal
            item={inventoryState[reportModal]}
            onClose={() => setReportModal(null)}
            onConfirm={(data) => handleReportConfirm(reportModal, data)}
          />
        )}
        {cancelConfirm !== null && (
          <CancelConfirm
            itemName={inventoryState[cancelConfirm].itemName}
            onCancel={() => setCancelConfirm(null)}
            onConfirm={() => handleCancelConfirm(cancelConfirm)}
          />
        )}
      </div>
    </div>
  );
}

// ======================== MAIN COMPONENT ========================
function HousekeepingPage() {
  const [rooms, setRooms]           = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toasts, setToasts]         = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [roomsRes, invRes] = await Promise.all([
        axiosClient.get('/Rooms'),
        axiosClient.get('/RoomInventories'),
      ]);
      // Chỉ lấy các phòng đang được đánh dấu cần dọn.
      // Nếu đã hoàn tất, phòng sẽ được chuyển về Available và không nên quay lại danh sách sau khi refresh.
      const needsCleaning = roomsRes.data.filter(r => (r.cleanStatus || 'clean') === 'dirty');
      setRooms(needsCleaning);
      setAllInventory(invRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu housekeeping:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
  };

  const handleFinish = async (roomId, reported) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    try {
      if (reported.length > 0) {
        await Promise.all(reported.map(item => axiosClient.post('/LossAndDamages', {
          roomInventoryId: Number(item.id),
          quantity: Number(item.reportData?.qty || 1),
          penaltyAmount: Number(item.reportData?.fine || 0),
          description: item.reportData?.note || null,
          imageUrl: item.reportData?.imageUrl || null,
        })));
      }

      await axiosClient.patch('/Rooms/patch-clean-status', {
        roomId,
        cleanStatus: reported.length > 0 ? 'loss' : 'clean',
      });
      setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      console.error('L?i l?u d? li?u housekeeping:', err);
      alert('Kh?ng th? l?u d? li?u d?n ph?ng. Vui l?ng th? l?i.');
      return;
    }

    if (reported.length > 0) {
      reported.forEach(item => {
        addToast(`?????? C???nh b??o th???t tho??t ??? Ph??ng ${room?.roomNumber}\nGhi nh???n h???ng/m???t ${item.itemName} t???i ph??ng ${room?.roomNumber}`);
      });
    } else {
      addToast(`??? Ho??n t???t d???n ph??ng ${room?.roomNumber} ??? Ph??ng ???? s???n s??ng ????n kh??ch`);
    }
    setSelectedRoom(null);
  };

  const getRoomInventory = (roomId) =>
    allInventory.filter(i => i.roomId === roomId);

  return (
    <div className="hk-page">
      <div className="inv-header">
        <div>
          <h1 className="page-title">Dọn phòng</h1>
          <p className="page-subtitle">{rooms.length} phòng cần kiểm tra / dọn</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Đang tải dữ liệu phòng từ database...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="hk-empty">
          <CheckCircle size={56} style={{ color: '#16a34a', marginBottom: 12 }} />
          <h3>Tất cả phòng đã được kiểm tra!</h3>
          <p>Không còn phòng nào chờ dọn dẹp.</p>
        </div>
      ) : (
        <div className="hk-grid">
          {rooms.map(room => (
            <div key={room.id} className="hk-card" onClick={() => setSelectedRoom(room)}>
              <div className="hk-card-top">
                <span className="hk-room-number">P.{room.roomNumber}</span>
                <span className="hk-badge">
                  Cần dọn
                </span>
              </div>
              <div className="hk-card-info">
                <div>Tầng {room.floor}</div>
                <div className="hk-room-type">{room.roomTypeName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {getRoomInventory(room.id).length} vật tư cần kiểm tra
                </div>
              </div>
              <button className="hk-inspect-btn">Nhấn để kiểm tra →</button>
            </div>
          ))}
        </div>
      )}

      {selectedRoom && (
        <RoomPanel
          room={selectedRoom}
          roomInventory={getRoomInventory(selectedRoom.id)}
          onClose={() => setSelectedRoom(null)}
          onFinish={handleFinish}
        />
      )}

      {/* Toast realtime */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast-item">
            <AlertTriangle size={18} style={{ flexShrink: 0, color: '#f59e0b' }} />
            <div className="toast-text">
              {t.msg.split('\n').map((line, i) => (
                <div key={i} className={i === 0 ? 'toast-title' : 'toast-body'}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HousekeepingPage;
