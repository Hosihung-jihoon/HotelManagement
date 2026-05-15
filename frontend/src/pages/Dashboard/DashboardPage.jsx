import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BedDouble, Users, CalendarCheck, TrendingUp, Sparkles,
  AlertTriangle, ArrowUpRight, Clock, Key, LogOut, RefreshCw,
  Home, Wrench, ShieldAlert
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import TrendBadge from '../../components/Dashboard/TrendBadge';
import PeriodPicker from '../../components/Dashboard/PeriodPicker';
import './DashboardPage.css';

const fmt    = (v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v;
const fmtVND = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';

const STATUS_COLORS = {
  Available: '#10b981', Occupied: '#2563eb', Cleaning: '#f59e0b', Maintenance: '#ef4444',
};

const now = new Date();
const DEFAULT_PERIOD_KEY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

// ── Helpers ─────────────────────────────────────────────────────────────────
function safeJson(str) {
  if (!str) return {};
  try { return JSON.parse(str); } catch { return {}; }
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      <p className="tooltip-value">{fmtVND(payload[0].value)}</p>
    </div>
  );
}

// ── Role-specific sub-dashboards ──────────────────────────────────────────────
function AdminDashboard({ dash, comp, legacyStats }) {
  const summary    = dash?.summary ?? {};
  const charts     = dash?.charts ?? {};
  const alerts     = dash?.alerts ?? [];
  const metrics    = comp?.metrics ?? {};

  const revenueComp  = metrics.totalRevenue;
  const bookingsComp = metrics.totalBookings;

  const revenueData = (charts.revenueByDay ?? []).map(r => ({ label: r.label, revenue: r.value }));

  // Fallback to legacy if snapshot is empty
  const totalRevenue  = summary.totalRevenue  ?? legacyStats?.totalRevenue  ?? 0;
  const totalBookings = summary.totalBookings ?? legacyStats?.totalBookings ?? 0;
  const totalRooms    = summary.totalRooms    ?? legacyStats?.totalRooms    ?? 0;
  const occupiedRooms = summary.occupiedRooms ?? legacyStats?.occupiedRooms ?? 0;
  const availableRooms = legacyStats?.availableRooms ?? 0;
  const occupancyRate  = summary.occupancyRate ?? (totalRooms > 0 ? Math.round(occupiedRooms / totalRooms * 100) : 0);
  const todayBookings  = legacyStats?.totalBookingsToday ?? 0;

  const legacyRevByMonth  = legacyStats?.revenueByMonth ?? [];
  const legacyByStatus    = legacyStats?.bookingsByStatus ?? [];
  const roomStatusData    = legacyByStatus.map(b => ({ name: b.status, value: b.count, color: STATUS_COLORS[b.status] ?? '#94a3b8' }));
  const revenueChartData  = revenueData.length > 0
    ? revenueData
    : legacyRevByMonth.map(r => ({ label: r.month, revenue: r.amount }));

  return (
    <>
      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderRadius: 8, background: a.level === 'warning' ? '#fef9c3' : '#fee2e2',
              border: `1px solid ${a.level === 'warning' ? '#fde047' : '#fca5a5'}`,
              color: a.level === 'warning' ? '#854d0e' : '#b91c1c', fontSize: '0.88rem'
            }}>
              <AlertTriangle size={16} /> {a.message}
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard color="kpi-blue" icon={<BedDouble size={22} />}
          value={totalRooms} label="Tổng số phòng"
          sub={`${availableRooms} phòng trống`} subIcon={<Clock size={14} />} />
        <KpiCard color="kpi-cyan" icon={<Users size={22} />}
          value={occupiedRooms} label="Đang có khách"
          sub={`${occupancyRate}% lấp đầy`} subIcon={<ArrowUpRight size={14} />}
          trend={revenueComp ? null : null} />
        <KpiCard color="kpi-amber" icon={<CalendarCheck size={22} />}
          value={todayBookings} label="Booking hôm nay"
          sub={`Tổng ${totalBookings} booking`} subIcon={<ArrowUpRight size={14} />}
          badge={bookingsComp && <TrendBadge {...bookingsComp} />} />
        <KpiCard color="kpi-green" icon={<TrendingUp size={22} />}
          value={fmt(totalRevenue) + 'đ'} label="Tổng doanh thu"
          sub="Từ tất cả hóa đơn" subIcon={<ArrowUpRight size={14} />}
          badge={revenueComp && <TrendBadge {...revenueComp} />} />
        <KpiCard color="kpi-purple" icon={<Sparkles size={22} />}
          value={availableRooms} label="Phòng sẵn sàng"
          sub="Có thể đặt ngay" subIcon={<Clock size={14} />} />
        <KpiCard color="kpi-rose" icon={<AlertTriangle size={22} />}
          value={totalRooms - occupiedRooms - availableRooms} label="Phòng bảo trì/dọn"
          sub="Đang xử lý" subIcon={<Clock size={14} />} />
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Doanh thu theo kỳ</h3>
            <span className="chart-total">Tổng: {fmtVND(revenueChartData.reduce((s, d) => s + (d.revenue ?? 0), 0))}</span>
          </div>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} debounce={200}>
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={fmt} axisLine={false} tickLine={false} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" name="Doanh thu" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={220} />}
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3 className="chart-title">Booking theo trạng thái</h3></div>
          {legacyByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220} debounce={200}>
              <BarChart data={legacyByStatus} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" name="Số booking" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={220} />}
        </div>
      </div>

      {/* Bottom */}
      <div className="bottom-row">
        <div className="chart-card">
          <h3 className="chart-title">Trạng thái phòng</h3>
          {roomStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200} debounce={200}>
              <PieChart>
                <Pie data={roomStatusData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {roomStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' phòng', n]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart height={200} />}
          <div className="occupancy-rate">
            <span className="rate-value">{occupancyRate}%</span>
            <span className="rate-label">Tỷ lệ lấp đầy</span>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Thống kê nhanh</h3>
          <div className="top-rooms-list">
            {[
              { label: 'Tổng phòng',     value: totalRooms,    color: '#2563eb' },
              { label: 'Đang có khách',  value: occupiedRooms, color: '#10b981' },
              { label: 'Phòng trống',    value: availableRooms, color: '#f59e0b' },
              { label: 'Booking hôm nay', value: todayBookings, color: '#8b5cf6' },
            ].map((item, i) => (
              <div key={i} className="top-room-item">
                <div className="top-room-rank" style={{ color: item.color }}>#{i + 1}</div>
                <div className="top-room-info"><div className="top-room-number">{item.label}</div></div>
                <div className="top-room-revenue" style={{ color: item.color, fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">So sánh kỳ trước</h3>
          <ComparisonPanel comp={comp} />
        </div>
      </div>
    </>
  );
}

function ReceptionistDashboard({ dash }) {
  const s = dash?.summary ?? {};
  return (
    <div className="kpi-grid">
      <KpiCard color="kpi-blue"   icon={<Key size={22} />}      value={s.todayArrivals ?? 0}   label="Khách đến hôm nay"    sub="Check-in" />
      <KpiCard color="kpi-cyan"   icon={<LogOut size={22} />}   value={s.todayDepartures ?? 0} label="Khách đi hôm nay"     sub="Check-out" />
      <KpiCard color="kpi-amber"  icon={<Clock size={22} />}    value={s.pendingCheckIn ?? 0}  label="Chờ nhận phòng"        sub="Cần xử lý ngay" />
      <KpiCard color="kpi-green"  icon={<Users size={22} />}    value={s.currentGuests ?? 0}   label="Khách đang lưu trú"   sub="Phòng đang sử dụng" />
    </div>
  );
}

function HousekeepingDashboard({ dash, comp }) {
  const s       = dash?.summary ?? {};
  const alerts  = dash?.alerts  ?? [];
  const metrics = comp?.metrics ?? {};
  const dc      = metrics.damageReports;
  return (
    <>
      {alerts.length > 0 && alerts.map((a, i) => (
        <div key={i} style={{ padding: '10px 16px', marginBottom: 12, borderRadius: 8,
          background: '#fef9c3', border: '1px solid #fde047', color: '#854d0e', fontSize: '0.88rem',
          display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={16} /> {a.message}
        </div>
      ))}
      <div className="kpi-grid">
        <KpiCard color="kpi-amber" icon={<Sparkles size={22} />}   value={s.roomsCleaning ?? 0}     label="Phòng đang dọn"      sub="Đang xử lý" />
        <KpiCard color="kpi-rose"  icon={<Wrench size={22} />}     value={s.roomsNeedCleaning ?? 0} label="Phòng bảo trì"        sub="Cần xử lý" />
        <KpiCard color="kpi-purple" icon={<ShieldAlert size={22} />}
          value={s.damageReportCount ?? 0} label="Báo cáo hỏng"
          sub="Trong kỳ" badge={dc && <TrendBadge {...dc} />} />
      </div>
    </>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────
function KpiCard({ color, icon, value, label, sub, subIcon, badge }) {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-icon-wrap">{icon}</div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {badge
          ? badge
          : <div className="kpi-trend neutral" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {subIcon}{sub}
            </div>
        }
      </div>
    </div>
  );
}

function ComparisonPanel({ comp }) {
  const metrics = comp?.metrics ?? {};
  const prevKey = comp?.previousPeriodKey;
  if (!prevKey) return <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Chưa có dữ liệu so sánh</p>;
  return (
    <div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
        So với kỳ: <strong>{prevKey}</strong>
      </p>
      {Object.entries(metrics).map(([key, m]) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-primary)' }}>{formatMetricLabel(key)}</span>
          <TrendBadge growthRate={m.growthRate} trend={m.trend} directionMeaning={m.directionMeaning} badgeColor={m.badgeColor} />
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ height = 200 }) {
  return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
      Chưa có dữ liệu
    </div>
  );
}

function formatMetricLabel(key) {
  const labels = { totalRevenue: 'Doanh thu', totalBookings: 'Booking', damageReports: 'Báo cáo hỏng', occupancyRate: 'Tỷ lệ lấp đầy' };
  return labels[key] ?? key;
}

// ── Main DashboardPage ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const roleName = user?.roleName ?? user?.role ?? 'Admin';

  const [period, setPeriod] = useState({ periodType: 'Monthly', periodKey: DEFAULT_PERIOD_KEY });
  const [snapshot, setSnapshot]     = useState(null);
  const [legacyStats, setLegacy]    = useState(null);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [snapRes, legacyRes] = await Promise.allSettled([
        axiosClient.get('/Dashboard/snapshot', { params: period }),
        axiosClient.get('/Dashboard/stats'),
      ]);
      if (snapRes.status === 'fulfilled') setSnapshot(snapRes.value.data);
      if (legacyRes.status === 'fulfilled') setLegacy(legacyRes.value.data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dash = safeJson(snapshot?.dashboardJson);
  const comp = safeJson(snapshot?.comparisonJson);

  const timeStr = lastUpdated?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const renderDashboard = () => {
    const r = roleName.toLowerCase();
    if (r.includes('housekeeping')) return <HousekeepingDashboard dash={dash} comp={comp} />;
    if (r.includes('receptionist') || r.includes('staff')) return <ReceptionistDashboard dash={dash} />;
    return <AdminDashboard dash={dash} comp={comp} legacyStats={legacyStats} />;
  };

  if (loading && !snapshot && !legacyStats) {
    return (
      <div className="dashboard">
        <div className="db-header"><div><h1 className="db-title">Dashboard</h1><p className="db-subtitle">Đang tải...</p></div></div>
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p>Đang tải dữ liệu từ cơ sở dữ liệu...</p>
        </div>
      </div>
    );
  }

  const roleTitle = { admin: 'Quản trị viên', manager: 'Quản lý', receptionist: 'Lễ tân', housekeeping: 'Buồng phòng', staff: 'Nhân viên' };
  const displayRole = roleTitle[roleName.toLowerCase()] ?? roleName;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="db-header">
        <div>
          <h1 className="db-title">Dashboard — {displayRole}</h1>
          <p className="db-subtitle">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <PeriodPicker {...period} onChange={setPeriod} />
          {timeStr && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cập nhật lúc {timeStr}</span>}
          <button onClick={fetchData} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)',
              cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Làm mới
          </button>
          <div className="db-live"><span className="live-dot" /><span>Live Data</span></div>
        </div>
      </div>

      {/* Version info from snapshot */}
      {snapshot && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', gap: 16 }}>
          <span>Kỳ: <strong>{snapshot.periodKey}</strong></span>
          <span>Loại: <strong>{snapshot.periodType}</strong></span>
          <span>Phiên bản: <strong>v{snapshot.version}</strong></span>
          {snapshot.updatedAt && <span>Snapshot lúc: <strong>{new Date(snapshot.updatedAt).toLocaleString('vi-VN')}</strong></span>}
        </div>
      )}

      {renderDashboard()}
    </div>
  );
}
