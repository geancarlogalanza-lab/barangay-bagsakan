import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import FilterBar from '../components/FilterBar';
import DonationTable from '../components/DonationTable';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import Icon from '../components/Icon';
import { EmptyState, Loading } from '../components/States';
import { filterDonations, useDonations } from '../lib/useDonations';
import { useFilters } from '../lib/useFilters';
import { donationsToCsv, downloadCsv } from '../lib/csv';
import { STATUS_ORDER } from '../lib/constants';
import { formatDate, formatDateTime, formatQuantity, toDateInputValue } from '../lib/format';

// "12 kg, 4 packs" — totals per unit, since units can't be added together
function quantitiesByUnit(rows) {
  const totals = {};
  rows.forEach((d) => {
    const unit = d.unit || 'units';
    totals[unit] = (totals[unit] || 0) + Number(d.quantity || 0);
  });
  const parts = Object.entries(totals).map(([unit, qty]) => formatQuantity(qty, unit));
  return parts.length ? parts.join(', ') : '—';
}

function groupBy(rows, keyFn) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = keyFn(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

const percent = (part, whole) => (whole ? `${Math.round((part / whole) * 100)}%` : '—');

function averageDaysToDistribute(rows) {
  const done = rows.filter((d) => d.status === 'distributed' && d.status_updated_at);
  if (done.length === 0) return null;
  const totalDays = done.reduce(
    (sum, d) => sum + (new Date(d.status_updated_at) - new Date(d.created_at)) / 86400000,
    0,
  );
  return totalDays / done.length;
}

function Reports() {
  const { profile } = useAuth();
  const { donations, loading, error, reload } = useDonations();
  const { values, setFilter, clearFilters } = useFilters(['q', 'status', 'category', 'barangay', 'from', 'to']);
  const rows = filterDonations(donations, values);

  const count = (status) => rows.filter((d) => d.status === status).length;
  const distributed = count('distributed');
  const closedUnused = count('rejected') + count('expired');
  const avgDays = averageDaysToDistribute(rows);

  const period = values.from || values.to
    ? `${values.from ? formatDate(values.from) : 'the beginning'} to ${values.to ? formatDate(values.to) : 'today'}`
    : 'All dates';

  function exportCsv() {
    const stamp = toDateInputValue(new Date());
    downloadCsv(`bagsakan-donation-report-${stamp}.csv`, donationsToCsv(rows));
  }

  const actions = (
    <div className="button-row">
      <button type="button" className="button button--ghost" onClick={() => window.print()} disabled={rows.length === 0}>
        <Icon name="print" size={18} />
        Print report
      </button>
      <button type="button" className="button button--primary" onClick={exportCsv} disabled={rows.length === 0}>
        <Icon name="download" size={18} />
        Export CSV
      </button>
    </div>
  );

  return (
    <div className="page report">
      <PageHeader
        title="Reports"
        description="Summaries of donation statuses for any period. Print them or export them as a spreadsheet."
        actions={actions}
      />

      {/* Shown only on paper */}
      <div className="print-only report__print-head">
        <p className="report__print-org">Barangay Bagsakan</p>
        <h1>Donation status report</h1>
        <p>Period: {period}. Generated {formatDateTime(new Date())}{profile?.full_name ? ` by ${profile.full_name}` : ''}.</p>
      </div>

      {error && (
        <Alert
          tone="error"
          title="Report data didn’t load"
          action={<button type="button" className="button button--ghost button--small" onClick={reload}>Try again</button>}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Loading label="Preparing report…" />
      ) : !error && (
        <>
          <div className="no-print">
            <FilterBar values={values} onChange={setFilter} onClear={clearFilters} showBarangay showDates />
          </div>

          {rows.length === 0 ? (
            <EmptyState icon="reports" title="No donations in this report">
              {donations.length === 0
                ? 'Reports fill in as donors report donations.'
                : 'No donations match these filters. Widen the dates or clear the filters.'}
            </EmptyState>
          ) : (
            <>
              <section className="report__figures" aria-label="Key figures">
                <div>
                  <p className="figure__value">{rows.length}</p>
                  <p className="figure__label">donations reported</p>
                </div>
                <div>
                  <p className="figure__value">{percent(distributed, rows.length)}</p>
                  <p className="figure__label">reached families ({distributed})</p>
                </div>
                <div>
                  <p className="figure__value">{percent(closedUnused, rows.length)}</p>
                  <p className="figure__label">rejected or expired ({closedUnused})</p>
                </div>
                <div>
                  <p className="figure__value">{avgDays === null ? '—' : `${avgDays.toFixed(1)} days`}</p>
                  <p className="figure__label">average from report to distribution</p>
                </div>
              </section>

              <div className="report__tables">
                <section className="card">
                  <h2 className="card__title">By status</h2>
                  <table className="summary-table">
                    <thead>
                      <tr><th scope="col">Status</th><th scope="col">Donations</th><th scope="col">Share</th><th scope="col">Quantity</th></tr>
                    </thead>
                    <tbody>
                      {STATUS_ORDER.map((status) => {
                        const group = rows.filter((d) => d.status === status);
                        return (
                          <tr key={status}>
                            <td><StatusBadge status={status} size="sm" /></td>
                            <td>{group.length}</td>
                            <td>{percent(group.length, rows.length)}</td>
                            <td>{quantitiesByUnit(group)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>

                <section className="card">
                  <h2 className="card__title">By category</h2>
                  <table className="summary-table">
                    <thead>
                      <tr><th scope="col">Category</th><th scope="col">Donations</th><th scope="col">Distributed</th><th scope="col">Rejected or expired</th></tr>
                    </thead>
                    <tbody>
                      {groupBy(rows, (d) => d.category || 'Uncategorized').map(([name, group]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{group.length}</td>
                          <td>{group.filter((d) => d.status === 'distributed').length}</td>
                          <td>{group.filter((d) => d.status === 'rejected' || d.status === 'expired').length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section className="card">
                  <h2 className="card__title">By barangay</h2>
                  <table className="summary-table">
                    <thead>
                      <tr><th scope="col">Barangay</th><th scope="col">Donations</th><th scope="col">Distributed</th><th scope="col">Quantity</th></tr>
                    </thead>
                    <tbody>
                      {groupBy(rows, (d) => d.barangay || 'Not recorded').map(([name, group]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{group.length}</td>
                          <td>{group.filter((d) => d.status === 'distributed').length}</td>
                          <td>{quantitiesByUnit(group)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              </div>

              <section className="report__list">
                <h2 className="section-title">All donations in this report</h2>
                <DonationTable donations={rows} showDonor caption="Donations in this report" />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Reports;
