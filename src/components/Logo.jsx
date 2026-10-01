import { Link } from 'react-router-dom';

// Wordmark: a small kraft tag beside the name
function Logo({ to = '/', tone = 'light' }) {
  return (
    <Link to={to} className={`logo logo--${tone}`}>
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 4h14l8 8v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="#E9D9B4" />
        <circle cx="11" cy="10" r="2.2" fill="#24391F" />
        <path d="M9 18h14M9 22h9" stroke="#24391F" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="logo__text">Bagsakan</span>
    </Link>
  );
}

export default Logo;
