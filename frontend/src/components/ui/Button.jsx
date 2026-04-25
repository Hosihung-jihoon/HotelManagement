import styles from './Button.module.css';

/**
 * variant: 'primary' | 'secondary' | 'tertiary' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, icon, iconRight, className = '',
  as: Tag = 'button', ...props
}) {
  return (
    <Tag
      className={[styles.btn, styles[variant], styles[size], loading ? styles.loading : '', className].filter(Boolean).join(' ')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden />}
      {!loading && icon && <span className={styles.iconL}>{icon}</span>}
      <span>{children}</span>
      {!loading && iconRight && <span className={styles.iconR}>{iconRight}</span>}
    </Tag>
  );
}
