export function formatPrice(value, locale = 'vi-VN', currency = 'VND') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
