import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import './UsersPage.css';

/**
 * UsersPage - Quản lý nhân viên
 * API: /api/user-management + /api/roles
 */
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
  });

  // ========== Fetch ==========
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/user-management');
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách nhân viên. Kiểm tra Backend và quyền truy cập.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await axiosClient.get('/roles');
      setRoles(res.data);
    } catch {
      // Roles failed silently – still show users
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // ========== Filter ==========
  const filtered = users.filter((u) => {
    const matchSearch =
      !searchText ||
      u.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email.toLowerCase().includes(searchText.toLowerCase());
    const matchRole = !filterRole || String(u.roleId) === filterRole;
    const matchStatus =
      filterStatus === '' ||
      (filterStatus === 'active' && u.status === true) ||
      (filterStatus === 'inactive' && u.status === false);
    return matchSearch && matchRole && matchStatus;
  });

  // ========== Form ==========
  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ fullName: '', email: '', phone: '', password: '', roleId: '' });
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      password: '',
      roleId: user.roleId ? String(user.roleId) : '',
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axiosClient.put(`/user-management/${editingUser.id}`, {
          fullName: formData.fullName,
          phone: formData.phone || null,
          roleId: formData.roleId ? parseInt(formData.roleId) : null,
        });
      } else {
        await axiosClient.post('/user-management', {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          roleId: formData.roleId ? parseInt(formData.roleId) : null,
        });
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // ========== Actions ==========
  const handleToggleStatus = async (user) => {
    const newStatus = !user.status;
    const confirm = window.confirm(
      `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản "${user.fullName}"?`
    );
    if (!confirm) return;
    try {
      await axiosClient.put(`/user-management/${user.id}/toggle-status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xóa tài khoản "${user.fullName}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await axiosClient.delete(`/user-management/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // ========== Render ==========
  if (loading) return <div className="loading-state">⏳ Đang tải dữ liệu nhân viên...</div>;

  return (
    <div className="users-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>👥 Quản Lý Nhân Viên</h1>
          <span className="badge-count">{filtered.length} người dùng</span>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Thêm Nhân Viên
        </button>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          {roles.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.name}
            </option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã vô hiệu hóa</option>
        </select>
        {(searchText || filterRole || filterStatus) && (
          <button
            className="btn btn-ghost"
            onClick={() => { setSearchText(''); setFilterRole(''); setFilterStatus(''); }}
          >
            ✕ Xóa lọc
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingUser ? '✏️ Sửa Nhân Viên' : '➕ Thêm Nhân Viên Mới'}</h3>
              <button className="btn-close" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required={!editingUser}
                    disabled={!!editingUser}
                    placeholder="email@gmail.com"
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0912345678"
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select name="roleId" value={formData.roleId} onChange={handleInputChange}>
                    <option value="">-- Chưa gán vai trò --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!editingUser && (
                  <div className="form-group full-width">
                    <label>Mật khẩu *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      minLength={6}
                    />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? '💾 Lưu Thay Đổi' : '✅ Tạo Nhân Viên'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ Tên</th>
              <th>Email</th>
              <th>Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-row">
                  {users.length === 0 ? 'Chưa có nhân viên nào' : 'Không tìm thấy kết quả phù hợp'}
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className={user.status === false ? 'row-inactive' : ''}>
                  <td className="id-cell">#{user.id}</td>
                  <td className="name-cell">
                    <div className="user-avatar">{user.fullName.charAt(0).toUpperCase()}</div>
                    <span>{user.fullName}</span>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    {user.roleName ? (
                      <span className="role-badge">{user.roleName}</span>
                    ) : (
                      <span className="no-role">Chưa gán</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${user.status ? 'active' : 'inactive'}`}>
                      {user.status ? '✅ Hoạt động' : '🚫 Vô hiệu'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEdit(user)}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className={`btn btn-sm ${user.status ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(user)}
                      title={user.status ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      {user.status ? '🚫' : '✅'}
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(user)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
