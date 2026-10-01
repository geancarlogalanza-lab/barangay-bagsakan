import { BARANGAYS, CATEGORIES, PHOTO_MAX_BYTES, PHOTO_TYPES, UNITS } from './constants';

// Each validator returns an error message, or '' when the value is valid.
// Messages say what is wrong and how to fix it.

const NAME_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PH_MOBILE_PATTERN = /^(09\d{9}|\+639\d{9})$/;

const trim = (value) => (value ?? '').toString().trim();

export function fullName(value) {
  const v = trim(value);
  if (!v) return 'Enter your full name.';
  if (v.length < 2 || v.length > 100) return 'Full name must be 2 to 100 characters long.';
  if (!NAME_PATTERN.test(v)) return 'Use letters, spaces, periods, hyphens and apostrophes only.';
  return '';
}

export function email(value) {
  const v = trim(value);
  if (!v) return 'Enter your email address.';
  if (v.length > 254 || !EMAIL_PATTERN.test(v)) return 'Enter a valid email address, like juan@email.com.';
  return '';
}

export function password(value) {
  if (!value) return 'Create a password.';
  if (value.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Use at least one letter and one number in your password.';
  return '';
}

export function confirmPassword(value, original) {
  if (!value) return 'Re-enter your password.';
  if (value !== original) return 'Passwords do not match.';
  return '';
}

export function contactNumber(value) {
  const v = trim(value).replace(/[\s-]/g, '');
  if (!v) return 'Enter your mobile number so we can coordinate pickup.';
  if (!PH_MOBILE_PATTERN.test(v)) return 'Enter an 11-digit mobile number starting with 09, like 09171234567.';
  return '';
}

export function organization(value) {
  return trim(value).length > 100 ? 'Organization name must be 100 characters or fewer.' : '';
}

export function role(value) {
  return ['donor', 'admin'].includes(value) ? '' : 'Choose whether you are registering as a donor or an admin.';
}

export function agreement(checked) {
  return checked ? '' : 'You need to agree to the privacy notice to continue.';
}

export function category(value) {
  if (!value) return 'Choose a food category.';
  return CATEGORIES.includes(value) ? '' : 'Choose a category from the list.';
}

export function categoryOther(value, selectedCategory) {
  if (selectedCategory !== 'Other') return '';
  const v = trim(value);
  if (!v) return 'Tell us what kind of food this is.';
  return v.length > 50 ? 'Keep the food type to 50 characters or fewer.' : '';
}

export function foodItem(value) {
  const v = trim(value);
  if (!v) return 'Enter the name of the food item.';
  if (v.length < 2 || v.length > 100) return 'Food item must be 2 to 100 characters long.';
  return '';
}

export function description(value) {
  const v = trim(value);
  if (!v) return 'Describe the food’s condition, packaging and storage.';
  if (v.length < 10) return 'Add a little more detail (at least 10 characters).';
  if (v.length > 500) return 'Keep the description to 500 characters or fewer.';
  return '';
}

export function quantity(value) {
  if (value === '' || value === null || value === undefined) return 'Enter the quantity.';
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 'Quantity must be a number greater than zero.';
  if (n > 100000) return 'Quantity looks too large. Check the number and unit.';
  return '';
}

export function unit(value) {
  return UNITS.includes(value) ? '' : 'Choose a unit.';
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function datePrepared(value) {
  const d = parseDate(value);
  if (!value) return 'Enter the date the food was prepared or packed.';
  if (!d) return 'Enter a valid date.';
  if (d > today()) return 'Date prepared cannot be in the future.';
  return '';
}

export function expirationDate(value, prepared) {
  const d = parseDate(value);
  if (!value) return 'Enter the expiration or best-before date.';
  if (!d) return 'Enter a valid date.';
  if (d < today()) return 'This food has already expired. Expired food cannot be donated.';
  const p = parseDate(prepared);
  if (p && d < p) return 'Expiration date must be on or after the date prepared.';
  return '';
}

export function pickupDateTime(value, expiration) {
  if (!value) return 'Choose your preferred pickup date and time.';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Enter a valid date and time.';
  if (d < new Date()) return 'Pickup time must be in the future.';
  const exp = parseDate(expiration);
  if (exp) {
    const endOfExpiry = new Date(exp);
    endOfExpiry.setHours(23, 59, 59, 999);
    if (d > endOfExpiry) return 'Pickup must be on or before the expiration date.';
  }
  return '';
}

export function pickupAddress(value) {
  const v = trim(value);
  if (!v) return 'Enter the pickup address.';
  if (v.length < 10) return 'Enter the full address (house number, street).';
  if (v.length > 200) return 'Keep the address to 200 characters or fewer.';
  return '';
}

export function barangay(value) {
  if (!value) return 'Choose the barangay.';
  return BARANGAYS.includes(value) ? '' : 'Choose a barangay from the list.';
}

export function city(value) {
  const v = trim(value);
  if (!v) return 'Enter the city or municipality.';
  return v.length > 60 ? 'Keep the city name to 60 characters or fewer.' : '';
}

export function landmark(value) {
  return trim(value).length > 100 ? 'Keep the landmark to 100 characters or fewer.' : '';
}

export function photo(file) {
  if (!file) return '';
  if (!PHOTO_TYPES.includes(file.type)) return 'Upload a JPG, PNG or WEBP image.';
  if (file.size > PHOTO_MAX_BYTES) return 'The photo is larger than 5 MB. Choose a smaller image.';
  return '';
}

export function foodSafeConfirmation(checked) {
  return checked ? '' : 'Confirm that the food is safe to eat and not expired.';
}

export function statusNote(value, isRequired) {
  const v = trim(value);
  if (isRequired && !v) return 'Give a reason so the donor understands the decision.';
  return v.length > 300 ? 'Keep the note to 300 characters or fewer.' : '';
}

// Runs a map of { field: () => message } and returns only the failing fields
export function collectErrors(checks) {
  const errors = {};
  for (const [field, check] of Object.entries(checks)) {
    const message = check();
    if (message) errors[field] = message;
  }
  return errors;
}

export const normalizeMobile = (value) => trim(value).replace(/[\s-]/g, '');
