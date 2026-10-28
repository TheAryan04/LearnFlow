export const USD_TO_INR = 83;

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatINR(value) {
  return inr.format(Number(value) || 0);
}

export function formatPrice(price) {
  return Number(price) > 0 ? formatINR(price) : 'Free';
}

export function formatINRShort(value) {
  const v = Number(value) || 0;
  if (v >= 1e7) return `₹${+(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${+(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `₹${+(v / 1e3).toFixed(0)}k`;
  return `₹${v}`;
}
