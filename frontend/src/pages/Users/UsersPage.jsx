import { useState, useEffect } from 'react';
import { Search, X, RefreshCw, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import './UsersPage.css';

const AVATAR_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#ec4899', '#14b8a6'];

const ROLE_COLOR_MAP = {
  'admin': 'role-admin',
  'manager': 'role-manager',
  'receptionist': 'role-receptionist',
  'lễ tân': 'role-receptionist',
  'housekeeping': 'role-housekeeping',
  'dọn phòng': 'role-housekeeping',
  'accountant': 'role-manager',
  'kế toán': 'role-manager',
};

function getRoleColorClass(roleName) {
  if (!roleName) return '';
  return ROLE_COLOR_MAP[roleName.toLowerCase()] || '';
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function UsersPage() {
  const { user: currentUser }     = useAuth();
  const isAdmin = currentUser?.roleName?.toLowerCase() === 'admin';

  const [users, setUsers]         = useState([]);
  const [roles, setRoles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [savingId, setSavingId]   = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/user-management'),
        axiosClient.get('/Roles'),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error('Lỗi tải danh sách nhân sự:', err);
      if (err.response?.status === 403) {
        alert('Bạn không có quyền xem danh sách nhân sự (cần quyền manage_users).');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChangeRole = async (userId, newRoleId) => {
    setSavingId(userId);
    try {
      await axiosClient.put('/user-management/change-role', { userId, newRoleId: Number(newRoleId) });
      // Cập nhật local state
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u;
        const role = roles.find(r => r.id === Number(newRoleId));
        return { ...u, roleName: role?.name ?? u.roleName };
      }));
    } catch (err) {
      alert('Lỗi đổi vai trò: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingId(null);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || '').includes(q);
    const matchRole   = !filterRole   || u.roleName === filterRole;
    const matchStatus = !filterStatus || (filterStatus === 'active' ? u.status : !u.status);
    return matchSearch && matchRole && matchStatus;
  });

  const uniqueRoles = [...new Set(users.map(u => u.roleName).filter(Boolean))];

  return (
    <div className="users-page">
      <div className="inv-header">
        <div>
          <h1 className="page-title">Danh sách nhân sự</h1>
          <p className="page-subtitle">
            {users.length} tài khoản · {users.filter(u => u.status).length} đang hoạt động
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-add"
            onClick={fetchUsers}
            disabled={loading}
            style={{ background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 2 }}>
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Bị khóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Đang tải dữ liệu nhân sự...</p>
          </div>
        ) : (
          <table className="rooms-table users-table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                {isAdmin && <th style={{ textAlign: 'center' }}>Đổi vai trò</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="empty-row">
                  {users.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Users size={32} style={{ opacity: 0.3 }} />
                      <span>Không có dữ liệu nhân sự (kiểm tra quyền manage_users)</span>
                    </div>
                  ) : 'Không tìm thấy nhân viên phù hợp'}
                </td></tr>
              ) : filtered.map((user, idx) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar" style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                        {getInitials(user.fullName)}
                      </div>
                      <span className="user-fullname">{user.fullName}</span>
                    </div>
                  </td>
                  <td><span className="user-email">{user.email}</span></td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    <span className={`role-badge ${getRoleColorClass(user.roleName)}`}>
                      {user.roleName || 'Chưa phân'}
                    </span>
                  </td>
                  <td>
                    <div className="switch-wrapper" style={{ justifyContent: 'center' }}>
                      <span className={`switch-label ${user.status ? 'label-active' : 'label-locked'}`}>
                        {user.status ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'center' }}>
                      <select
                        className="filter-select"
                        style={{ fontSize: '0.8rem', padding: '5px 8px', minWidth: 120 }}
                        value={roles.find(r => r.name === user.roleName)?.id ?? ''}
                        onChange={e => handleChangeRole(user.id, e.target.value)}
                        disabled={savingId === user.id}
                      >
                        <option value="">-- Chọn --</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      {savingId === user.id && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 4 }}>Đang lưu...</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="table-footer">
            Hiển thị {filtered.length} / {users.length} tài khoản
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
