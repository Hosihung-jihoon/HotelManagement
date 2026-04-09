import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Check, X, Info,
  LayoutDashboard, Users, ShieldIcon, BedDouble,
  CalendarCheck, FileText, ConciergeBell, BarChart2,
  Newspaper, Package } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './RolesPage.css';

// ======================== PERMISSION META ========================
// Map tên quyền kỹ thuật → thông tin hiển thị UI
const PERMISSION_META = {
  VIEW_DASHBOARD: {
    label: 'Xem Dashboard',
    description: 'Xem tổng quan hệ thống, thống kê doanh thu, hoạt động gần đây',
    module: 'Tổng quan',
    moduleIcon: LayoutDashboard,
    moduleColor: '#6366f1',
  },
  MANAGE_USERS: {
    label: 'Quản lý nhân sự',
    description: 'Xem danh sách, thêm mới, sửa thông tin, khóa/mở tài khoản nhân viên',
    module: 'Nhân sự',
    moduleIcon: Users,
    moduleColor: '#0ea5e9',
  },
  VIEW_USERS: {
    label: 'Xem danh sách nhân sự',
    description: 'Chỉ được xem thông tin nhân viên, không được chỉnh sửa',
    module: 'Nhân sự',
    moduleIcon: Users,
    moduleColor: '#0ea5e9',
  },
  CREATE_USERS: {
    label: 'Tạo tài khoản nhân sự',
    description: 'Thêm mới tài khoản nhân viên vào hệ thống',
    module: 'Nhân sự',
    moduleIcon: Users,
    moduleColor: '#0ea5e9',
  },
  MANAGE_ROLES: {
    label: 'Quản lý vai trò & phân quyền',
    description: 'Xem, tạo và chỉnh sửa vai trò; phân quyền cho từng vai trò',
    module: 'Phân quyền',
    moduleIcon: ShieldIcon,
    moduleColor: '#a855f7',
  },
  VIEW_ROLES: {
    label: 'Xem vai trò',
    description: 'Chỉ được xem danh sách vai trò, không phân quyền',
    module: 'Phân quyền',
    moduleIcon: ShieldIcon,
    moduleColor: '#a855f7',
  },
  EDIT_ROLES: {
    label: 'Chỉnh sửa vai trò',
    description: 'Sửa thông tin vai trò và cập nhật phân quyền',
    module: 'Phân quyền',
    moduleIcon: ShieldIcon,
    moduleColor: '#a855f7',
  },
  MANAGE_ROOMS: {
    label: 'Quản lý phòng',
    description: 'Xem danh sách phòng, thêm/sửa/xóa phòng, cập nhật trạng thái phòng, quản lý loại phòng',
    module: 'Quản lý phòng',
    moduleIcon: BedDouble,
    moduleColor: '#10b981',
  },
  MANAGE_BOOKINGS: {
    label: 'Quản lý đặt phòng',
    description: 'Xem, tạo, sửa đặt phòng; check-in / check-out; hủy booking; xem lịch đặt phòng',
    module: 'Đặt phòng',
    moduleIcon: CalendarCheck,
    moduleColor: '#f59e0b',
  },
  MANAGE_INVOICES: {
    label: 'Quản lý hóa đơn',
    description: 'Xem, tạo, in hóa đơn; xử lý thanh toán; quản lý phương thức thanh toán',
    module: 'Hóa đơn & Thanh toán',
    moduleIcon: FileText,
    moduleColor: '#ef4444',
  },
  MANAGE_SERVICES: {
    label: 'Quản lý dịch vụ',
    description: 'Xem, thêm/sửa/xóa dịch vụ khách sạn; quản lý danh mục dịch vụ; xem đơn đặt dịch vụ',
    module: 'Dịch vụ',
    moduleIcon: ConciergeBell,
    moduleColor: '#06b6d4',
  },
  VIEW_REPORTS: {
    label: 'Xem báo cáo thống kê',
    description: 'Xem báo cáo doanh thu, công suất phòng, thống kê nhân sự và khách hàng',
    module: 'Báo cáo',
    moduleIcon: BarChart2,
    moduleColor: '#8b5cf6',
  },
  MANAGE_CONTENT: {
    label: 'Quản lý nội dung',
    description: 'Đăng, sửa, xóa bài viết; quản lý điểm tham quan; quản lý hình ảnh phòng',
    module: 'Nội dung & Marketing',
    moduleIcon: Newspaper,
    moduleColor: '#ec4899',
  },
  MANAGE_INVENTORY: {
    label: 'Quản lý kho vật tư',
    description: 'Xem kho, thêm/sửa/xóa thiết bị; phân bổ vật tư vào phòng; báo cáo thất thoát',
    module: 'Kho vật tư',
    moduleIcon: Package,
    moduleColor: '#f97316',
  },
};

