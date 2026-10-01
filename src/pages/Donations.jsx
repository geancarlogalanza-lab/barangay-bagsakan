import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import FilterBar from '../components/FilterBar';
import DonationTable from '../components/DonationTable';
import Alert from '../components/Alert';
import Icon from '../components/Icon';
import { EmptyState, Loading } from '../components/States';
import { filterDonations, useDonations } from '../lib/useDonations';
import { useFilters } from '../lib/useFilters';

function Donations() {
  const { isAdmin } = useAuth();
  const { donations, loading, error, reload } = useDonations();
  const { values, setFilter, clearFilters } = useFilters(['q', 'status', 'category', 'barangay']);
  const visible = filterDonations(donations, values);

  const reportButton = !isAdmin && (
    <Link to="/donations/new" className="button button--primary">
      <Icon name="plus" size={18} />
      Report a donation
    </Link>
  );

  return (
    <div className="page">
      <PageHeader
        title={isAdmin ? 'Donations' : 'My donations'}
        description={isAdmin
          ? 'Every donation reported to the barangay. Open one to review it or update its status.'
          : 'Everything you’ve reported and where each donation is now.'}
        actions={reportButton}
      />

      {error && (
        <Alert
          tone="error"
          title="Donations didn’t load"
          action={<button type="button" className="button button--ghost button--small" onClick={reload}>Try again</button>}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Loading label="Loading donations…" />
      ) : !error && donations.length === 0 ? (
        <EmptyState
          title={isAdmin ? 'No donations reported yet' : 'You haven’t reported a donation yet'}
          action={reportButton}
        >
          {isAdmin
            ? 'Donations appear here as soon as donors report them.'
            : 'Report surplus food and follow it until it reaches a family.'}
        </EmptyState>
      ) : !error && (
        <>
          <FilterBar values={values} onChange={setFilter} onClear={clearFilters} showBarangay={isAdmin} />
          <p className="result-count" aria-live="polite">
            Showing {visible.length} of {donations.length} {donations.length === 1 ? 'donation' : 'donations'}
          </p>
          {visible.length === 0 ? (
            <EmptyState icon="search" title="No donations match these filters">
              Try a different search, or clear the filters.
            </EmptyState>
          ) : (
            <DonationTable donations={visible} showDonor={isAdmin} caption="Donations" />
          )}
        </>
      )}
    </div>
  );
}

export default Donations;
