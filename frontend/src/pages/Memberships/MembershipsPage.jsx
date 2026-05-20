import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import './MembershipsPage.css';

const initialFormData = {
  tierName: '',
  minPoints: 0,
  discountPercent: 0,
  displayOrder: 1,
  pointMultiplier: 1,
  benefits: '',
  redeemOptions: '',
  amenities: '',
  services: ''
};

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function canonicalTierRank(tierName) {
  const value = String(tierName || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd');
  if (value === 'dong') return 1;
  if (value === 'bac') return 2;
  if (value === 'vang') return 3;
  if (value === 'kim cuong') return 4;
  return 99;
}

export default function MembershipsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/Memberships');
      const items = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
      setData(
        items
          .filter((item) => canonicalTierRank(item.tierName) < 99)
          .sort((a, b) => canonicalTierRank(a.tierName) - canonicalTierRank(b.tierName))
      );
      setError(null);
    } catch (err) {
      setError('Khong the tai cau hinh hang thanh vien.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      tierName: item.tierName || '',
      minPoints: item.minPoints || 0,
      discountPercent: item.discountPercent || 0,
      displayOrder: item.displayOrder || 1,
      pointMultiplier: item.pointMultiplier || 1,
      benefits: Array.isArray(item.benefits) ? item.benefits.join('\n') : (item.benefits || ''),
      redeemOptions: Array.isArray(item.redeemOptions) ? item.redeemOptions.join('\n') : (item.redeemOptions || ''),
      amenities: item.amenities || '',
      services: item.services || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        minPoints: Number(formData.minPoints) || 0,
        discountPercent: Number(formData.discountPercent) || 0,
        displayOrder: Number(formData.displayOrder) || 0,
        pointMultiplier: Number(formData.pointMultiplier) || 1
      };
      if (!editingItem) {
        alert('Man nay chi dung de cau hinh 4 hang thanh vien chuan.');
        return;
      }

      await axiosClient.put(`/Memberships/${editingItem.id}`, payload);
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      alert(`Loi khi luu hang thanh vien: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div className="loading">Dang tai...</div>;

  return (
    <div className="memberships-page">
      <div className="page-header">
        <div>
          <h1>Quan Ly Hang Thanh Vien</h1>
          <p style={{ marginTop: 6, color: '#64748b' }}>Chi cau hinh 4 hang chuan: Dong, Bac, Vang, Kim cuong. Quy tac mac dinh: 1 diem = 10.000d chi tieu hop le.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData}>Lam moi danh sach</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-card">
        {data.length === 0 ? (
          <div className="empty-state">Chua co du lieu hang thanh vien.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Thu tu</th>
                <th>Hang</th>
                <th>Moc diem</th>
                <th>He so</th>
                <th>Giam gia</th>
                <th>Quyen loi</th>
                <th>Quy doi</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.displayOrder}</td>
                  <td><strong>{item.tierName}</strong></td>
                  <td>{Number(item.minPoints || 0).toLocaleString('vi-VN')} diem</td>
                  <td>x{Number(item.pointMultiplier || 1).toFixed(2)}</td>
                  <td>{item.discountPercent}%</td>
                  <td style={{ maxWidth: 260 }}>
                    {splitLines(item.benefits).slice(0, 3).map((benefit) => <div key={benefit}>- {benefit}</div>)}
                  </td>
                  <td style={{ maxWidth: 260 }}>
                    {splitLines(item.redeemOptions).slice(0, 2).map((option) => <div key={option}>- {option}</div>)}
                  </td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleEdit(item)} style={{ padding: '4px 12px', fontSize: '12px', background: '#eab308', border: 'none' }}>
                      Sua
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 680 }}>
            <h2>Sua hang thanh vien</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 15 }}>
              <div className="form-group">
                <label>Ten hang</label>
                <input className="form-control" value={formData.tierName} onChange={(e) => setFormData({ ...formData, tierName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Thu tu hien thi</label>
                <input className="form-control" type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Moc diem toi thieu</label>
                <input className="form-control" type="number" value={formData.minPoints} onChange={(e) => setFormData({ ...formData, minPoints: Number(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Giam gia (%)</label>
                <input className="form-control" type="number" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>He so tich diem</label>
                <input className="form-control" type="number" step="0.1" value={formData.pointMultiplier} onChange={(e) => setFormData({ ...formData, pointMultiplier: Number(e.target.value) || 1 })} />
              </div>
              <div className="form-group">
                <label>Thong tin hien thi cu</label>
                <input className="form-control" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="Co the de trong" />
              </div>
            </div>

            <div className="form-group">
              <label>Quyen loi (moi dong 1 muc)</label>
              <textarea className="form-control" rows="4" value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Quy doi diem (moi dong 1 muc)</label>
              <textarea className="form-control" rows="4" value={formData.redeemOptions} onChange={(e) => setFormData({ ...formData, redeemOptions: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Thong tin hien thi cu - Services</label>
              <textarea className="form-control" rows="2" value={formData.services} onChange={(e) => setFormData({ ...formData, services: e.target.value })} />
            </div>

            <div className="modal-actions" style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Huy</button>
              <button className="btn btn-primary" onClick={handleSave}>Luu lai</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
