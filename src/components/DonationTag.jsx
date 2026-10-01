import { STATUSES } from '../lib/constants';

// The kraft produce tag: the donation's identity card, with its current
// status pressed on like a rubber stamp. `stamps` lets the landing page show
// a sequence of stamps; elsewhere only the current status is stamped.
function DonationTag({ referenceNo, food, quantity, details = [], status, stamps, className = '' }) {
  const stampList = stamps || (status ? [status] : []);

  return (
    <figure className={`donation-tag ${className}`.trim()} aria-label={`Donation tag ${referenceNo}`}>
      <span className="donation-tag__hole" aria-hidden="true" />
      <p className="donation-tag__ref">{referenceNo}</p>
      <p className="donation-tag__food">{food}</p>
      {quantity && <p className="donation-tag__qty">{quantity}</p>}
      {details.length > 0 && (
        <dl className="donation-tag__details">
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {stampList.map((s, i) => (
        <span
          key={s}
          className={`stamp stamp-${s} stamp--${i}`}
          style={{ '--stamp-index': i }}
        >
          {STATUSES[s]?.label || s}
        </span>
      ))}
    </figure>
  );
}

export default DonationTag;
