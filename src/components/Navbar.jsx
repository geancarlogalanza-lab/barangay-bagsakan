import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const allLinks = [
    { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'donor', 'volunteer'] },
    { to: '/beneficiaries', label: 'Beneficiaries', roles: ['admin'] },
    { to: '/matching', label: 'Matching', roles: ['admin'] },
    { to: '/qr', label: 'QR Codes', roles: ['admin'] },
    { to: '/verify', label: 'Verify', roles: ['admin', 'volunteer'] },
  ];

  const visibleLinks = allLinks.filter(link => link.roles.includes(role));

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
          {role || 'guest'}
        </span>
      </div>
      <div className="navbar-links">
        {visibleLinks.map(link => (
          <Link 
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
        {user && (
          <button
            onClick={signOut}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'white';
              e.target.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'rgba(255,255,255,0.7)';
              e.target.style.background = 'transparent';
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;