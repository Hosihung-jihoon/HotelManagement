import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * TrendBadge — hiển thị badge xu hướng so sánh kỳ.
 * Props:
 *   growthRate   : number (%)
 *   trend        : "UP" | "DOWN" | "STABLE"
 *   directionMeaning : "Positive" | "Negative"
 *   badgeColor   : "green" | "red" | "gray" (từ backend, ưu tiên hơn)
 */
export default function TrendBadge({ growthRate = 0, trend = 'STABLE', directionMeaning = 'Positive', badgeColor }) {
  const color = badgeColor ?? computeColor(trend, directionMeaning);
  const Icon  = trend === 'UP' ? TrendingUp : trend === 'DOWN' ? TrendingDown : Minus;

  const styles = {
    green : { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' },
    red   : { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
    gray  : { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' },
  };

  const s = styles[color] ?? styles.gray;
  const sign = trend === 'UP' ? '+' : '';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
      ...s
    }}>
      <Icon size={12} strokeWidth={2.5} />
      {sign}{Number(growthRate).toFixed(1)}%
    </span>
  );
}

function computeColor(trend, directionMeaning) {
  if (trend === 'STABLE') return 'gray';
  if (trend === 'UP') return directionMeaning === 'Positive' ? 'green' : 'red';
  return directionMeaning === 'Positive' ? 'red' : 'green';
}
