import Icon from './Icon';

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status">
      <span className="loading__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon = 'donations', title, children, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon"><Icon name={icon} size={28} /></span>
      <p className="empty-state__title">{title}</p>
      {children && <p className="empty-state__text">{children}</p>}
      {action}
    </div>
  );
}
