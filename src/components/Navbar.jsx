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
    <nav style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E7E3D4',
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: 800,
        fontSize: '1.3rem',
        color: '#16180F',
        letterSpacing: '-0.02em'
      }}>
        <span style={{
          background: '#24391F',
          color: '#E8B44E',
          padding: '4px 14px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          Bagsakan
        </span>
        <span style={{
          background: '#FAF7EE',
          color: '#6E7160',
          padding: '4px 14px',
          borderRadius: '14px',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: '1px solid #E7E3D4'
        }}>
          {role || 'guest'}
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        flexWrap: 'wrap'
      }}>
        {visibleLinks.map(link => (
          <Link 
            key={link.to}
            to={link.to}
            style={{
              color: location.pathname === link.to ? '#16180F' : '#6E7160',
              background: location.pathname === link.to ? '#FAF7EE' : 'transparent',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              fontWeight: location.pathname === link.to ? 600 : 500,
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#16180F';
              e.currentTarget.style.background = '#FAF7EE';
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== link.to) {
                e.currentTarget.style.color = '#6E7160';
                e.currentTarget.style.background = 'transparent';
              }
            }}
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
              color: '#6E7160',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C62828';
              e.currentTarget.style.background = '#FFEBEE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6E7160';
              e.currentTarget.style.background = 'transparent';
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