import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { EmptyState, Loading } from '../components/States';
import { friendlyError, listUsers } from '../lib/api';
import { useDonations } from '../lib/useDonations';
import { useFilters } from '../lib/useFilters';
import { ROLES } from '../lib/constants';
import { formatDate } from '../lib/format';
import Icon from '../components/Icon';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const { donations } = useDonations();
  const { values, setFilter, clearFilters } = useFilters(['q', 'role']);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listUsers()
      .then((rows) => { if (!cancelled) setUsers(rows); })
      .catch((err) => {
        console.error('Error loading users:', err);
        if (!cancelled) setError(friendlyError(err));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const donationCounts = donations.reduce((acc, d) => {
    acc[d.donor_id] = (acc[d.donor_id] || 0) + 1;
    return acc;
  }, {});

  const query = values.q.trim().toLowerCase();
  const visible = users.filter((u) => {
    if (values.role && u.role !== values.role) return false;
    if (!query) return true;
    return [u.full_name, u.email, u.organization, u.contact_number]
      .filter(Boolean).join(' ').toLowerCase().includes(query);
  });

  const roleCount = (role, singular, plural) => {
    const n = users.filter((u) => u.role === role).length;
    return `${n} ${n === 1 ? singular : plural}`;
  };

  return (
    <div className="page">
      <PageHeader
        title="Users"
        description={`Everyone registered in the system: ${roleCount('donor', 'donor', 'donors')} and ${roleCount('admin', 'admin', 'admins')}.`}
      />

      {error && (
        <Alert
          tone="error"
          title="Users didn’t load"
          action={<button type="button" className="button button--ghost button--small" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Loading label="Loading users…" />
      ) : !error && (
        <>
          <div className="filter-bar" role="search">
            <label className="filter-bar__search">
              <span className="visually-hidden">Search users</span>
              <Icon name="search" size={18} />
              <input
                type="search"
                placeholder="Search name, email or organization"
                value={values.q}
                onChange={(e) => setFilter('q', e.target.value)}
              />
            </label>
            <label className="filter">
              <span className="filter__label">Account type</span>
              <select value={values.role} onChange={(e) => setFilter('role', e.target.value)}>
                <option value="">Donors and admins</option>
                <option value="donor">Donors</option>
                <option value="admin">Admins</option>
              </select>
            </label>
            {(values.q || values.role) && (
              <button type="button" className="button button--ghost button--small filter-bar__clear" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <EmptyState icon="users" title="No users match">Try a different search.</EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <caption className="visually-hidden">Registered users</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Account</th>
                    <th scope="col">Email</th>
                    <th scope="col">Mobile</th>
                    <th scope="col">Donations</th>
                    <th scope="col">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((u) => (
                    <tr key={u.id}>
                      <td data-label="Name">
                        <div>
                          <span className="cell-strong">{u.full_name || '—'}</span>
                          {u.organization && <span className="cell-sub">{u.organization}</span>}
                        </div>
                      </td>
                      <td data-label="Account">
                        <span className={`role-badge role-badge--${u.role}`}>{ROLES[u.role] || u.role}</span>
                      </td>
                      <td data-label="Email"><a href={`mailto:${u.email}`}>{u.email}</a></td>
                      <td data-label="Mobile">{u.contact_number || '—'}</td>
                      <td data-label="Donations">{u.role === 'donor' ? donationCounts[u.id] || 0 : '—'}</td>
                      <td data-label="Joined">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Users;
