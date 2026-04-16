import { useState, useEffect, useCallback } from 'react';
import {
  History, RefreshCw, Filter, ChevronDown, ChevronRight,
  Shield, User, Search, Info
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import CustomSelect from '../../components/Common/CustomSelect';
import './AuditLogPage.css';

const ACTION_COLORS = {
  CREATE: { bg: '#dcfce7', color: '#15803d', label: 'Tạo mới' },
  UPDATE: { bg: '#dbeafe', color: '#1d4ed8', label: 'Cập nhật' },
  DELETE: { bg: '#fee2e2', color: '#dc2626', label: 'Xóa' },
};

const TABLE_ICONS = {
  Rooms: '🛏️', Bookings: '📋', Users: '👤', Vouchers: '🎫',
  Articles: '📰', Inventory: '📦', Housekeeping: '🧹',
};

function ActionBadge({ action }) {
  const cfg = ACTION_COLORS[action?.toUpperCase()] ?? { bg: '#f1f5f9', color: '#334155', label: action };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label || action}</span>
  );
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = log.oldValue || log.newValue;

  return (
    <div className="log-row">
      <div className="log-row-main" onClick={() => hasDetails && setExpanded(e => !e)}>
        <div className="log-time">
          {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : '—'}
        </div>
        <div className="log-user">
          <div className="log-avatar"><User size={13} /></div>
          <span>{log.userName || `User #${log.userId}` || 'Hệ thống'}</span>
        </div>
        <div><ActionBadge action={log.action} /></div>
        <div className="log-table">
          <span>{TABLE_ICONS[log.tableName] || '📂'} {log.tableName}</span>
          <span className="log-record-id">#{log.recordId}</span>
        </div>
        {hasDetails && (
          <button className="log-expand-btn">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>
      {expanded && hasDetails && (
        <div className="log-detail-box">
          {log.oldValue && (
            <div className="log-detail-section">
              <div className="log-detail-label">Giá trị cũ</div>
              <pre className="log-json log-json-old">{tryFormatJson(log.oldValue)}</pre>
            </div>
          )}
          {log.newValue && (
            <div className="log-detail-section">
              <div className="log-detail-label">Giá trị mới</div>
              <pre className="log-json log-json-new">{tryFormatJson(log.newValue)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function tryFormatJson(str) {
  try { return JSON.stringify(JSON.parse(str), null, 2); } catch { return str; }
}

export default function AuditLogPage() {
  const { user } = useAuth();
  const isAdmin = user?.roleName === 'Admin';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [search, setSearch] = useState('');
  const [tables, setTables] = useState([]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterAction) params.action = filterAction;
      if (filterTable) params.tableName = filterTable;
      const res = await axiosClient.get('/AuditLogs', { params });
      const data = Array.isArray(res.data) ? res.data : [];
      setLogs(data);
      // Extract distinct table names for filter
      const uniqueTables = [...new Set(data.map(l => l.tableName).filter(Boolean))];
      setTables(uniqueTables);
    } catch (err) {
      console.error('Lỗi tải nhật ký:', err);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterTable]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(l =>
    !search ||
    (l.userName || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.tableName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(l.recordId).includes(search)
  );

  return (
    <div className="auditlog-page">
      {/* Header */}
      <div className="auditlog-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={26} /> Nhật ký hệ thống
          </h1>
          <p className="page-subtitle">
            {isAdmin ? (
              <><Shield size={13} style={{ marginRight: 4 }} />Admin — xem tất cả nhật ký hoạt động</>
            ) : (
              <><User size={13} style={{ marginRight: 4 }} />Chỉ hiển thị nhật ký của bạn</>
            )}
          </p>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="fd-refresh-btn">
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="auditlog-filters">
        <div className="search-wrap" style={{ flex: 2 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Tìm theo người dùng, module, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: 180 }}>
          <CustomSelect 
            value={filterAction} 
            onChange={val => setFilterAction(val)} 
            placeholder="Tất cả hành động"
            options={[
              { value: '', label: 'Tất cả hành động' },
              { value: 'CREATE', label: 'Tạo mới' },
              { value: 'UPDATE', label: 'Cập nhật' },
              { value: 'DELETE', label: 'Xóa' }
            ]}
          />
        </div>
        {isAdmin && (
          <div style={{ width: 180 }}>
            <CustomSelect 
              value={filterTable} 
              onChange={val => setFilterTable(val)} 
              placeholder="Tất cả module"
              options={[
                { value: '', label: 'Tất cả module' },
                ...tables.map(t => ({ value: t, label: t }))
              ]}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="auditlog-stats">
        {Object.entries(ACTION_COLORS).map(([action, cfg]) => {
          const cnt = logs.filter(l => l.action?.toUpperCase() === action).length;
          return (
            <div key={action} className="auditlog-stat-card" style={{ borderLeft: `4px solid ${cfg.color}` }}>
              <div className="stat-value" style={{ color: cfg.color }}>{cnt}</div>
              <div className="stat-label">{cfg.label}</div>
            </div>
          );
        })}
        <div className="auditlog-stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="stat-value" style={{ color: '#6366f1' }}>{logs.length}</div>
          <div className="stat-label">Tổng nhật ký</div>
        </div>
      </div>

      {/* Log Timeline */}
      {loading ? (
        <div className="fd-loading">
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Đang tải nhật ký...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="fd-empty">
          <Info size={48} style={{ opacity: 0.3 }} />
          <p>Không có nhật ký nào{search ? ' phù hợp' : ''}</p>
        </div>
      ) : (
        <div className="log-timeline">
          <div className="log-timeline-header">
            <span>Thời gian</span>
            <span>Người dùng</span>
            <span>Hành động</span>
            <span>Module / ID</span>
            <span></span>
          </div>
          {filtered.map(log => (
            <LogRow key={log.id} log={log} />
          ))}
          <div className="table-footer">Hiển thị {filtered.length} / {logs.length} nhật ký (tối đa 500)</div>
        </div>
      )}
    </div>
  );
}