// ======================== COMPONENTS ========================

// Permission Panel (Slide-in Drawer)
function PermissionPanel({ role, initialModules, onClose }) {
  const [modules, setModules] = useState(initialModules);
  const [saving, setSaving] = useState(false);

  const togglePermission = (modId, permId) => {
    setModules(prev => prev.map(mod => {
      if (mod.id !== modId) return mod;
      return {
        ...mod,
        perms: mod.perms.map(p => p.id === permId ? { ...p, checked: !p.checked } : p)
      };
    }));
  };

  const toggleAllInModule = (modId, isChecked) => {
    setModules(prev => prev.map(mod => {
      if (mod.id !== modId) return mod;
      return {
        ...mod,
        perms: mod.perms.map(p => ({ ...p, checked: isChecked }))
      };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const checkedIds = [];
      modules.forEach(m => {
        m.perms.forEach(p => {
          if (p.checked) checkedIds.push(p.id);
        });
      });

      await axiosClient.post('/Roles/assign-permission', {
        roleId: role.id,
        permissionIds: checkedIds
      });
      alert('Đã cập nhật quyền thành công lên cơ sở dữ liệu!');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi phân quyền!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="permission-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <div>
            <h3>Phân quyền: {role.name}</h3>
            <p>Tùy chỉnh các quyền hạn truy cập cho vai trò này</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="panel-body">
          {modules.map(mod => {
            const allChecked = mod.perms.length > 0 && mod.perms.every(p => p.checked);
            const someChecked = mod.perms.length > 0 && mod.perms.some(p => p.checked) && !allChecked;
            const ModIcon = mod.icon;

            return (
              <div key={mod.id} className="perm-module">
                <div className="perm-module-header" style={{ borderLeftColor: mod.color || '#6366f1' }}>
                  <div className="perm-module-title-wrap">
                    {ModIcon && <ModIcon size={16} style={{ color: mod.color, flexShrink: 0 }} />}
                    <span className="perm-module-title">{mod.name}</span>
                  </div>
                  <label className="perm-switch tick-all">
                    <span className="tick-all-label">Tất cả</span>
                    <input 
                      type="checkbox" 
                      checked={allChecked} 
                      ref={input => { if (input) input.indeterminate = someChecked; }}
                      onChange={(e) => toggleAllInModule(mod.id, e.target.checked)} 
                    />
                    <div className="perm-switch-box">
                       {allChecked && <Check size={14} />}
                       {someChecked && <div className="indeterminate-dash" />}
                    </div>
                  </label>
                </div>
                <div className="perm-list">
                  {mod.perms.map(p => (
                    <label key={p.id} className="perm-item">
                      <div className="perm-label-wrap">
                        <span className="perm-label">{p.label}</span>
                        {p.description && (
                          <span className="perm-description">{p.description}</span>
                        )}
                      </div>
                      <div className="switch-wrapper">
                        <label className="switch">
                          <input type="checkbox" checked={p.checked} onChange={() => togglePermission(mod.id, p.id)} />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="panel-footer">
          <button className="btn-back" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : '✓ Lưu phân quyền'}
          </button>
        </div>
      </div>
    </div>
  );
}


// Main Page
function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelConfig, setPanelConfig] = useState(null); // { role, modules }

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/Roles');
      // Thêm flag isAdmin, isCustomer để handle UI
      const mappedRoles = response.data.map(r => ({
        ...r,
        isAdmin: r.name.toLowerCase().includes('admin'),
        isCustomer: r.name.toLowerCase().includes('khách hàng') || r.name.toLowerCase() === 'customer' || r.name.toLowerCase() === 'guest'
      }));
      setRoles(mappedRoles);
    } catch (error) {
      console.error("Lỗi lấy roles:", error);
      alert("Không thể tải danh sách vai trò. Hãy đảm bảo bạn đã đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPanel = async (role) => {
    try {
      const resAll = await axiosClient.get('/Roles/all-permissions');
      const allPerms = resAll.data;
      const resRole = await axiosClient.get(`/Roles/${role.id}/permissions`);
      const myPermsIds = resRole.data.permissions.map(p => p.id);

      // Nhóm permissions theo module từ PERMISSION_META
      const moduleMap = {};
      allPerms.forEach(p => {
        const meta = PERMISSION_META[p.name] || {
          label: p.name,
          description: '',
          module: 'Khác',
          moduleIcon: Shield,
          moduleColor: '#64748b',
        };
        if (!moduleMap[meta.module]) {
          moduleMap[meta.module] = {
            id: `mod_${meta.module}`,
            name: meta.module,
            icon: meta.moduleIcon,
            color: meta.moduleColor,
            perms: []
          };
        }
        moduleMap[meta.module].perms.push({
          id: p.id,
          label: meta.label,
          description: meta.description,
          checked: myPermsIds.includes(p.id)
        });
      });

      const uiModules = Object.values(moduleMap);
      setPanelConfig({ role, modules: uiModules });
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải thông tin phân quyền cho vai trò này.");
    }
  };

  if (loading) {
    return <div className="roles-page" style={{ padding: 40 }}>Đang tải dữ liệu từ máy chủ API...</div>;
  }

  return (
    <div className="roles-page">
      <div className="inv-header">
        <div>
          <h1 className="page-title">Vai trò & Phân quyền</h1>
          <p className="page-subtitle">Quản lý các vai trò và quyền hạn (RBAC) sử dụng API thực tế</p>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="role-alert">
        <Info size={20} className="role-alert-icon" />
        <div className="role-alert-text">
          <strong>Lưu ý:</strong> Khi bạn thay đổi quyền của một vai trò, tất cả nhân sự đang giữ vai trò đó sẽ tự động được cập nhật quyền hạn vào hệ thống. Cần token từ backend để thực hiện.
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="rooms-table roles-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: '200px' }}>Tên vai trò</th>
              <th>Mô tả</th>
              <th style={{ width: '140px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td><span className="role-id-badge">{role.id}</span></td>
                <td><strong className="role-name-text">{role.name}</strong></td>
                <td><span className="role-desc-text">{role.description}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className={`btn-assign-perm ${role.isCustomer || role.isAdmin ? 'disabled' : ''}`}
                    onClick={() => (!role.isCustomer && !role.isAdmin) && handleOpenPanel(role)}
                    disabled={role.isCustomer || role.isAdmin}
                    title={role.isAdmin ? "Admin mặc định có toàn quyền hệ thống" : (role.isCustomer ? "Không thể phân quyền cho khách hàng" : "Phân quyền vai trò này")}
                  >
                    {role.isAdmin ? <ShieldCheck size={16} /> : <Shield size={16} />} 
                    {role.isAdmin ? ' Toàn quyền' : ' Phân quyền'}
                  </button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu vai trò nào.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-footer">
          Tổng cộng {roles.length} vai trò
        </div>
      </div>

      {panelConfig && (
        <PermissionPanel 
          role={panelConfig.role} 
          initialModules={panelConfig.modules} 
          onClose={() => setPanelConfig(null)} 
        />
      )}
    </div>
  );
}

export default RolesPage;
