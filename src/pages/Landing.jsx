import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        textAlign: 'center',
        color: 'white'
      }}>
        {/* Logo / Icon */}
        <div style={{
          fontSize: '5rem',
          marginBottom: '1rem',
          display: 'inline-block',
          background: 'rgba(255,255,255,0.05)',
          padding: '1.5rem',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)'
        }}>
          🍽️
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          margin: '0.5rem 0 0.25rem 0',
          letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #f093fb, #f5576c, #4facfe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Barangay Bagsakan
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '600px',
          margin: '0.5rem auto 1.5rem auto',
          lineHeight: 1.6
        }}>
          A food surplus redistribution system connecting donors to families in need.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
            Every donation counts. Every family matters.
          </span>
        </p>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          margin: '2.5rem 0'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}>
            <div style={{ fontSize: '2.5rem' }}></div>
            <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'white' }}>Donate Food</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              Vendors and restaurants share surplus food
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}>
            <div style={{ fontSize: '2.5rem' }}></div>
            <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'white' }}>Match & Allocate</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              System matches food to registered families
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}>
            <div style={{ fontSize: '2.5rem' }}></div>
            <h4 style={{ margin: '0.5rem 0 0.25rem 0', color: 'white' }}>Verify & Release</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              QR code verification for fair distribution
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <Link to="/dashboard">
          <button style={{
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            border: 'none',
            padding: '1rem 3rem',
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 30px rgba(245, 87, 108, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 87, 108, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(245, 87, 108, 0.4)';
          }}>
            Get Started →
          </button>
        </Link>

        <p style={{
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '1.5rem'
        }}>
          © 2026 Barangay Bagsakan · Built with ❤️ for the community
        </p>
      </div>
    </div>
  );
}

export default Landing;