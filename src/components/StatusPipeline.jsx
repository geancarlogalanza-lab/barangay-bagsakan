import { Link } from 'react-router-dom';
import Icon from './Icon';
import { PIPELINE, STATUSES, STATUS_ICONS } from '../lib/constants';

// The donation workflow drawn as it actually runs: four stages in a row,
// with Rejected and Expired branching off. Each stage links to a filtered list.
function StatusPipeline({ counts }) {
  const stage = (status) => (
    <Link to={`/donations?status=${status}`} className={`pipeline__stage pipeline__stage--${status}`}>
      <span className="pipeline__icon"><Icon name={STATUS_ICONS[status]} size={18} /></span>
      <span className="pipeline__count">{counts[status] || 0}</span>
      <span className="pipeline__label">{STATUSES[status].label}</span>
    </Link>
  );

  return (
    <section className="pipeline" aria-label="Donations by status">
      <ol className="pipeline__flow">
        {PIPELINE.map((status) => (
          <li key={status}>{stage(status)}</li>
        ))}
      </ol>
      <div className="pipeline__branch">
        <p className="pipeline__branch-label">Closed without distribution</p>
        <ul>
          <li>{stage('rejected')}</li>
          <li>{stage('expired')}</li>
        </ul>
      </div>
    </section>
  );
}

export default StatusPipeline;
