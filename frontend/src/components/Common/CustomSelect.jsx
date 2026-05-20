import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

function getDropdownStyle(rect) {
  if (!rect) return {};

  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.bottom - 12;
  const spaceAbove = rect.top - 12;
  const shouldOpenUpwards = spaceBelow < 240 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(160, Math.min(280, shouldOpenUpwards ? spaceAbove : spaceBelow));

  return {
    position: 'fixed',
    left: rect.left,
    width: rect.width,
    top: shouldOpenUpwards ? undefined : rect.bottom + 4,
    bottom: shouldOpenUpwards ? viewportHeight - rect.top + 4 : undefined,
    zIndex: 5000,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.16)',
    maxHeight,
    overflowY: 'auto',
  };
}

export default function CustomSelect({ value, onChange, options, placeholder, icon, disabled, className }) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const boxRef = useRef(null);
  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value]
  );

  useLayoutEffect(() => {
    if (!open || !boxRef.current) return;

    const updatePosition = () => {
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDropdownStyle(getDropdownStyle(rect));
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const dropdown = open && !disabled ? createPortal(
    <div className="custom-select-dropdown" style={dropdownStyle}>
      {options.length === 0 ? (
        <div style={{ padding: '8px 12px', color: '#888', fontSize: '0.9rem' }}>Khong co du lieu</div>
      ) : options.map((option) => (
        <div
          key={option.value}
          className="custom-select-option"
          style={{
            padding: '10px 12px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderBottom: '1px solid #f8fafc',
            background: String(option.value) === String(value) ? '#eff6ff' : '#fff',
            color: String(option.value) === String(value) ? '#2563eb' : '#333',
            fontWeight: String(option.value) === String(value) ? 600 : 400,
          }}
          onClick={() => {
            onChange(option.value);
            setOpen(false);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {option.label}
          </div>
        </div>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        ref={containerRef}
        className={`custom-select-wrapper ${className || ''}`}
        style={{ position: 'relative', width: '100%', zIndex: open ? 1000 : 1 }}
      >
        <div
          ref={boxRef}
          className={`form-input custom-select-box ${disabled ? 'disabled' : ''} ${open ? 'open' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: 'inherit',
            color: 'inherit',
          }}
          onClick={() => !disabled && setOpen((prev) => !prev)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: selectedOption ? 'inherit' : '#888', flex: 1, overflow: 'hidden' }}>
            {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', opacity: 0.5, marginLeft: 8 }} />
        </div>
      </div>
      {dropdown}
    </>
  );
}
