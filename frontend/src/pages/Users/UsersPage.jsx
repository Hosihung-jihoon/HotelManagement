import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import CustomSelect from '../../components/Common/CustomSelect';
import { useAuth } from '../../context/AuthContext';
import './UsersPage.css';

const AVATAR_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#ec4899', '#14b8a6'];

const ROLE_COLOR_MAP = {
  admin: 'role-admin',
  manager: 'role-manager',
  receptionist: 'role-receptionist',
  housekeeping: 'role-housekeeping',
  accountant: 'role-manager',
};

function normalizeRoleName(roleName) {
  return (roleName || '').trim().toLowerCase();
}

function getRoleColorClass(roleName) {
  return ROLE_COLOR_MAP[normalizeRoleName(roleName)] || '';
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = normalizeRoleName(currentUser?.roleName) === 'admin';

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/user-management'),
        axiosClient.get('/Roles'),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
    } catch (err) {
      console.error('Loi tai danh sach nhan su:', err);
      if (err.response?.status === 403) {
        alert('Ban khong co quyen xem danh sach nhan su.');
      }
    } finally {
      setLoading(false);
    }
  };

  const uniqueRoles = useMemo(
    () => [...new Set(users.map((user) => user.roleName).filter(Boolean))],
    [users]
  );

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    const matchSearch = !query
      || user.fullName.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
      || (user.phone || '').includes(query);
    const matchRole = !filterRole || user.roleName === filterRole;
    const matchStatus = !filterStatus || (filterStatus === 'active' ? user.status : !user.status);
    return matchSearch && matchRole && matchStatus;
  });

  const getSelectedRoleId = (user) => {
    if (user.roleId != null) return user.roleId;
    return roles.find((role) => normalizeRoleName(role.name) === normalizeRoleName(user.roleName))?.id ?? '';
  };

  const handleChangeRole = async (userId, newRoleId) => {
    setSavingId(userId);
    try {
      await axiosClient.put('/user-management/change-role', { userId, newRoleId: Number(newRoleId) });
      setUsers((prev) => prev.map((user) => {
        if (user.id !== userId) return user;
        const role = roles.find((item) => item.id === Number(newRoleId));
        return {
          ...user,
          roleId: role?.id ?? user.roleId,
          roleName: role?.name ?? user.roleName,
        };
      }));
    } catch (err) {
      alert(`Loi doi vai tro: ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="users-page">
      <div className="inv-header">
        <div>
          <h1 className="page-title">Danh sach nhan su</h1>
          <p className="page-subtitle">
            {users.length} tai khoan · {users.filter((user) => user.status).length} dang hoat dong
          </p>
        </div>
        <button
          className="btn-add"
          onClick={fetchUsers}
          disabled={loading}
          style={{ background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
        >
          <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Lam moi
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: 2 }}>
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Tim theo ten, email, so dien thoai..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div style={{ width: 180 }}>
          <CustomSelect
            value={filterRole}
            onChange={(value) => setFilterRole(value)}
            placeholder="Tat ca vai tro"
            options={[
              { value: '', label: 'Tat ca vai tro' },
              ...uniqueRoles.map((role) => ({ value: role, label: role })),
            ]}
          />
        </div>
        <div style={{ width: 180 }}>
          <CustomSelect
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            placeholder="Tat ca trang thai"
            options={[
              { value: '', label: 'Tat ca trang thai' },
              { value: 'active', label: 'Dang hoat dong' },
              { value: 'inactive', label: 'Bi khoa' },
            ]}
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Dang tai du lieu nhan su...</p>
          </div>
        ) : (
          <table className="rooms-table users-table">
            <thead>
              <tr>
                <th>Ho va ten</th>
                <th>Email</th>
                <th>So dien thoai</th>
                <th>Vai tro</th>
                <th style={{ textAlign: 'center' }}>Trang thai</th>
                {isAdmin && <th style={{ textAlign: 'center' }}>Doi vai tro</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="empty-row">
                    {users.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <Users size={32} style={{ opacity: 0.3 }} />
                        <span>Khong co du lieu nhan su.</span>
                      </div>
                    ) : 'Khong tim thay nhan vien phu hop'}
                  </td>
                </tr>
              ) : filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar" style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
                        {getInitials(user.fullName)}
                      </div>
                      <span className="user-fullname">{user.fullName}</span>
                    </div>
                  </td>
                  <td><span className="user-email">{user.email}</span></td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`role-badge ${getRoleColorClass(user.roleName)}`}>
                      {user.roleName || 'Chua phan'}
                    </span>
                  </td>
                  <td>
                    <div className="switch-wrapper" style={{ justifyContent: 'center' }}>
                      <span className={`switch-label ${user.status ? 'label-active' : 'label-locked'}`}>
                        {user.status ? 'Hoat dong' : 'Da khoa'}
                      </span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'center' }}>
                      <div className="user-role-select-wrap">
                        <CustomSelect
                          className="user-role-select"
                          value={getSelectedRoleId(user)}
                          onChange={(value) => handleChangeRole(user.id, value)}
                          disabled={savingId === user.id}
                          placeholder="Chon vai tro"
                          options={roles.map((role) => ({ value: role.id, label: role.name }))}
                        />
                      </div>
                      {savingId === user.id && <div className="user-role-saving">Dang luu...</div>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && <div className="table-footer">Hien thi {filteredUsers.length} / {users.length} tai khoan</div>}
      </div>
    </div>
  );
}
