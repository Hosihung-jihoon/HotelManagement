import { useEffect, useMemo, useState } from 'react';
import { Award, Gift, Star, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import '../RoomTypes/RoomTypesPage.css';

const GUEST_ROLE_NAMES = new Set(['guest', 'customer']);
const POINT_TO_VND_RATE = 10000;

function normalizeRoleName(roleName) {
  return (roleName || '').trim().toLowerCase();
}

function isGuestRole(roleName) {
  const normalized = normalizeRoleName(roleName);
  return !normalized || GUEST_ROLE_NAMES.has(normalized);
}

function splitLines(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatPoints(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} diem`;
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}%`;
}

function getTierColor(tierName) {
  const value = (tierName || '').toLowerCase();
  if (value.includes('dong')) return 'linear-gradient(135deg, #f0d0b8 0%, #a0674a 100%)';
  if (value.includes('bac')) return 'linear-gradient(135deg, #e8edf2 0%, #8a9db5 100%)';
  if (value.includes('vang')) return 'linear-gradient(135deg, #f6e27a 0%, #c9a84c 100%)';
  if (value.includes('kim')) return 'linear-gradient(135deg, #dbeafe 0%, #1d4ed8 100%)';
  return 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)';
}

function canonicalTierRank(tierName) {
  const value = normalizeRoleName(tierName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd');
  if (value === 'dong') return 1;
  if (value === 'bac') return 2;
  if (value === 'vang') return 3;
  if (value === 'kim cuong') return 4;
  return 99;
}

export default function MembersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('guests');
  const [editingTier, setEditingTier] = useState(null);
  const [tierForm, setTierForm] = useState({ discountPercent: 0, pointMultiplier: 1, benefits: '', redeemOptions: '' });
  const [savingTier, setSavingTier] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, tiersRes] = await Promise.all([
        axiosClient.get('/user-management/membership-stats'),
        axiosClient.get('/user-management'),
        axiosClient.get('/Memberships')
      ]);
      const tierList = Array.isArray(tiersRes.data) ? tiersRes.data : [];
      setTiers(
        tierList
          .filter((tier) => canonicalTierRank(tier.tierName) < 99)
          .sort((a, b) => canonicalTierRank(a.tierName) - canonicalTierRank(b.tierName))
      );
      setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setError(null);
    } catch (err) {
      setError('Khong the tai du lieu thanh vien.');
    } finally {
      setLoading(false);
    }
  };

  const displayedUsers = useMemo(
    () => (activeTab === 'guests'
      ? users.filter((user) => isGuestRole(user.roleName))
      : users.filter((user) => !isGuestRole(user.roleName))),
    [activeTab, users]
  );

  const statsMap = useMemo(() => {
    const map = new Map();
    stats.forEach((item) => map.set(item.membershipId, item.memberCount));
    return map;
  }, [stats]);

  const openEditTier = (tier) => {
    setEditingTier(tier);
    setTierForm({
      discountPercent: Number(tier.discountPercent || 0),
      pointMultiplier: Number(tier.pointMultiplier || 1),
      benefits: Array.isArray(tier.benefits) ? tier.benefits.join('\n') : (tier.benefits || ''),
      redeemOptions: Array.isArray(tier.redeemOptions) ? tier.redeemOptions.join('\n') : (tier.redeemOptions || '')
    });
  };

  const saveTier = async () => {
    if (!editingTier) return;
    try {
      setSavingTier(true);
      await axiosClient.put(`/Memberships/${editingTier.id}`, {
        tierName: editingTier.tierName,
        minPoints: editingTier.minPoints,
        discountPercent: Number(tierForm.discountPercent) || 0,
        displayOrder: editingTier.displayOrder,
        pointMultiplier: Number(tierForm.pointMultiplier) || 1,
        benefits: tierForm.benefits,
        redeemOptions: tierForm.redeemOptions,
        amenities: editingTier.amenities || '',
        services: editingTier.services || ''
      });
      setEditingTier(null);
      await fetchData();
    } catch (err) {
      alert(`Khong the luu hang thanh vien: ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingTier(false);
    }
  };

  if (loading) return <div className="loading">Dang tai du lieu...</div>;

  return (
    <div className="room-types-page" style={{ padding: 20 }}>
      <div className="page-header">
        <div>
          <h1><Users size={28} className="header-icon" /> Quan Ly Thanh Vien</h1>
          <p style={{ marginTop: 6, color: '#64748b' }}>Quy dinh hien tai: 1 diem = {POINT_TO_VND_RATE.toLocaleString('vi-VN')}d chi tieu hop le.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
        {tiers.map((tier) => (
          <div
            key={tier.id}
            style={{
              background: getTierColor(tier.tierName),
              color: '#0f172a',
              padding: 24,
              borderRadius: 12,
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>{tier.tierName}</h3>
                <div style={{ marginTop: 8, fontSize: '0.92rem' }}>{formatPoints(tier.minPoints)}</div>
                <div style={{ marginTop: 4, fontSize: '0.92rem' }}>x{Number(tier.pointMultiplier || 1).toFixed(2)} diem</div>
              </div>
              <Award size={30} />
            </div>
            <div style={{ marginTop: 16, fontSize: '1.8rem', fontWeight: 700 }}>{statsMap.get(tier.id) || 0}</div>
            <div style={{ opacity: 0.8 }}>thanh vien</div>

            <div style={{ display: 'grid', gap: 10, fontSize: '0.9rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.52)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Thong so hang</div>
                <div>- Moc diem: {formatPoints(tier.minPoints)}</div>
                <div>- Giam gia dat phong: {formatPercent(tier.discountPercent)}</div>
                <div>- He so tich diem: x{Number(tier.pointMultiplier || 1).toFixed(2)}</div>
                <div>- Quy doi diem: 1 diem = {POINT_TO_VND_RATE.toLocaleString('vi-VN')}d chi tieu hop le</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.52)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}><Star size={14} style={{ display: 'inline', marginRight: 6 }} />Quyen loi</div>
                {splitLines(tier.benefits).length === 0 ? (
                  <div style={{ color: '#475569' }}>Chua cau hinh quyen loi.</div>
                ) : (
                  splitLines(tier.benefits).map((benefit) => <div key={benefit}>- {benefit}</div>)
                )}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.52)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}><Gift size={14} style={{ display: 'inline', marginRight: 6 }} />Quy doi mac dinh</div>
                {splitLines(tier.redeemOptions).length === 0 ? (
                  <div style={{ color: '#475569' }}>Chua cau hinh muc quy doi.</div>
                ) : (
                  splitLines(tier.redeemOptions).map((option) => <div key={option}>- {option}</div>)
                )}
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" style={{ marginTop: 'auto', alignSelf: 'flex-start' }} onClick={() => openEditTier(tier)}>
              Chinh sua hang
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 30, marginBottom: '-10px' }}>
        <button
          onClick={() => setActiveTab('guests')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'guests' ? 'var(--primary-color, #2563eb)' : '#f1f5f9',
            color: activeTab === 'guests' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Khach hang
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'staff' ? 'var(--primary-color, #2563eb)' : '#f1f5f9',
            color: activeTab === 'staff' ? '#fff' : '#64748b',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Nhan vien
        </button>
      </div>

      <div className="table-card" style={{ marginTop: 0, borderRadius: '0 8px 8px 8px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ten</th>
              <th>Email</th>
              <th>Vai tro</th>
              <th>Da chi tieu</th>
              <th>Diem</th>
              <th>Thanh vien</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">Khong tim thay du lieu phu hop.</td></tr>
            ) : displayedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><strong>{user.fullName}</strong></td>
                <td>{user.email}</td>
                <td>{user.roleName || 'Guest'}</td>
                <td>{Number(user.totalSpent || 0).toLocaleString('vi-VN')}d</td>
                <td>{Number(user.totalPoints || 0).toLocaleString('vi-VN')} diem</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700 }}>{user.membershipName || 'Chua xep hang'}</span>
                    {user.nextTierName && (
                      <small style={{ color: '#64748b' }}>
                        Con {Number(user.remainingToNextTier || 0).toLocaleString('vi-VN')} diem de len {user.nextTierName}
                      </small>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTier && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 720 }}>
            <h2>Chinh sua hang {editingTier.tierName}</h2>
            <p style={{ color: '#64748b', marginTop: 8 }}>
              Moc diem va thu tu cua 4 hang chuan duoc giu co dinh. Modal nay chi sua uu dai, he so tich diem va cac muc quy doi.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 16 }}>
              <div className="form-group">
                <label>Hang</label>
                <input className="form-control" value={editingTier.tierName} disabled />
              </div>
              <div className="form-group">
                <label>Moc diem</label>
                <input className="form-control" value={Number(editingTier.minPoints || 0).toLocaleString('vi-VN')} disabled />
              </div>
              <div className="form-group">
                <label>He so tich diem</label>
                <input className="form-control" type="number" step="0.1" value={tierForm.pointMultiplier} onChange={(event) => setTierForm((prev) => ({ ...prev, pointMultiplier: event.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label>Giam gia dat phong (%)</label>
              <input className="form-control" type="number" value={tierForm.discountPercent} onChange={(event) => setTierForm((prev) => ({ ...prev, discountPercent: event.target.value }))} />
            </div>

            <div className="form-group">
              <label>Quyen loi (moi dong 1 muc)</label>
              <textarea className="form-control" rows="5" value={tierForm.benefits} onChange={(event) => setTierForm((prev) => ({ ...prev, benefits: event.target.value }))} />
            </div>

            <div className="form-group">
              <label>Quy doi diem (moi dong 1 muc)</label>
              <textarea className="form-control" rows="5" value={tierForm.redeemOptions} onChange={(event) => setTierForm((prev) => ({ ...prev, redeemOptions: event.target.value }))} />
            </div>

            <div className="modal-actions" style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setEditingTier(null)}>Huy</button>
              <button className="btn btn-primary" onClick={saveTier} disabled={savingTier}>{savingTier ? 'Dang luu...' : 'Luu thay doi'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
