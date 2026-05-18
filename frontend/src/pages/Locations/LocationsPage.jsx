import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Pencil, Trash2, MapPin, Globe, Building2, RefreshCw, Navigation } from 'lucide-react';
import '../RoomTypes/RoomTypesPage.css';

// ────────────────────────────────────────────────────────────────
// Haversine formula (JS-side, real-time preview only)
// ────────────────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

function nearestBranchDist(attraction, branches) {
  if (!attraction.latitude || !attraction.longitude || !branches.length) return null;
  let best = null;
  for (const b of branches) {
    if (!b.latitude || !b.longitude) continue;
    const d = parseFloat(
      haversine(
        parseFloat(b.latitude), parseFloat(b.longitude),
        parseFloat(attraction.latitude), parseFloat(attraction.longitude)
      )
    );
    if (best === null || d < best) best = d;
  }
  return best;
}

// ────────────────────────────────────────────────────────────────
export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('locations'); // 'locations' | 'branches'
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', distanceKm: '', description: '', mapEmbedLink: '',
    latitude: '', longitude: '', address: '', isActive: true
  });
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [branchForm, setBranchForm] = useState({
    name: '', address: '', latitude: '', longitude: '', phone: '', isMain: false, isActive: true
  });
  const [mapModal, setMapModal] = useState(null);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcMsg, setRecalcMsg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [locRes, branchRes] = await Promise.all([
        axiosClient.get('/Attractions'),
        axiosClient.get('/HotelBranches')
      ]);
      setLocations(locRes.data);
      setBranches(branchRes.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Attraction handlers ──────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : null,
        latitude:   formData.latitude   ? parseFloat(formData.latitude)   : null,
        longitude:  formData.longitude  ? parseFloat(formData.longitude)  : null,
      };
      if (editingId) {
        await axiosClient.put(`/Attractions/${editingId}`, payload);
      } else {
        await axiosClient.post('/Attractions', payload);
      }
      resetForm();
      fetchAll();
    } catch (err) { alert('Lỗi lưu dữ liệu: ' + (err.response?.data?.message || err.message)); }
  };

  const handleEdit = (loc) => {
    setEditingId(loc.id);
    setFormData({ name: loc.name, distanceKm: loc.distanceKm || '', description: loc.description || '',
      mapEmbedLink: loc.mapEmbedLink || '', latitude: loc.latitude || '',
      longitude: loc.longitude || '', address: loc.address || '', isActive: loc.isActive ?? true });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa điểm này?')) return;
    try { await axiosClient.delete(`/Attractions/${id}`); fetchAll(); }
    catch (err) { alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message)); }
  };

  const toggleStatus = async (loc) => {
    try {
      await axiosClient.put(`/Attractions/${loc.id}`, {
        name: loc.name, distanceKm: loc.distanceKm, description: loc.description,
        mapEmbedLink: loc.mapEmbedLink, latitude: loc.latitude, longitude: loc.longitude,
        address: loc.address, isActive: !loc.isActive
      });
      fetchAll();
    } catch (err) { alert('Lỗi bật tắt trạng thái: ' + err.message); }
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setFormData({ name: '', distanceKm: '', description: '', mapEmbedLink: '',
      latitude: '', longitude: '', address: '', isActive: true });
  };

  // ── Branch handlers ──────────────────────────────────────────
  const handleBranchChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBranchForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...branchForm,
        latitude:  branchForm.latitude  ? parseFloat(branchForm.latitude)  : null,
        longitude: branchForm.longitude ? parseFloat(branchForm.longitude) : null,
      };
      if (editingBranchId) {
        await axiosClient.put(`/HotelBranches/${editingBranchId}`, payload);
      } else {
        await axiosClient.post('/HotelBranches', payload);
      }
      resetBranchForm();
      fetchAll();
    } catch (err) { alert('Lỗi lưu chi nhánh: ' + (err.response?.data?.message || err.message)); }
  };

  const handleBranchEdit = (b) => {
    setEditingBranchId(b.id);
    setBranchForm({ name: b.name, address: b.address || '', latitude: b.latitude || '',
      longitude: b.longitude || '', phone: b.phone || '', isMain: b.isMain, isActive: b.isActive });
    setShowBranchForm(true);
  };

  const handleBranchDelete = async (id) => {
    if (!window.confirm('Xóa chi nhánh này?')) return;
    try { await axiosClient.delete(`/HotelBranches/${id}`); fetchAll(); }
    catch (err) { alert('Lỗi xóa: ' + err.message); }
  };

  const resetBranchForm = () => {
    setShowBranchForm(false); setEditingBranchId(null);
    setBranchForm({ name: '', address: '', latitude: '', longitude: '', phone: '', isMain: false, isActive: true });
  };

  // ── Recalc distances ─────────────────────────────────────────
  const handleRecalcDistances = async () => {
    try {
      setRecalcLoading(true); setRecalcMsg('');
      await axiosClient.post('/HotelBranches/recalc-distances');
      setRecalcMsg('✓ Đã cập nhật khoảng cách thực tế cho tất cả địa điểm!');
      fetchAll();
    } catch (err) {
      setRecalcMsg('Lỗi tính lại khoảng cách: ' + (err.response?.data?.message || err.message));
    } finally { setRecalcLoading(false); }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    background: activeTab === tab ? 'var(--primary-color, #2563eb)' : '#f1f5f9',
    color: activeTab === tab ? '#fff' : '#64748b',
    border: 'none', borderRadius: '8px 8px 0 0',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
  });

  return (
    <div className="room-types-page">
      <div className="page-header">
        <h1><MapPin size={28} className="header-icon" /> Quản Lý Địa Điểm</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'locations' && (
            <>
              <button
                className="btn btn-secondary"
                onClick={handleRecalcDistances}
                disabled={recalcLoading || branches.length === 0}
                title="Tính lại khoảng cách từ địa điểm đến từng chi nhánh khách sạn"
              >
                {recalcLoading
                  ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Đang tính...</>
                  : <><Navigation size={15} /> Tính lại khoảng cách</>}
              </button>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={18} /> Thêm Địa Điểm
              </button>
            </>
          )}
          {activeTab === 'branches' && (
            <button className="btn btn-primary" onClick={() => setShowBranchForm(true)}>
              <Plus size={18} /> Thêm Chi Nhánh
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {recalcMsg && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12,
          background: recalcMsg.startsWith('✓') ? '#dcfce7' : '#fee2e2',
          color: recalcMsg.startsWith('✓') ? '#15803d' : '#b91c1c', fontSize: '0.875rem' }}>
          {recalcMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '-1px' }}>
        <button style={tabStyle('locations')} onClick={() => setActiveTab('locations')}>
          <MapPin size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Địa Điểm Tham Quan
        </button>
        <button style={tabStyle('branches')} onClick={() => setActiveTab('branches')}>
          <Building2 size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Chi Nhánh Khách Sạn ({branches.length})
        </button>
      </div>

      {/* ── TAB: LOCATIONS ──────────────────────────────────── */}
      {activeTab === 'locations' && (
        <>
          {showForm && (
            <div className="form-card" style={{ borderRadius: '0 8px 8px 8px', marginTop: 0 }}>
              <h3>{editingId ? <><Pencil size={20} /> Sửa Địa Điểm</> : <><Plus size={20} /> Thêm Địa Điểm Mới</>}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tên địa điểm</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Khoảng cách thủ công (km)
                      <small style={{ color: '#94a3b8', marginLeft: 6 }}>
                        (sẽ được ghi đè khi bấm "Tính lại khoảng cách")
                      </small>
                    </label>
                    <input type="number" step="0.1" name="distanceKm" value={formData.distanceKm} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Vĩ độ (Latitude)</label>
                    <input type="number" step="0.00000001" name="latitude" value={formData.latitude} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Kinh độ (Longitude)</label>
                    <input type="number" step="0.00000001" name="longitude" value={formData.longitude} onChange={handleInputChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Địa chỉ cụ thể</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Mã nhúng Google Maps (Embed Link / URL)</label>
                    <input type="text" name="mapEmbedLink" value={formData.mapEmbedLink} onChange={handleInputChange}
                      placeholder='https://www.google.com/maps/embed?pb=... hoặc dán thẻ <iframe ...>' />
                  </div>
                  <div className="form-group full-width">
                    <label>Mô tả</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} id="isActiveCheck" />
                    <label htmlFor="isActiveCheck" style={{ margin: 0, cursor: 'pointer' }}>Đang hoạt động</label>
                  </div>
                  {/* Realtime distance preview */}
                  {formData.latitude && formData.longitude && branches.filter(b => b.latitude && b.longitude).length > 0 && (
                    <div className="form-group full-width">
                      <label style={{ color: '#2563eb' }}>
                        <Navigation size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Khoảng cách thực tế (xem trước)
                      </label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {branches.filter(b => b.latitude && b.longitude).map(b => (
                          <span key={b.id} style={{ padding: '4px 10px', background: '#eff6ff', borderRadius: 20,
                            fontSize: '0.82rem', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                            {b.name}: {haversine(
                              parseFloat(b.latitude), parseFloat(b.longitude),
                              parseFloat(formData.latitude), parseFloat(formData.longitude)
                            )} km
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingId ? 'Cập Nhật' : 'Tạo Mới'}</button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button>
                </div>
              </form>
            </div>
          )}

          <div className="table-card" style={{ borderRadius: showForm ? 8 : '0 8px 8px 8px', marginTop: showForm ? 12 : 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Địa Điểm</th>
                  <th>Khoảng cách</th>
                  <th>Địa chỉ / Tọa độ</th>
                  <th>Trạng thái</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {locations.length === 0 ? (
                  <tr><td colSpan="6" className="empty-row">Chưa có dữ liệu</td></tr>
                ) : locations.map(loc => {
                  const nearestKm = nearestBranchDist(loc, branches);
                  return (
                    <tr key={loc.id}>
                      <td>{loc.id}</td>
                      <td className="name-cell">
                        <strong>{loc.name}</strong>
                        {loc.description && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{loc.description.slice(0, 60)}{loc.description.length > 60 ? '...' : ''}</div>}
                      </td>
                      <td>
                        {loc.distanceKm != null && (
                          <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{loc.distanceKm} km</span>
                        )}
                        {nearestKm !== null && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                            <Navigation size={11} style={{ verticalAlign: 'middle' }} /> Gần nhất: {nearestKm} km
                          </div>
                        )}
                      </td>
                      <td>
                        {loc.address && <div>{loc.address}</div>}
                        {loc.latitude && <div><MapPin size={12} style={{ display: 'inline' }} /> {loc.latitude}, {loc.longitude}</div>}
                        {loc.mapEmbedLink && (
                          <div style={{ color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}
                            onClick={() => setMapModal(loc)}>
                            <Globe size={14} /> Xem bản đồ
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, cursor: 'pointer',
                          backgroundColor: loc.isActive ? '#dbeafe' : '#f1f5f9',
                          color: loc.isActive ? '#1d4ed8' : '#64748b' }}
                          onClick={() => toggleStatus(loc)} title="Nhấn để đổi trạng thái">
                          {loc.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                        </div>
                      </td>
                      <td className="action-cell">
                        <button className="btn btn-sm btn-edit" onClick={() => handleEdit(loc)}><Pencil size={14} /></button>
                        <button className="btn btn-sm btn-delete" onClick={() => handleDelete(loc.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── TAB: HOTEL BRANCHES ─────────────────────────────── */}
      {activeTab === 'branches' && (
        <>
          {showBranchForm && (
            <div className="form-card" style={{ borderRadius: '0 8px 8px 8px', marginTop: 0 }}>
              <h3>{editingBranchId ? <><Pencil size={20} /> Sửa Chi Nhánh</> : <><Plus size={20} /> Thêm Chi Nhánh Mới</>}</h3>
              <form onSubmit={handleBranchSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tên chi nhánh *</label>
                    <input type="text" name="name" value={branchForm.name} onChange={handleBranchChange} required
                      placeholder="VD: Khách sạn ABC - Cơ sở 1" />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" name="phone" value={branchForm.phone} onChange={handleBranchChange} />
                  </div>
                  <div className="form-group">
                    <label>Vĩ độ (Latitude) *</label>
                    <input type="number" step="0.00000001" name="latitude" value={branchForm.latitude} onChange={handleBranchChange}
                      placeholder="VD: 10.7769" required />
                  </div>
                  <div className="form-group">
                    <label>Kinh độ (Longitude) *</label>
                    <input type="number" step="0.00000001" name="longitude" value={branchForm.longitude} onChange={handleBranchChange}
                      placeholder="VD: 106.7009" required />
                  </div>
                  <div className="form-group full-width">
                    <label>Địa chỉ</label>
                    <input type="text" name="address" value={branchForm.address} onChange={handleBranchChange} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" name="isMain" checked={branchForm.isMain} onChange={handleBranchChange} />
                      Chi nhánh chính
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" name="isActive" checked={branchForm.isActive} onChange={handleBranchChange} />
                      Đang hoạt động
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingBranchId ? 'Cập Nhật' : 'Thêm Chi Nhánh'}</button>
                  <button type="button" className="btn btn-secondary" onClick={resetBranchForm}>Hủy</button>
                </div>
              </form>
            </div>
          )}

          <div className="table-card" style={{ borderRadius: showBranchForm ? 8 : '0 8px 8px 8px', marginTop: showBranchForm ? 12 : 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Chi Nhánh</th>
                  <th>Địa chỉ & SĐT</th>
                  <th>Tọa độ</th>
                  <th>Loại</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr><td colSpan="6" className="empty-row">Chưa có chi nhánh nào. Thêm chi nhánh để tính khoảng cách địa điểm.</td></tr>
                ) : branches.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td className="name-cell">
                      <strong>{b.name}</strong>
                      {b.isMain && <span style={{ marginLeft: 6, padding: '2px 6px', background: '#fef3c7', color: '#92400e',
                        borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>Chính</span>}
                    </td>
                    <td>
                      {b.address && <div>{b.address}</div>}
                      {b.phone && <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{b.phone}</div>}
                    </td>
                    <td>
                      {b.latitude
                        ? <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{b.latitude}, {b.longitude}</span>
                        : <span style={{ color: '#94a3b8' }}>Chưa có tọa độ</span>}
                    </td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.8rem',
                        background: b.isActive ? '#dcfce7' : '#f1f5f9',
                        color: b.isActive ? '#15803d' : '#64748b' }}>
                        {b.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleBranchEdit(b)}><Pencil size={14} /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleBranchDelete(b.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {branches.length > 0 && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)',
                fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Navigation size={13} />
                Sau khi thêm tọa độ chi nhánh, bấm <strong style={{ margin: '0 4px' }}>"Tính lại khoảng cách"</strong>
                ở tab Địa Điểm để cập nhật khoảng cách thực tế cho tất cả địa điểm.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Map Modal ─────────────────────────────────────────── */}
      {mapModal && (
        <div className="modal-overlay" onClick={() => setMapModal(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}
            style={{ background: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3>Bản đồ: {mapModal.name}</h3>
              <button onClick={() => setMapModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ width: '100%', height: 450, borderRadius: 8, overflow: 'hidden' }}
              dangerouslySetInnerHTML={{
                __html: mapModal.mapEmbedLink.includes('<iframe')
                  ? mapModal.mapEmbedLink
                  : `<iframe width="100%" height="100%" style="border:0" loading="lazy" allowfullscreen src="${mapModal.mapEmbedLink}"></iframe>`
              }} />
          </div>
        </div>
      )}
    </div>
  );
}
