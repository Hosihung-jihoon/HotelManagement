import { useState } from 'react';

const PERIOD_TYPES = [
  { value: 'Daily',     label: 'Ngày' },
  { value: 'Weekly',    label: 'Tuần' },
  { value: 'Monthly',   label: 'Tháng' },
  { value: 'Quarterly', label: 'Quý' },
  { value: 'Yearly',    label: 'Năm' },
];

/**
 * PeriodPicker — bộ chọn kỳ thời gian.
 * Props:
 *   periodType  : string
 *   periodKey   : string
 *   onChange    : ({ periodType, periodKey }) => void
 */
export default function PeriodPicker({ periodType = 'Monthly', periodKey, onChange }) {
  const now = new Date();

  const buildKey = (type) => {
    switch (type) {
      case 'Daily':     return now.toISOString().split('T')[0];
      case 'Weekly':    return getIsoWeekKey(now);
      case 'Monthly':   return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      case 'Quarterly': return `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
      case 'Yearly':    return String(now.getFullYear());
      default:          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
  };

  const handleTypeChange = (type) => {
    onChange({ periodType: type, periodKey: buildKey(type) });
  };

  // Render tuỳ chỉnh key theo periodType
  const renderKeySelector = () => {
    switch (periodType) {
      case 'Monthly':
        return (
          <input
            type="month"
            value={periodKey ?? buildKey('Monthly')}
            onChange={e => onChange({ periodType, periodKey: e.target.value })}
            style={inputStyle}
          />
        );
      case 'Yearly':
        return (
          <select
            value={periodKey ?? buildKey('Yearly')}
            onChange={e => onChange({ periodType, periodKey: e.target.value })}
            style={inputStyle}
          >
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        );
      case 'Daily':
        return (
          <input
            type="date"
            value={periodKey ?? buildKey('Daily')}
            onChange={e => onChange({ periodType, periodKey: e.target.value })}
            style={inputStyle}
          />
        );
      default:
        return (
          <span style={{ fontSize: '0.82rem', color: '#64748b', padding: '0 8px' }}>
            {periodKey ?? buildKey(periodType)}
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', borderRadius: 8, padding: 2 }}>
        {PERIOD_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleTypeChange(value)}
            style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
              background: periodType === value ? 'white' : 'transparent',
              color: periodType === value ? 'var(--primary-color, #2563eb)' : '#64748b',
              boxShadow: periodType === value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Key selector */}
      {renderKeySelector()}
    </div>
  );
}

const inputStyle = {
  padding: '5px 10px', borderRadius: 8,
  border: '1px solid #e2e8f0', outline: 'none',
  fontSize: '0.82rem', color: '#1e293b',
};

function getIsoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
