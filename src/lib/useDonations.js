import { useCallback, useEffect, useState } from 'react';
import { friendlyError, listDonations } from './api';

// Loads the donations visible to the signed-in user
export function useDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listDonations()
      .then((rows) => {
        if (!cancelled) setDonations(rows);
      })
      .catch((err) => {
        console.error('Error loading donations:', err);
        if (!cancelled) setError(friendlyError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { donations, loading, error, reload };
}

// Applies the shared filter fields used by the Donations and Reports pages
export function filterDonations(donations, filters) {
  const query = (filters.q || '').trim().toLowerCase();
  const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`) : null;

  return donations.filter((d) => {
    if (filters.status && d.status !== filters.status) return false;
    if (filters.category && d.category !== filters.category) return false;
    if (filters.barangay && d.barangay !== filters.barangay) return false;
    const created = new Date(d.created_at);
    if (from && created < from) return false;
    if (to && created > to) return false;
    if (query) {
      const haystack = [d.reference_no, d.food_type, d.category, d.category_other, d.donors?.name, d.donors?.organization, d.barangay]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
