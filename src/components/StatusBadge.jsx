import Icon from './Icon';
import { STATUSES, STATUS_ICONS } from '../lib/constants';

// Each status has its own icon and text, so it never depends on color alone
function StatusBadge({ status, size = 'md' }) {
  const info = STATUSES[status];
  return (
    <span className={`status-badge status-${status} status-badge--${size}`}>
      <Icon name={STATUS_ICONS[status] || 'info'} size={size === 'sm' ? 14 : 16} />
      {info ? info.label : status}
    </span>
  );
}

export default StatusBadge;
