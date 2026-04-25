import styles from './Input.module.css';

/**
 * Minimalist Tray style — bottom border only, transitions to primary on focus
 */
export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={[styles.wrap, error ? styles.hasError : '', className].filter(Boolean).join(' ')}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={styles.input} {...props} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
