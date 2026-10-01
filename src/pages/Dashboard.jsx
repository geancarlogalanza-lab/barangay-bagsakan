import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatusPipeline from '../components/StatusPipeline';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import Icon from '../components/Icon';
import { EmptyState, Loading } from '../components/States';
import { useDonations } from '../lib/useDonations';
import { listRecentActivity } from '../lib/api';
import { STATUSES } from '../lib/constants';
import { expiryState, formatDate, formatQuantity, relativeTime } from '../lib/format';

function countByStatus(donations) {
  return donations.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
}

function DonationRow({ donation, meta }) {
  return (
    <li>
      <Link to={`/donations/${donation.id}`} className="list-row">
        <span className="list-row__main">
          <span className="cell-strong">{donation.food_type}</span>
          <span className="cell-sub cell-sub--pair">
            <span className="ref">{donation.reference_no}</span>
            <span>{formatQuantity(donation.quantity, donation.unit)}</span>
          </span>
        </span>
        <span className="list-row__meta">{meta}</span>
        <Icon name="chevron" size={16} className="list-row__chevron" />
      </Link>
    </li>
  );
}

function AdminPanels({ donations }) {
  const [activity, setActivity] = useState([]);
  const [activityError, setActivityError] = useState('');

  useEffect(() => {
    listRecentActivity(8)
      .then(setActivity)
      .catch((err) => {
        console.error('Error loading activity:', err);
        setActivityError('Recent activity didn’t load.');
      });
  }, []);

  const pending = donations
    .filter((d) => d.status === 'pending')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const expiring = donations
    .filter((d) => d.status !== 'pending' && expiryState(d))
    .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));

  // Expiry outranks "awaiting review": spoiled food needs a decision first
  const expiryNote = (d) => {
    const state = expiryState(d);
    if (state === 'expired') return 'Past expiry';
    if (state === 'soon') return `Expires ${relativeTime(d.expires_at)}`;
    return null;
  };

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2 className="card__title">Needs attention</h2>
        {pending.length === 0 && expiring.length === 0 ? (
          <p className="muted">Nothing waiting. New donations will show up here for review.</p>
        ) : (
          <ul className="list">
            {pending.slice(0, 5).map((d) => (
              <DonationRow
                key={d.id}
                donation={d}
                meta={expiryNote(d)
                  ? <span className="tag-note tag-note--warning">{expiryNote(d)}, awaiting review</span>
                  : <span className="tag-note">Awaiting review, reported {relativeTime(d.created_at)}</span>}
              />
            ))}
            {expiring.slice(0, 5).map((d) => (
              <DonationRow
                key={d.id}
                donation={d}
                meta={<span className="tag-note tag-note--warning">{expiryNote(d)}</span>}
              />
            ))}
          </ul>
        )}
        {pending.length > 5 && (
          <Link to="/donations?status=pending" className="card__more">See all {pending.length} pending donations</Link>
        )}
      </section>

      <section className="card">
        <h2 className="card__title">Recent activity</h2>
        {activityError && <p className="muted">{activityError}</p>}
        {!activityError && activity.length === 0 && <p className="muted">No status changes yet.</p>}
        <ul className="activity">
          {activity.map((entry) => (
            <li key={entry.id}>
              <Link to={`/donations/${entry.donation_id}`} className="activity__item">
                <StatusBadge status={entry.to_status} size="sm" />
                <span className="activity__text">
                  <span className="cell-strong">{entry.donations?.food_type || 'Donation'}</span>{' '}
                  {entry.from_status
                    ? `moved from ${STATUSES[entry.from_status]?.label || entry.from_status}`
                    : entry.users ? 'reported' : 'imported from the old system'}
                  {entry.users?.full_name && <> by {entry.users.full_name}</>}
                </span>
                <time className="activity__time" dateTime={entry.changed_at}>{relativeTime(entry.changed_at)}</time>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DonorPanels({ donations }) {
  const recent = donations.slice(0, 6);
  return (
    <section className="card">
      <h2 className="card__title">Your recent donations</h2>
      <ul className="list">
        {recent.map((d) => (
          <DonationRow
            key={d.id}
            donation={d}
            meta={<><StatusBadge status={d.status} size="sm" /><span className="cell-sub">Best before {formatDate(d.expires_at)}</span></>}
          />
        ))}
      </ul>
      {donations.length > recent.length && (
        <Link to="/donations" className="card__more">See all {donations.length} donations</Link>
      )}
    </section>
  );
}

function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const { donations, loading, error, reload } = useDonations();
  const firstName = profile?.full_name?.split(' ')[0];

  const reportButton = !isAdmin && (
    <Link to="/donations/new" className="button button--primary">
      <Icon name="plus" size={18} />
      Report a donation
    </Link>
  );

  return (
    <div className="page">
      <PageHeader
        title={firstName ? `Hello, ${firstName}` : 'Dashboard'}
        description={isAdmin
          ? 'Where every donation in the barangay stands right now.'
          : 'Where each of your donations is right now.'}
        actions={reportButton}
      />

      {error && (
        <Alert
          tone="error"
          title="Dashboard didn’t load"
          action={<button type="button" className="button button--ghost button--small" onClick={reload}>Try again</button>}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Loading label="Loading dashboard…" />
      ) : !error && (
        <>
          <StatusPipeline counts={countByStatus(donations)} />
          {donations.length === 0 ? (
            <EmptyState
              title={isAdmin ? 'No donations reported yet' : 'Report your first donation'}
              action={reportButton}
            >
              {isAdmin
                ? 'When donors report surplus food, it shows up here for review.'
                : 'Tell the barangay what food you can give, and follow it until it reaches a family.'}
            </EmptyState>
          ) : isAdmin ? (
            <AdminPanels donations={donations} />
          ) : (
            <DonorPanels donations={donations} />
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
