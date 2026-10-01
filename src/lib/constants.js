// Donation statuses, in workflow order. `next` lists the statuses an admin can
// move a donation to; the database enforces the same rules (see migration).
export const STATUSES = {
  pending: {
    label: 'Pending',
    description: 'Submitted by the donor and waiting for an admin to review it.',
    next: ['accepted', 'rejected', 'expired'],
  },
  accepted: {
    label: 'Accepted',
    description: 'Checked by an admin and approved for collection.',
    next: ['to_be_delivered', 'rejected', 'expired'],
  },
  to_be_delivered: {
    label: 'To Be Delivered',
    description: 'Scheduled for pickup or on its way to the barangay.',
    next: ['distributed', 'rejected', 'expired'],
  },
  distributed: {
    label: 'Distributed',
    description: 'Handed out to families. This donation is complete.',
    next: [],
  },
  rejected: {
    label: 'Rejected',
    description: 'Not accepted, for example because the goods were spoiled or expired.',
    next: [],
  },
  expired: {
    label: 'Expired',
    description: 'Passed its expiration date before it could be distributed.',
    next: [],
  },
};

export const STATUS_ICONS = {
  pending: 'clock',
  accepted: 'check',
  to_be_delivered: 'truck',
  distributed: 'handoff',
  rejected: 'rejected',
  expired: 'expired',
};

export const STATUS_ORDER =['pending', 'accepted', 'to_be_delivered', 'distributed', 'rejected', 'expired'];
export const PIPELINE = ['pending', 'accepted', 'to_be_delivered', 'distributed'];
export const CLOSED_STATUSES = ['distributed', 'rejected', 'expired'];

// Verb used on the button that moves a donation into each status
export const STATUS_ACTIONS = {
  accepted: 'Accept',
  to_be_delivered: 'Schedule delivery',
  distributed: 'Mark as distributed',
  rejected: 'Reject',
  expired: 'Mark as expired',
};

// A note is required for these so the report explains why
export const NOTE_REQUIRED = ['rejected'];

export const CATEGORIES = [
  'Cooked Meals',
  'Fruits & Vegetables',
  'Bread & Pastries',
  'Rice & Grains',
  'Canned & Packaged Goods',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Other',
];

export const UNITS = ['kg', 'g', 'pcs', 'packs', 'servings', 'liters'];

export const ROLES = {
  donor: 'Donor',
  admin: 'Admin',
};

// Barangays of Pasig City. Edit this list if the project serves a different city.
export const DEFAULT_CITY = 'Pasig City';
export const BARANGAYS = [
  'Bagong Ilog', 'Bagong Katipunan', 'Bambang', 'Buting', 'Caniogan', 'Dela Paz',
  'Kalawaan', 'Kapasigan', 'Kapitolyo', 'Malinao', 'Manggahan', 'Maybunga',
  'Oranbo', 'Palatiw', 'Pinagbuhatan', 'Pineda', 'Rosario', 'Sagad',
  'San Antonio', 'San Joaquin', 'San Jose', 'San Miguel', 'San Nicolas',
  'Santa Cruz', 'Santa Lucia', 'Santa Rosa', 'Santo Tomas', 'Santolan',
  'Sumilang', 'Ugong',
];

export const PHOTO_BUCKET = 'donation-photos';
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Donations expiring within this many hours are flagged on the dashboard
export const EXPIRING_SOON_HOURS = 24;
