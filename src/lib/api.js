import { supabase } from '../services/supabase';
import { PHOTO_BUCKET } from './constants';

// Row-level security decides what comes back: donors only ever receive their
// own donations, admins receive all of them.

const DONATION_FIELDS = `
  id, reference_no, donor_id, food_type, category, category_other, description,
  quantity, unit, date_prepared, expires_at, preferred_pickup_at,
  pickup_address, barangay, city, landmark, photo_url,
  status, status_note, status_updated_at, created_at,
  donors (name, organization, phone, email)
`;

export async function listDonations() {
  const { data, error } = await supabase
    .from('donations')
    .select(DONATION_FIELDS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getDonation(id) {
  const { data, error } = await supabase
    .from('donations')
    .select(DONATION_FIELDS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getStatusHistory(donationId) {
  const { data, error } = await supabase
    .from('donation_status_history')
    .select('id, from_status, to_status, note, changed_at, users (full_name, role)')
    .eq('donation_id', donationId)
    .order('changed_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listRecentActivity(limit = 8) {
  const { data, error } = await supabase
    .from('donation_status_history')
    .select('id, donation_id, from_status, to_status, note, changed_at, users (full_name), donations (reference_no, food_type)')
    .order('changed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function uploadDonationPhoto(userId, file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function createDonation(donation) {
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select('id, reference_no')
    .single();
  if (error) throw error;
  return data;
}

export async function updateDonationStatus(id, status, note) {
  const { data, error } = await supabase
    .from('donations')
    .update({ status, status_note: note || null })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Only admins can change a donation’s status.');
  }
}

export async function listUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, full_name, contact_number, organization, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Turns Supabase/Postgres errors into messages a user can act on
export function friendlyError(error) {
  const message = error?.message || '';
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Can’t reach the server. Check your internet connection and try again.';
  }
  if (/already registered|already been registered/i.test(message)) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'The email or password is incorrect.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Confirm your email address first. Check your inbox for the confirmation link.';
  }
  if (/row-level security|permission denied/i.test(message)) {
    return 'You don’t have permission to do that.';
  }
  if (/Cannot change status|A reason is required/i.test(message)) {
    return message;
  }
  return message || 'Something went wrong. Please try again.';
}
