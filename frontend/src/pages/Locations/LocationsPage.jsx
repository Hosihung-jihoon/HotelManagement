import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Building2, Globe, MapPin, Navigation, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import '../RoomTypes/RoomTypesPage.css';

const initialLocationForm = {
  name: '',
  description: '',
  googleMapsUrl: '',
  address: '',
  isActive: true
};

const initialBranchForm = {
  name: '',
  phone: '',
  googleMapsUrl: '',
  address: '',
  isMain: false,
  isActive: true
};

function canEmbedMap(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function canResolveCoordinates(item) {
  if (!item) return false;
  if (item.latitude != null && item.longitude != null) return true;

  let value = `${item.googleMapsUrl || ''} ${item.mapEmbedLink || ''}`;
  try {
    value = decodeURIComponent(value);
  } catch (error) {
    value = `${item.googleMapsUrl || ''} ${item.mapEmbedLink || ''}`;
  }
  const patterns = [
    /@(?<lat>-?\d+(?:\.\d+)?),(?<lng>-?\d+(?:\.\d+)?)/i,
    /[?&](?:q|query|center|destination)=(?<lat>-?\d+(?:\.\d+)?),(?<lng>-?\d+(?:\.\d+)?)/i,
    /!3d(?<lat>-?\d+(?:\.\d+)?)!4d(?<lng>-?\d+(?:\.\d+)?)/i
  ];
  return patterns.some((pattern) => pattern.test(value));
}

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [branchError, setBranchError] = useState(null);
  const [activeTab, setActiveTab] = useState('locations');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialLocationForm);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [mapModal, setMapModal] = useState(null);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcResult, setRecalcResult] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const canRecalcDistances = useMemo(
    () => branches.some((branch) => branch.isActive !== false && canResolveCoordinates(branch))
      && locations.some((location) => canResolveCoordinates(location)),
    [branches, locations]
  );

  const fetchLocations = async () => {
    try {
      const response = await axiosClient.get('/Attractions');
      setLocations(response.data || []);
      setLocationError(null);
    } catch (err) {
      setLocations([]);
      setLocationError('Khong the tai danh sach dia diem tham quan.');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosClient.get('/HotelBranches');
      setBranches(response.data || []);
      setBranchError(null);
    } catch (err) {
      setBranches([]);
      setBranchError('Khong the tai danh sach chi nhanh khach san.');
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.allSettled([fetchLocations(), fetchBranches()]);
    setLoading(false);
  };

  const resetLocationForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData(initialLocationForm);
  };

  const resetBranchForm = () => {
    setEditingBranchId(null);
    setShowBranchForm(false);
    setBranchForm(initialBranchForm);
  };

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...formData,
        mapEmbedLink: formData.googleMapsUrl,
        distanceKm: null
      };
      if (editingId) {
        await axiosClient.put(`/Attractions/${editingId}`, payload);
      } else {
        await axiosClient.post('/Attractions', payload);
      }
      resetLocationForm();
      await fetchLocations();
    } catch (err) {
      alert(`Loi luu dia diem: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleBranchSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...branchForm,
        mapEmbedLink: branchForm.googleMapsUrl
      };
      if (editingBranchId) {
        await axiosClient.put(`/HotelBranches/${editingBranchId}`, payload);
      } else {
        await axiosClient.post('/HotelBranches', payload);
      }
      resetBranchForm();
      await Promise.allSettled([fetchBranches(), fetchLocations()]);
    } catch (err) {
      alert(`Loi luu chi nhanh: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditLocation = (location) => {
    setEditingId(location.id);
    setFormData({
      name: location.name || '',
      description: location.description || '',
      googleMapsUrl: location.googleMapsUrl || location.mapEmbedLink || '',
      address: location.address || '',
      isActive: location.isActive ?? true
    });
    setShowForm(true);
  };

  const handleEditBranch = (branch) => {
    setEditingBranchId(branch.id);
    setBranchForm({
      name: branch.name || '',
      phone: branch.phone || '',
      googleMapsUrl: branch.googleMapsUrl || branch.mapEmbedLink || '',
      address: branch.address || '',
      isMain: branch.isMain ?? false,
      isActive: branch.isActive ?? true
    });
    setShowBranchForm(true);
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Ban co chac muon xoa dia diem nay?')) return;
    await axiosClient.delete(`/Attractions/${id}`);
    await fetchLocations();
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Ban co chac muon xoa chi nhanh nay?')) return;
    await axiosClient.delete(`/HotelBranches/${id}`);
    await Promise.allSettled([fetchBranches(), fetchLocations()]);
  };

  const toggleLocationStatus = async (location) => {
    await axiosClient.put(`/Attractions/${location.id}`, {
      name: location.name,
      description: location.description,
      mapEmbedLink: location.mapEmbedLink,
      googleMapsUrl: location.googleMapsUrl,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      distanceKm: location.distanceKm,
      isActive: !(location.isActive ?? true)
    });
    await fetchLocations();
  };

  const handleRecalcDistances = async () => {
    try {
      setRecalcLoading(true);
      setRecalcResult(null);
      const response = await axiosClient.post('/HotelBranches/recalc-distances');
      const rows = Array.isArray(response.data) ? response.data : [];
      const updated = rows.filter((item) => item.updated);
      const skipped = rows.filter((item) => !item.updated);
      setRecalcResult({
        ok: true,
        updatedCount: updated.length,
        skippedCount: skipped.length,
        skippedItems: skipped.slice(0, 5).map((item) => `${item.attractionName}: ${item.skipReason || 'Khong xac dinh duoc toa do.'}`)
      });
      await fetchLocations();
    } catch (err) {
      setRecalcResult({
        ok: false,
        message: `Loi tinh lai khoang cach: ${err.response?.data?.message || err.message}`
      });
    } finally {
      setRecalcLoading(false);
    }
  };

  if (loading) return <div className="loading">Dang tai...</div>;

  return (
    <div className="room-types-page">
      <div className="page-header">
        <h1><MapPin size={28} className="header-icon" /> Quan Ly Dia Diem</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'locations' ? (
            <>
              <button className="btn btn-secondary" disabled={!canRecalcDistances || recalcLoading} onClick={handleRecalcDistances}>
                {recalcLoading ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Dang tinh...</> : <><Navigation size={15} /> Tinh lai khoang cach</>}
              </button>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> Them dia diem</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowBranchForm(true)}><Plus size={18} /> Them chi nhanh</button>
          )}
        </div>
      </div>

      {recalcResult && (
        <div className="error-banner" style={{ background: recalcResult.ok ? '#dcfce7' : undefined, color: recalcResult.ok ? '#166534' : undefined }}>
          {recalcResult.ok ? (
            <div>
              <div>Da cap nhat khoang cach cho {recalcResult.updatedCount} dia diem.</div>
              <div>Bo qua {recalcResult.skippedCount} dia diem chua resolve duoc toa do cache.</div>
              {recalcResult.skippedItems?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {recalcResult.skippedItems.map((item) => <div key={item}>- {item}</div>)}
                </div>
              )}
            </div>
          ) : recalcResult.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: '-1px' }}>
        <button className="btn btn-secondary" style={{ borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('locations')}>Dia diem tham quan</button>
        <button className="btn btn-secondary" style={{ borderRadius: '8px 8px 0 0' }} onClick={() => setActiveTab('branches')}>Chi nhanh khach san ({branches.length})</button>
      </div>

      {activeTab === 'locations' && (
        <>
          {locationError && <div className="error-banner">{locationError}</div>}
          {!canRecalcDistances && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '0.875rem' }}>
              Can it nhat 1 chi nhanh va 1 dia diem resolve duoc toa do tu link Google Maps. Neu chua co API key, he thong chi recalc duoc voi URL co chua toa do.
            </div>
          )}

          {showForm && (
            <div className="form-card" style={{ borderRadius: '0 8px 8px 8px', marginTop: 0 }}>
              <h3>{editingId ? <><Pencil size={20} /> Sua dia diem</> : <><Plus size={20} /> Them dia diem moi</>}</h3>
              <form onSubmit={handleLocationSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ten dia diem</label>
                    <input value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Google Maps URL / Embed</label>
                    <input value={formData.googleMapsUrl} onChange={(event) => setFormData((prev) => ({ ...prev, googleMapsUrl: event.target.value }))} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Dia chi</label>
                    <input value={formData.address} onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))} placeholder="Neu co Google Maps API key, dia chi se duoc auto-fill khi luu." />
                  </div>
                  <div className="form-group full-width">
                    <label>Mo ta</label>
                    <textarea rows="3" value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData((prev) => ({ ...prev, isActive: event.target.checked }))} />
                    <label style={{ margin: 0 }}>Dang hoat dong</label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingId ? 'Cap nhat' : 'Tao moi'}</button>
                  <button type="button" className="btn btn-secondary" onClick={resetLocationForm}>Huy</button>
                </div>
              </form>
            </div>
          )}

          <div className="table-card" style={{ borderRadius: showForm ? 8 : '0 8px 8px 8px', marginTop: showForm ? 12 : 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dia diem</th>
                  <th>Dia chi</th>
                  <th>Khoang cach</th>
                  <th>Google Maps</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {locations.length === 0 ? (
                  <tr><td colSpan="6" className="empty-row">Chua co dia diem nao.</td></tr>
                ) : locations.map((location) => (
                  <tr key={location.id}>
                    <td>{location.id}</td>
                    <td>
                      <strong>{location.name}</strong>
                      {location.description && <div style={{ color: '#64748b', marginTop: 4 }}>{location.description}</div>}
                    </td>
                    <td>
                      <div>{location.address || 'Cho resolve tu Google Maps'}</div>
                      {(location.latitude != null && location.longitude != null) && (
                        <small style={{ color: '#64748b' }}>{location.latitude}, {location.longitude}</small>
                      )}
                    </td>
                    <td>{location.distanceKm != null ? `${location.distanceKm} km` : '-'}</td>
                    <td>
                      {location.mapPreviewImageUrl && (
                        <img src={location.mapPreviewImageUrl} alt={location.name} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 8 }} />
                      )}
                      {canEmbedMap(location.mapEmbedLink || location.googleMapsUrl) && (
                        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setMapModal(location)}>
                          <Globe size={14} /> Xem ban do
                        </button>
                      )}
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEditLocation(location)}><Pencil size={14} /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDeleteLocation(location.id)}><Trash2 size={14} /></button>
                      <button className="btn btn-sm btn-secondary" onClick={() => toggleLocationStatus(location)}>
                        {location.isActive ? 'An' : 'Hien'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'branches' && (
        <>
          {branchError && <div className="error-banner">{branchError}</div>}
          {showBranchForm && (
            <div className="form-card" style={{ borderRadius: '0 8px 8px 8px', marginTop: 0 }}>
              <h3>{editingBranchId ? <><Pencil size={20} /> Sua chi nhanh</> : <><Plus size={20} /> Them chi nhanh moi</>}</h3>
              <form onSubmit={handleBranchSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ten chi nhanh</label>
                    <input value={branchForm.name} onChange={(event) => setBranchForm((prev) => ({ ...prev, name: event.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>So dien thoai</label>
                    <input value={branchForm.phone} onChange={(event) => setBranchForm((prev) => ({ ...prev, phone: event.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <label>Google Maps URL / Embed</label>
                    <input value={branchForm.googleMapsUrl} onChange={(event) => setBranchForm((prev) => ({ ...prev, googleMapsUrl: event.target.value }))} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Dia chi</label>
                    <input value={branchForm.address} onChange={(event) => setBranchForm((prev) => ({ ...prev, address: event.target.value }))} placeholder="Neu co Google Maps API key, dia chi se duoc auto-fill khi luu." />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="checkbox" checked={branchForm.isMain} onChange={(event) => setBranchForm((prev) => ({ ...prev, isMain: event.target.checked }))} />
                      Chi nhanh chinh
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="checkbox" checked={branchForm.isActive} onChange={(event) => setBranchForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
                      Dang hoat dong
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingBranchId ? 'Cap nhat' : 'Them chi nhanh'}</button>
                  <button type="button" className="btn btn-secondary" onClick={resetBranchForm}>Huy</button>
                </div>
              </form>
            </div>
          )}

          <div className="table-card" style={{ borderRadius: showBranchForm ? 8 : '0 8px 8px 8px', marginTop: showBranchForm ? 12 : 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Chi nhanh</th>
                  <th>Dia chi</th>
                  <th>Toa do cache</th>
                  <th>Google Maps</th>
                  <th>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {branches.length === 0 ? (
                  <tr><td colSpan="6" className="empty-row">Chua co chi nhanh nao.</td></tr>
                ) : branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.id}</td>
                    <td>
                      <strong>{branch.name}</strong>
                      {branch.isMain && <div style={{ color: '#b45309', fontSize: '0.85rem', marginTop: 4 }}>Chi nhanh chinh</div>}
                      {branch.phone && <div style={{ color: '#64748b' }}>{branch.phone}</div>}
                    </td>
                    <td>{branch.address || 'Cho resolve tu Google Maps'}</td>
                    <td>{branch.latitude != null ? `${branch.latitude}, ${branch.longitude}` : 'Chua co'}</td>
                    <td>
                      {branch.mapPreviewImageUrl && (
                        <img src={branch.mapPreviewImageUrl} alt={branch.name} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 8 }} />
                      )}
                      {canEmbedMap(branch.mapEmbedLink || branch.googleMapsUrl) && (
                        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setMapModal(branch)}>
                          <Globe size={14} /> Xem ban do
                        </button>
                      )}
                    </td>
                    <td className="action-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEditBranch(branch)}><Pencil size={14} /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDeleteBranch(branch.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {mapModal && (
        <div className="modal-overlay" onClick={() => setMapModal(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ background: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3>Ban do: {mapModal.name}</h3>
              <button onClick={() => setMapModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>x</button>
            </div>
            <div style={{ width: '100%', height: 450, borderRadius: 8, overflow: 'hidden' }}>
              {canEmbedMap(mapModal.mapEmbedLink) ? (
                <div
                  style={{ width: '100%', height: '100%' }}
                  dangerouslySetInnerHTML={{
                    __html: mapModal.mapEmbedLink.includes('<iframe')
                      ? mapModal.mapEmbedLink
                      : `<iframe width="100%" height="100%" style="border:0" loading="lazy" allowfullscreen src="${mapModal.mapEmbedLink}"></iframe>`
                  }}
                />
              ) : (
                <iframe title={mapModal.name} width="100%" height="100%" style={{ border: 0 }} src={mapModal.googleMapsUrl} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
