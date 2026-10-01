import Icon from './Icon';

const ICONS = { error: 'alert', success: 'check', info: 'info', warning: 'alert' };

function Alert({ tone = 'info', title, children, action }) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={ICONS[tone]} size={20} className="alert__icon" />
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        {children && <div className="alert__text">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export default Alert;
