import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BedDouble, Users, CalendarCheck, TrendingUp,
  Sparkles, AlertTriangle, ArrowUpRight, Clock,
  Key, LogOut, CalendarRange, RefreshCw
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './DashboardPage.css';

const fmt    = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v;
const fmtVND = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      <p className="tooltip-value">{fmtVND(payload[0].value)}</p>
    </div>
  );
};

// Màu biểu đồ trạng thái phòng
const STATUS_COLORS = {
  'Available': '#10b981',
  'Occupied':  '#2563eb',
  'Cleaning':  '#f59e0b',
  'Maintenance': '#ef4444',
};

function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/Dashboard/stats');
      setStats(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh mỗi 5 phút
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="dashboard">
        <div className="db-header">
          <div>
            <h1 className="db-title">Dashboard</h1>
            <p className="db-subtitle">Đang tải dữ liệu từ server...</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p>Đang tải dữ liệu thực tế từ cơ sở dữ liệu...</p>
        </div>
      </div>
    );
  }

  const totalRooms    = stats?.totalRooms ?? 0;
  const occupied      = stats?.occupiedRooms ?? 0;
  const available     = stats?.availableRooms ?? 0;
  const todayBookings = stats?.totalBookingsToday ?? 0;
  const totalRevenue  = stats?.totalRevenue ?? 0;
  const revenueByMonth = stats?.revenueByMonth ?? [];
  const bookingsByStatus = stats?.bookingsByStatus ?? [];
  const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  // Chuyển bookingsByStatus sang dữ liệu pie chart
  const roomStatusData = bookingsByStatus.map(b => ({
    name: b.status,
    value: b.count,
    color: STATUS_COLORS[b.status] ?? '#94a3b8',
  }));

  // Revenue chart data
  const revenueData = revenueByMonth.map(r => ({
    month: r.month,
    revenue: r.amount,
  }));

  const totalRevenueSum = revenueData.reduce((s, d) => s + d.revenue, 0);

  // Hoạt động gần đây (static icons, dữ liệu thực sẽ từ Notifications API sau)
  const recentActivities = [
    { id: 1, type: 'checkin',  guest: 'Dữ liệu thực từ API', room: '—', time: '—', icon: <Key size={16} /> },
  ];

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="db-header">
        <div>
          <h1 className="db-title">Dashboard</h1>
          <p className="db-subtitle">
            Tổng quan hoạt động khách sạn · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {timeStr && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cập nhật lúc {timeStr}</span>}
          <button
            onClick={fetchStats}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}
          >
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Làm mới
          </button>
          <div className="db-live">
            <span className="live-dot" />
            <span>Live Data</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon-wrap"><BedDouble size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{totalRooms}</div>
            <div className="kpi-label">Tổng số phòng</div>
          </div>
          <div className="kpi-trend neutral"><Clock size={14} /> {available} phòng trống</div>
        </div>

        <div className="kpi-card kpi-cyan">
          <div className="kpi-icon-wrap"><Users size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{occupied}</div>
            <div className="kpi-label">Đang có khách</div>
          </div>
          <div className="kpi-trend up"><ArrowUpRight size={14} /> {occupancyRate}% lấp đầy</div>
        </div>

        <div className="kpi-card kpi-amber">
          <div className="kpi-icon-wrap"><CalendarCheck size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{todayBookings}</div>
            <div className="kpi-label">Booking hôm nay</div>
          </div>
          <div className="kpi-trend up"><ArrowUpRight size={14} /> Tổng {stats?.totalBookings ?? 0} booking</div>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-icon-wrap"><TrendingUp size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{fmt(totalRevenue)}đ</div>
            <div className="kpi-label">Tổng doanh thu</div>
          </div>
          <div className="kpi-trend up"><ArrowUpRight size={14} /> Từ tất cả hóa đơn</div>
        </div>

        <div className="kpi-card kpi-purple">
          <div className="kpi-icon-wrap"><Sparkles size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{available}</div>
            <div className="kpi-label">Phòng sẵn sàng</div>
          </div>
          <div className="kpi-trend neutral"><Clock size={14} /> Có thể đặt ngay</div>
        </div>

        <div className="kpi-card kpi-rose">
          <div className="kpi-icon-wrap"><AlertTriangle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{totalRooms - occupied - available}</div>
            <div className="kpi-label">Phòng bảo trì/dọn</div>
          </div>
          <div className="kpi-trend neutral"><Clock size={14} /> Đang xử lý</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Revenue area chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Doanh thu theo tháng</h3>
            <span className="chart-total">Tổng: {fmtVND(totalRevenueSum)}</span>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} debounce={200}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={fmt} axisLine={false} tickLine={false} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" name="Doanh thu" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Booking by status bar chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Booking theo trạng thái</h3>
          </div>
          {bookingsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} debounce={200}>
              <BarChart data={bookingsByStatus} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" name="Số booking" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Chưa có dữ liệu booking
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="bottom-row">
        {/* Room status pie */}
        <div className="chart-card">
          <h3 className="chart-title">Trạng thái phòng</h3>
          {roomStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} debounce={200}>
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={80}
                  dataKey="value" paddingAngle={3}
                >
                  {roomStatusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' phòng', n]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Chưa có dữ liệu
            </div>
          )}
          <div className="occupancy-rate">
            <span className="rate-value">{occupancyRate}%</span>
            <span className="rate-label">Tỷ lệ lấp đầy</span>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="chart-card">
          <h3 className="chart-title">Thống kê nhanh</h3>
          <div className="top-rooms-list">
            {[
              { label: 'Tổng phòng', value: totalRooms, color: '#2563eb' },
              { label: 'Đang có khách', value: occupied, color: '#10b981' },
              { label: 'Phòng trống', value: available, color: '#f59e0b' },
              { label: 'Booking hôm nay', value: todayBookings, color: '#8b5cf6' },
            ].map((item, i) => (
              <div key={i} className="top-room-item">
                <div className="top-room-rank" style={{ color: item.color }}>#{i + 1}</div>
                <div className="top-room-info">
                  <div className="top-room-number">{item.label}</div>
                </div>
                <div className="top-room-revenue" style={{ color: item.color, fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="chart-card">
          <h3 className="chart-title">Hoạt động gần đây</h3>
          <div className="activity-list">
            <div className="activity-item type-booking" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="activity-emoji"><CalendarRange size={16} /></span>
                <div className="activity-info">
                  <div className="activity-name">Tổng booking: {stats?.totalBookings ?? 0}</div>
                  <div className="activity-room">Hôm nay: {todayBookings} booking mới</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="activity-emoji"><Key size={16} /></span>
                <div className="activity-info">
                  <div className="activity-name">Phòng đang có khách: {occupied}</div>
                  <div className="activity-room">Tỷ lệ lấp đầy: {occupancyRate}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="activity-emoji"><LogOut size={16} /></span>
                <div className="activity-info">
                  <div className="activity-name">Phòng trống sẵn sàng: {available}</div>
                  <div className="activity-room">Có thể nhận khách ngay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
