import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/beneficiaries', label: 'Beneficiaries' },
    { to: '/matching', label: 'Matching' },
    { to: '/qr', label: 'QR Codes' },
    { to: '/verify', label: 'Verify' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🍽️ Barangay Bagsakan
        <span style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '2px 10px',
          borderRadius: '12px',
          fontSize: '0.6rem',
          fontWeight: '500'
        }}>
          v1.0
        </span>
      </div>
      <div className="navbar-links">
        {links.map(link => (
          <Link 
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;