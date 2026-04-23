import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder, icon, disabled, className }) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(o => String(o.value) === String(value));

  return (
    <div className={`custom-select-wrapper ${className || ''}`} 
         style={{ position: 'relative', width: '100%' }}
         onMouseLeave={() => setOpen(false)}>
      <div 
        className={`form-input custom-select-box ${disabled ? 'disabled' : ''} ${open ? 'open' : ''}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={() => !disabled && setOpen(!open)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: selectedOption ? '#333' : '#888', flex: 1, overflow: 'hidden' }}>
          {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
          <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', opacity: 0.5, marginLeft: 8 }} />
      </div>
      {open && !disabled && (
        <div className="custom-select-dropdown" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 100,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxHeight: 250, overflowY: 'auto'
        }}>
          {options.length === 0 ? (
           <div style={{ padding: '8px 12px', color: '#888', fontSize: '0.9rem' }}>Không có dữ liệu</div>
          ) : options.map(opt => (
            <div key={opt.value} className="custom-select-option" style={{
              padding: '10px 12px', fontSize: '0.9rem', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
              background: String(opt.value) === String(value) ? '#eff6ff' : '#fff',
              color: String(opt.value) === String(value) ? '#2563eb' : '#333',
              fontWeight: String(opt.value) === String(value) ? 600 : 400
            }}
            onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {opt.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
