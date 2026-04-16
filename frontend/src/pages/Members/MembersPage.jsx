import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Users, Award, Star } from 'lucide-react';
import '../RoomTypes/RoomTypesPage.css'; // Reusing common styles

export default function MembersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('guests');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch stats and lists concurrently
      const [statsRes, usersRes] = await Promise.all([
        axiosClient.get('/user-management/membership-stats'),
        axiosClient.get('/user-management')
      ]);
      
      // Define tier order for sorting
      const tierOrder = {
        'khách mới': 1,
        'đồng': 2,
        'bronze': 2,
        'bạc': 3,
        'silver': 3,
        'vàng': 4,
        'gold': 4,
        'bạch kim': 5,
        'platinum': 5
      };

      const sortedStats = (statsRes.data || []).sort((a, b) => {
        const rankA = tierOrder[a.tierName?.toLowerCase()] || 99;
        const rankB = tierOrder[b.tierName?.toLowerCase()] || 99;
        return rankA - rankB;
      });
      
      setStats(sortedStats);
      
      // Filter out only users who have a membership or are regular guests
      const allUsers = usersRes.data || [];
      // If we only want to show members, we can filter them here:
      // setUsers(allUsers.filter(u => u.membershipName));
      // For now, let's show all, but we can highlight members.
      setUsers(allUsers);
      
      setError(null);
    } catch (err) {
      setError('Lỗi tải dữ liệu khách hàng. Đảm bảo bạn có quyền quản lý users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tierName) => {
    const name = tierName?.toLowerCase() || '';
    if (name.includes('khách mới')) {
      return 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'; // Blue
    }
    if (name.includes('đồng') || name.includes('bronze')) {
      return 'linear-gradient(135deg, #d97706 0%, #78350f 100%)'; // Bronze
    }
    if (name.includes('bạc') || name.includes('silver')) {
      return 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)'; // Lighter Silver
    }
    if (name.includes('vàng') || name.includes('gold')) {
      return 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)'; // Gold
    }
    if (name.includes('bạch kim') || name.includes('platinum')) {
      return 'linear-gradient(135deg, #1e293b 0%, #020617 100%)'; // Deep Premium Dark Platinum
    }
    return 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'; // Default Blue
  };

  const getTierTextColor = (tierName) => {
    const name = tierName?.toLowerCase() || '';
    if (name.includes('khách mới')) return '#2563eb';
    if (name.includes('đồng') || name.includes('bronze')) return '#92400e';
    if (name.includes('bạc') || name.includes('silver')) return '#64748b';
    if (name.includes('vàng') || name.includes('gold')) return '#b45309';
    if (name.includes('bạch kim') || name.includes('platinum')) return '#0f172a';
    return '#2563eb';
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="room-types-page" style={{ padding: '20px' }}>
      <div className="page-header">
        <h1><Users size={28} className="header-icon" /> Quản Lý Khách Hàng & Thành Viên</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Dashboard Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {stats.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '20px', background: '#fff', borderRadius: '8px' }}>
            Chưa có số liệu thống kê thành viên.
          </div>
        ) : (
          stats.map((stat) => (
            <div key={stat.membershipId} style={{
              background: getTierColor(stat.tierName),
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Award size={48} style={{position: 'absolute', right: '-10px', top: '-10px', opacity: 0.2, transform: 'rotate(15deg)'}} />
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', opacity: 0.9 }}>{stat.tierName}</h3>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stat.memberCount}</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Thành viên</div>
            </div>
          ))
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '30px', marginBottom: '-10px' }}>
        <button 
          onClick={() => setActiveTab('guests')}
          style={{
            padding: '10px 20px', background: activeTab === 'guests' ? 'var(--primary-color, #2563eb)' : '#f1f5f9',
            color: activeTab === 'guests' ? '#fff' : '#64748b', border: 'none', borderRadius: '8px 8px 0 0',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
          }}>
          Khách hàng
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          style={{
            padding: '10px 20px', background: activeTab === 'staff' ? 'var(--primary-color, #2563eb)' : '#f1f5f9',
            color: activeTab === 'staff' ? '#fff' : '#64748b', border: 'none', borderRadius: '8px 8px 0 0',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
          }}>
          Nhân viên
        </button>
      </div>

      {/* User Data Table */}
      <div className="table-card" style={{ marginTop: '0', borderRadius: '0 8px 8px 8px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Khách Hàng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Phân Quyền</th>
              <th>Hạng Thành Viên</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const displayedUsers = activeTab === 'guests' 
                ? users.filter(u => !u.roleName || u.roleName.toLowerCase() === 'guest')
                : users.filter(u => u.roleName && u.roleName.toLowerCase() !== 'guest');
              
              if (displayedUsers.length === 0) {
                 return <tr><td colSpan="6" className="empty-row">Không tìm thấy dữ liệu.</td></tr>;
              }
              
              return displayedUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.fullName}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                      background: u.roleName === 'admin' ? '#fee2e2' : '#f3f4f6',
                      color: u.roleName === 'admin' ? '#b91c1c' : '#374151'
                    }}>
                      {u.roleName || 'Guest'}
                    </span>
                  </td>
                  <td>
                    {u.membershipName ? (
                      <span style={{ 
                        color: getTierTextColor(u.membershipName), 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}>
                        <Star size={14} fill={getTierTextColor(u.membershipName)} /> {u.membershipName}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>Chưa có hạng</span>
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
