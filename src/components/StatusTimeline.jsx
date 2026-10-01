import StatusBadge from './StatusBadge';
import { formatDateTime } from '../lib/format';

function StatusTimeline({ entries }) {
  if (entries.length === 0) {
    return <p className="muted">No status changes recorded yet.</p>;
  }

  return (
    <ol className="timeline">
      {entries.map((entry) => (
        <li key={entry.id} className={`timeline__item timeline__item--${entry.to_status}`}>
          <span className="timeline__dot" aria-hidden="true" />
          <div className="timeline__content">
            <div className="timeline__head">
              <StatusBadge status={entry.to_status} size="sm" />
              <time dateTime={entry.changed_at}>{formatDateTime(entry.changed_at)}</time>
            </div>
            <p className="timeline__by">
              {entry.from_status
                ? `Updated by ${entry.users?.full_name || 'an admin'}`
                : entry.users?.full_name
                  ? `Submitted by ${entry.users.full_name}`
                  : 'Recorded by the system'}
            </p>
            {entry.note && <p className="timeline__note">{entry.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default StatusTimeline;
