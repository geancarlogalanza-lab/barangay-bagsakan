import { CLOSED_STATUSES, EXPIRING_SOON_HOURS } from './constants';

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-PH', {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

function toDate(value) {
  if (!value) return null;
  // Plain dates (YYYY-MM-DD) are local calendar days, not UTC midnight
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value) {
  const d = toDate(value);
  return d ? dateFormat.format(d) : '—';
}

export function formatDateTime(value) {
  const d = toDate(value);
  return d ? dateTimeFormat.format(d) : '—';
}

export function formatQuantity(quantity, unit) {
  if (quantity === null || quantity === undefined) return '—';
  const n = Number(quantity);
  const text = Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.?0+$/, '');
  return `${text} ${unit || ''}`.trim();
}

export function relativeTime(value) {
  const d = toDate(value);
  if (!d) return '';
  const diffMinutes = Math.round((d.getTime() - Date.now()) / 60000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const abs = Math.abs(diffMinutes);
  if (abs < 60) return rtf.format(diffMinutes, 'minute');
  if (abs < 60 * 24) return rtf.format(Math.round(diffMinutes / 60), 'hour');
  return rtf.format(Math.round(diffMinutes / (60 * 24)), 'day');
}

// 'expired' when past the expiration time and still open, 'soon' when close to it
export function expiryState(donation) {
  if (CLOSED_STATUSES.includes(donation.status)) return null;
  const expires = toDate(donation.expires_at);
  if (!expires) return null;
  const hoursLeft = (expires.getTime() - Date.now()) / 3600000;
  if (hoursLeft < 0) return 'expired';
  if (hoursLeft <= EXPIRING_SOON_HOURS) return 'soon';
  return null;
}

export function donorName(donation) {
  const donor = donation.donors;
  if (!donor) return 'Unknown donor';
  return donor.organization ? `${donor.name} (${donor.organization})` : donor.name;
}

export function categoryLabel(donation) {
  if (!donation.category) return 'Uncategorized';
  return donation.category === 'Other' && donation.category_other
    ? `Other: ${donation.category_other}`
    : donation.category;
}

export function toDateInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toDateTimeInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${toDateInputValue(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
