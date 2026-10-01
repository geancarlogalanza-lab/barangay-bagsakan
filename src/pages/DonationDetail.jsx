import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import DonationTag from '../components/DonationTag';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import StatusDialog from '../components/StatusDialog';
import Alert from '../components/Alert';
import Icon from '../components/Icon';
import { EmptyState, Loading } from '../components/States';
import { friendlyError, getDonation, getStatusHistory, updateDonationStatus } from '../lib/api';
import { STATUSES, STATUS_ACTIONS } from '../lib/constants';
import {
  categoryLabel, expiryState, formatDate, formatDateTime, formatQuantity,
} from '../lib/format';

function DetailList({ items }) {
  return (
    <dl className="detail-list">
      {items.filter((item) => item.value).map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DonationDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [donation, setDonation] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [dialogStatus, setDialogStatus] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([getDonation(id), getStatusHistory(id)])
      .then(([row, entries]) => {
        if (cancelled) return;
        setDonation(row);
        setHistory(entries);
      })
      .catch((err) => {
        console.error('Error loading donation:', err);
        if (!cancelled) setError(friendlyError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  async function saveStatus(status, note) {
    try {
      await updateDonationStatus(donation.id, status, note);
    } catch (err) {
      console.error('Error updating status:', err);
      throw new Error(friendlyError(err));
    }
    setNotice(`Status changed to ${STATUSES[status].label}.`);
    setReloadKey((k) => k + 1);
  }

  const back = (
    <Link to="/donations" className="back-link">
      <Icon name="back" size={16} />
      {isAdmin ? 'Donations' : 'My donations'}
    </Link>
  );

  if (loading && !donation) {
    return <div className="page"><Loading label="Loading donation…" /></div>;
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader title="Donation" back={back} />
        <Alert
          tone="error"
          title="This donation didn’t load"
          action={<button type="button" className="button button--ghost button--small" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>}
        >
          {error}
        </Alert>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="page">
        <PageHeader title="Donation not found" back={back} />
        <EmptyState icon="search" title="This donation doesn’t exist or isn’t yours">
          Check the link, or open it from your donations list.
        </EmptyState>
      </div>
    );
  }

  const nextStatuses = STATUSES[donation.status].next;
  const expiry = expiryState(donation);
  const donor = donation.donors;

  const actions = isAdmin && nextStatuses.length > 0 && (
    <div className="button-row">
      {nextStatuses.map((status, i) => (
        <button
          key={status}
          type="button"
          className={`button ${
            i === 0 ? 'button--primary' : status === 'rejected' ? 'button--danger-ghost' : 'button--ghost'
          }`}
          onClick={() => setDialogStatus(status)}
        >
          {STATUS_ACTIONS[status]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="page">
      <PageHeader
        back={back}
        title={donation.food_type}
        description={`Reported ${formatDateTime(donation.created_at)}`}
        actions={actions}
      />

      {notice && <Alert tone="success" title={notice} />}

      {expiry === 'expired' && (
        <Alert tone="warning" title="Past its expiration date">
          {isAdmin
            ? 'This donation expired before it was distributed. Mark it as expired to close it.'
            : 'This donation expired before it could be distributed.'}
        </Alert>
      )}
      {expiry === 'soon' && (
        <Alert tone="warning" title="Expires within 24 hours">
          Best before {formatDateTime(donation.expires_at)}.
        </Alert>
      )}

      <div className="detail-layout">
        <div className="detail-layout__main">
          <DonationTag
            referenceNo={donation.reference_no}
            food={donation.food_type}
            quantity={formatQuantity(donation.quantity, donation.unit)}
            details={[
              { label: 'Category', value: categoryLabel(donation) },
              { label: 'Best before', value: formatDate(donation.expires_at) },
            ]}
            status={donation.status}
          />

          <section className="card">
            <h2 className="card__title">Food</h2>
            <DetailList items={[
              { label: 'Description', value: donation.description },
              { label: 'Date prepared', value: donation.date_prepared && formatDate(donation.date_prepared) },
              { label: 'Best before', value: formatDateTime(donation.expires_at) },
            ]} />
            {donation.photo_url && (
              <a href={donation.photo_url} target="_blank" rel="noreferrer" className="detail-photo">
                <img src={donation.photo_url} alt={`Photo of ${donation.food_type} submitted by the donor`} />
              </a>
            )}
          </section>

          <section className="card">
            <h2 className="card__title">Pickup</h2>
            {donation.pickup_address ? (
              <DetailList items={[
                { label: 'Address', value: donation.pickup_address },
                { label: 'Barangay', value: donation.barangay },
                { label: 'City', value: donation.city },
                { label: 'Landmark', value: donation.landmark },
                { label: 'Preferred pickup', value: donation.preferred_pickup_at && formatDateTime(donation.preferred_pickup_at) },
              ]} />
            ) : (
              <p className="muted">No pickup details were recorded for this donation.</p>
            )}
          </section>

          {isAdmin && donor && (
            <section className="card">
              <h2 className="card__title">Donor</h2>
              <DetailList items={[
                { label: 'Name', value: donor.name },
                { label: 'Organization', value: donor.organization },
                { label: 'Mobile', value: donor.phone && <a href={`tel:${donor.phone}`}>{donor.phone}</a> },
                { label: 'Email', value: donor.email && <a href={`mailto:${donor.email}`}>{donor.email}</a> },
              ]} />
            </section>
          )}
        </div>

        <aside className="detail-layout__side">
          <section className="card status-card">
            <h2 className="card__title">Current status</h2>
            <StatusBadge status={donation.status} size="lg" />
            <p className="status-card__text">{STATUSES[donation.status].description}</p>
            {donation.status_note && (
              <p className="status-card__note">
                <span>Note from the admin</span>
                {donation.status_note}
              </p>
            )}
          </section>

          <section className="card">
            <h2 className="card__title">History</h2>
            <StatusTimeline entries={history} />
          </section>
        </aside>
      </div>

      {dialogStatus && (
        <StatusDialog
          donation={donation}
          initialStatus={dialogStatus}
          onClose={() => setDialogStatus(null)}
          onSave={saveStatus}
        />
      )}
    </div>
  );
}

export default DonationDetail;
