import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import './RolesPage.css';

/**
 * RolesPage - Quản lý vai trò & phân quyền
 * Layout: danh sách roles (trái) + panel permissions (phải)
 */
function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]); // permission ids của role đang chọn
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [error, setError] = useState(null);

  // Form tạo/sửa role
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '' });

  // ========== Fetch ==========
  const fetchRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      const res = await axiosClient.get('/roles');
      setRoles(res.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách vai trò.');
      console.error(err);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const res = await axiosClient.get('/roles/all-permissions');
      setAllPermissions(res.data);
    } catch (err) {
      console.error('Không thể tải permissions:', err);
    }
  }, []);

  const fetchRolePermissions = useCallback(async (roleId) => {
    try {
      setLoadingPerms(true);
      const res = await axiosClient.get(`/roles/${roleId}/permissions`);
      setRolePermissions(res.data.permissions.map((p) => p.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPerms(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchAllPermissions();
  }, [fetchRoles, fetchAllPermissions]);

  // ========== Select role ==========
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    fetchRolePermissions(role.id);
  };

  // ========== Permissions checkboxes ==========
  const togglePermission = (permId) => {
    setRolePermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSavingPerms(true);
      await axiosClient.post('/roles/assign-permission', {
        roleId: selectedRole.id,
        permissionIds: rolePermissions,
      });
      alert('✅ Đã lưu quyền cho vai trò "' + selectedRole.name + '"');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPerms(false);
    }
  };

  // ========== Role Form ==========
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleFormData({ name: '', description: '' });
    setShowRoleForm(true);
  };

  const openEditRole = (role, e) => {
    e.stopPropagation();
    setEditingRole(role);
    setRoleFormData({ name: role.name, description: role.description || '' });
    setShowRoleForm(true);
  };

  const resetRoleForm = () => {
    setShowRoleForm(false);
    setEditingRole(null);
    setRoleFormData({ name: '', description: '' });
  };

  const handleRoleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await axiosClient.put(`/roles/${editingRole.id}`, roleFormData);
        // update local state
        if (selectedRole?.id === editingRole.id) {
          setSelectedRole({ ...selectedRole, ...roleFormData });
        }
      } else {
        await axiosClient.post('/roles', roleFormData);
      }
      resetRoleForm();
      fetchRoles();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteRole = async (role, e) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa vai trò "${role.name}"?`)) return;
    try {
      await axiosClient.delete(`/roles/${role.id}`);
      if (selectedRole?.id === role.id) setSelectedRole(null);
      fetchRoles();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Group permissions by prefix (e.g., "manage_users" → "manage")
  const groupedPermissions = allPermissions.reduce((acc, p) => {
    const group = p.name.includes('_') ? p.name.split('_')[1] : 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  // ========== Render ==========
  if (loadingRoles) return <div className="loading-state">⏳ Đang tải dữ liệu vai trò...</div>;

  return (
    <div className="roles-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>🔑 Quản Lý Vai Trò & Quyền</h1>
          <span className="badge-count">{roles.length} vai trò</span>
        </div>
        <button className="btn btn-primary" onClick={openCreateRole}>
          + Tạo Vai Trò Mới
        </button>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {/* Role Form Modal */}
      {showRoleForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetRoleForm()}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingRole ? '✏️ Sửa Vai Trò' : '➕ Tạo Vai Trò Mới'}</h3>
              <button className="btn-close" onClick={resetRoleForm}>✕</button>
            </div>
            <form onSubmit={handleRoleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên vai trò *</label>
                <input
                  type="text"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="VD: Receptionist, Manager..."
                />
              </div>
              <div className="form-group" style={{ marginTop: 14 }}>
                <label>Mô tả</label>
                <textarea
                  rows="3"
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Mô tả nhiệm vụ của vai trò này..."
                />
              </div>
              <div className="form-actions" style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn-primary">
                  {editingRole ? '💾 Lưu' : '✅ Tạo'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetRoleForm}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main layout: 2 panels */}
      <div className="roles-layout">
        {/* Left: Roles List */}
        <div className="roles-panel">
          <div className="panel-header">
            <h3>Danh Sách Vai Trò</h3>
          </div>
          <div className="roles-list">
            {roles.length === 0 ? (
              <div className="empty-hint">Chưa có vai trò nào. Nhấn "+ Tạo Vai Trò Mới"</div>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  className={`role-item ${selectedRole?.id === role.id ? 'selected' : ''}`}
                  onClick={() => handleSelectRole(role)}
                >
                  <div className="role-item-info">
                    <div className="role-icon">🏷️</div>
                    <div>
                      <div className="role-name">{role.name}</div>
                      <div className="role-desc">{role.description || 'Chưa có mô tả'}</div>
                    </div>
                  </div>
                  <div className="role-actions">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={(e) => openEditRole(role, e)}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={(e) => handleDeleteRole(role, e)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Permissions Panel */}
        <div className="permissions-panel">
          {!selectedRole ? (
            <div className="no-role-selected">
              <div className="no-role-icon">🔐</div>
              <p>Chọn một vai trò bên trái để quản lý quyền hạn</p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <div>
                  <h3>Quyền Hạn: <span className="role-highlight">{selectedRole.name}</span></h3>
                  <p className="panel-subtitle">
                    {rolePermissions.length}/{allPermissions.length} quyền được gán
                  </p>
                </div>
                <div className="perm-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setRolePermissions(allPermissions.map((p) => p.id))}
                  >
                    ✅ Chọn tất cả
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setRolePermissions([])}
                  >
                    ☐ Bỏ chọn tất
                  </button>
                </div>
              </div>

              {loadingPerms ? (
                <div className="loading-inline">⏳ Đang tải quyền...</div>
              ) : (
                <div className="permissions-list">
                  {allPermissions.length === 0 ? (
                    <div className="empty-hint">Không có permission nào trong hệ thống.</div>
                  ) : (
                    Object.entries(groupedPermissions).sort().map(([group, perms]) => (
                      <div key={group} className="perm-group">
                        <div className="perm-group-label">{group.toUpperCase()}</div>
                        {perms.map((perm) => (
                          <label key={perm.id} className="perm-checkbox-row">
                            <div className={`checkbox-custom ${rolePermissions.includes(perm.id) ? 'checked' : ''}`}
                              onClick={() => togglePermission(perm.id)}>
                              {rolePermissions.includes(perm.id) && <span>✓</span>}
                            </div>
                            <div className="perm-info">
                              <span className="perm-name">{perm.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="save-bar">
                <button
                  className="btn btn-primary"
                  onClick={handleSavePermissions}
                  disabled={savingPerms}
                >
                  {savingPerms ? '⏳ Đang lưu...' : '💾 Lưu Quyền'}
                </button>
                <span className="save-hint">Thay đổi sẽ có hiệu lực ngay lập tức</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RolesPage;
