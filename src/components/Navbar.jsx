import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/beneficiaries', label: 'Beneficiaries' },
    { to: '/matching', label: 'Matching' },
    { to: '/qr', label: 'QR Codes' },
    { to: '/verify', label: 'Verify' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🍽️ Barangay Bagsakan
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