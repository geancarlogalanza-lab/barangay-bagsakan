import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{
      backgroundColor: '#2d3b5e',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        🍽️ Barangay Bagsakan
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/beneficiaries" style={{ color: 'white', textDecoration: 'none' }}>Beneficiaries</Link>
        <Link to="/matching" style={{ color: 'white', textDecoration: 'none' }}>Matching</Link>
        <Link to="/qr" style={{ color: 'white', textDecoration: 'none' }}>QR Codes</Link>
        <Link to="/verify" style={{ color: 'white', textDecoration: 'none' }}>Verify</Link>
      </div>
    </nav>
  );
}

export default Navbar;