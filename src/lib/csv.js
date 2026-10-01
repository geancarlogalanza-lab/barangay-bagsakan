import { STATUSES } from './constants';
import { categoryLabel } from './format';

const COLUMNS = [
  ['Reference', (d) => d.reference_no],
  ['Reported at', (d) => d.created_at && new Date(d.created_at).toLocaleString('en-PH')],
  ['Donor', (d) => d.donors?.name],
  ['Organization', (d) => d.donors?.organization],
  ['Donor mobile', (d) => d.donors?.phone],
  ['Donor email', (d) => d.donors?.email],
  ['Category', (d) => categoryLabel(d)],
  ['Food item', (d) => d.food_type],
  ['Quantity', (d) => d.quantity],
  ['Unit', (d) => d.unit],
  ['Description', (d) => d.description],
  ['Date prepared', (d) => d.date_prepared],
  ['Best before', (d) => d.expires_at && new Date(d.expires_at).toLocaleDateString('en-PH')],
  ['Pickup address', (d) => d.pickup_address],
  ['Barangay', (d) => d.barangay],
  ['City', (d) => d.city],
  ['Landmark', (d) => d.landmark],
  ['Preferred pickup', (d) => d.preferred_pickup_at && new Date(d.preferred_pickup_at).toLocaleString('en-PH')],
  ['Status', (d) => STATUSES[d.status]?.label || d.status],
  ['Status note', (d) => d.status_note],
  ['Status updated at', (d) => d.status_updated_at && new Date(d.status_updated_at).toLocaleString('en-PH')],
];

function escape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function donationsToCsv(donations) {
  const header = COLUMNS.map(([name]) => escape(name)).join(',');
  const rows = donations.map((d) => COLUMNS.map(([, get]) => escape(get(d))).join(','));
  return [header, ...rows].join('\r\n');
}

export function downloadCsv(filename, csv) {
  // BOM so Excel opens the file as UTF-8 (names with ñ, etc.)
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
