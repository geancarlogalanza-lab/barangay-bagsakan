import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import Icon from './Icon';
import { categoryLabel, donorName, expiryState, formatDate, formatQuantity } from '../lib/format';

function ExpiryCell({ donation }) {
  const state = expiryState(donation);
  return (
    <span className={`expiry ${state ? `expiry--${state}` : ''}`}>
      {formatDate(donation.expires_at)}
      {state === 'expired' && <span className="expiry__flag"><Icon name="alert" size={14} />Past expiry</span>}
      {state === 'soon' && <span className="expiry__flag"><Icon name="clock" size={14} />Within 24 h</span>}
    </span>
  );
}

// Table on wide screens; each row becomes a card on phones (see .data-table CSS)
function DonationTable({ donations, showDonor, caption }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">Reference</th>
            <th scope="col">Food</th>
            <th scope="col">Quantity</th>
            {showDonor && <th scope="col">Donor</th>}
            <th scope="col">Barangay</th>
            <th scope="col">Best before</th>
            <th scope="col">Status</th>
            <th scope="col">Reported</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d) => (
            <tr key={d.id}>
              <td data-label="Reference">
                <Link to={`/donations/${d.id}`} className="ref-link">{d.reference_no || 'View'}</Link>
              </td>
              <td data-label="Food">
                <div>
                  <span className="cell-strong">{d.food_type}</span>
                  <span className="cell-sub">{categoryLabel(d)}</span>
                </div>
              </td>
              <td data-label="Quantity">{formatQuantity(d.quantity, d.unit)}</td>
              {showDonor && <td data-label="Donor">{donorName(d)}</td>}
              <td data-label="Barangay">{d.barangay || '—'}</td>
              <td data-label="Best before"><ExpiryCell donation={d} /></td>
              <td data-label="Status"><StatusBadge status={d.status} size="sm" /></td>
              <td data-label="Reported">{formatDate(d.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DonationTable;
