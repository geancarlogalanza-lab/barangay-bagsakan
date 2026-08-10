import { Link } from 'react-router-dom';

function Landing() {
  // Smooth scroll helper
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      color: '#16180F',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Announcement Bar */}
      <div style={{
        background: '#F6E7B8',
        borderBottom: '1px solid #E7E3D4',
        padding: '14px 32px',
        textAlign: 'center',
        fontSize: '0.92rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
        {/* Heart SVG Icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="#16180F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
        </svg>
        <span>
          Excess food shouldn't go to waste while families go hungry.{' '}
          <button
            onClick={() => scrollTo('how')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              padding: 0
            }}
          >
            See how it works
          </button>
        </span>
      </div>

      {/* Navigation */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E7E3D4',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        padding: '18px 32px'
      }}>
        <div style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '26px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.94rem', color: '#3C3E30', fontWeight: 500 }}>Donate ⌄</span>
            <span style={{ fontSize: '0.94rem', color: '#3C3E30', fontWeight: 500 }}>Volunteer ⌄</span>
          </div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.2rem', textDecoration: 'none', color: '#16180F' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#24391F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
              <path d="M3 12a9 9 0 0 0 18 0z"/>
              <path d="M3 12a9 4 0 0 1 18 0"/>
              <path d="M8 5v3"/>
              <path d="M16 5v6"/>
            </svg>
            bagsakan
          </Link>
          <div style={{ display: 'flex', gap: '26px', alignItems: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.94rem', fontWeight: 600, color: '#16180F', textDecoration: 'none' }}>Sign in</Link>
            <Link to="/register" style={{
              background: '#FFFFFF',
              color: '#16180F',
              border: '1.5px solid #16180F',
              padding: '12px 22px',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.94rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#16180F';
              e.target.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#FFFFFF';
              e.target.style.color = '#16180F';
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '90px 32px 70px'
      }}>
        <span style={{
          display: 'inline-block',
          background: '#F6E7B8',
          color: '#16180F',
          fontWeight: 700,
          fontSize: '0.88rem',
          padding: '8px 18px',
          borderRadius: '999px',
          marginBottom: '34px'
        }}>
          Barangay-powered food sharing
        </span>
        <h1 style={{
          fontSize: 'clamp(2.8rem, 7vw, 5.4rem)',
          fontWeight: 900,
          lineHeight: 1.0,
          maxWidth: '920px',
          margin: '0 auto'
        }}>
          Where surplus food<br />
          <span style={{ color: '#C1592F' }}>finds a family</span>
        </h1>
        <p style={{
          maxWidth: '560px',
          margin: '28px auto 0',
          fontSize: '1.15rem',
          lineHeight: 1.6,
          color: '#3C3E30'
        }}>
          Vendors and restaurants share what's left over. Registered families nearby get it before it's ever wasted.
        </p>
        <div style={{ marginTop: '42px' }}>
          <Link to="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#24391F',
            color: '#E8B44E',
            padding: '16px 30px',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '1.02rem',
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#345A2C';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#24391F';
          }}>
            Start a Bagsakan →
          </Link>
        </div>
        <p style={{
          marginTop: '16px',
          fontSize: '0.85rem',
          color: '#6E7160'
        }}>
          Free to join · No fees for donors or families
        </p>
      </section>

      {/* Stats Strip */}
      <div style={{
        borderTop: '1px solid #E7E3D4',
        borderBottom: '1px solid #E7E3D4',
        background: '#FAF7EE'
      }}>
        <div style={{
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '40px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#24391F' }}>120+</div>
            <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#6E7160', fontWeight: 500 }}>Vendors donating weekly</div>
          </div>
          <div style={{ borderLeft: '1px solid #E7E3D4' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#24391F' }}>3</div>
            <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#6E7160', fontWeight: 500 }}>Steps from surplus to plate</div>
          </div>
          <div style={{ borderLeft: '1px solid #E7E3D4' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#24391F' }}>100%</div>
            <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#6E7160', fontWeight: 500 }}>Pickups verified by QR</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how" style={{ padding: '100px 32px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
          <span style={{
            display: 'inline-block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#C1592F',
            fontWeight: 700,
            marginBottom: '14px'
          }}>How it works</span>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)', fontWeight: 800 }}>Three steps, no waste</h2>
          <p style={{ marginTop: '16px', color: '#3C3E30', lineHeight: 1.6, fontSize: '1.02rem' }}>
            A simple loop that gets food out of the back kitchen and onto someone's table the same day.
          </p>
        </div>

        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '26px'
        }}>
          {/* Step 1 */}
          <div style={{
            border: '1px solid #E7E3D4',
            borderRadius: '16px',
            padding: '32px 26px',
            background: '#FFFFFF',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 16px 34px rgba(20,20,10,0.08)';
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.borderColor = 'transparent';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(0)';
            e.target.style.borderColor = '#E7E3D4';
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#6E7160',
              marginBottom: '16px'
            }}>Step 1</div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#F6E7B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C1592F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <path d="M20 12V8a2 2 0 0 0-2-2h-3l-2-2h-2L9 6H6a2 2 0 0 0-2 2v4"/>
                <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>
                <path d="M4 12h16"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px' }}>Donate Food</h3>
            <p style={{ color: '#3C3E30', fontSize: '0.95rem', lineHeight: 1.6 }}>Vendors and restaurants log surplus food in minutes, right from their counter or kitchen.</p>
          </div>

          {/* Step 2 */}
          <div style={{
            border: '1px solid #E7E3D4',
            borderRadius: '16px',
            padding: '32px 26px',
            background: '#FFFFFF',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 16px 34px rgba(20,20,10,0.08)';
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.borderColor = 'transparent';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(0)';
            e.target.style.borderColor = '#E7E3D4';
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#6E7160',
              marginBottom: '16px'
            }}>Step 2</div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#F6E7B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C1592F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <circle cx="8" cy="12" r="4"/>
                <circle cx="16" cy="12" r="4"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px' }}>Match &amp; Allocate</h3>
            <p style={{ color: '#3C3E30', fontSize: '0.95rem', lineHeight: 1.6 }}>The system matches available food to registered families closest by, so nothing travels far.</p>
          </div>

          {/* Step 3 */}
          <div style={{
            border: '1px solid #E7E3D4',
            borderRadius: '16px',
            padding: '32px 26px',
            background: '#FFFFFF',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 16px 34px rgba(20,20,10,0.08)';
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.borderColor = 'transparent';
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.transform = 'translateY(0)';
            e.target.style.borderColor = '#E7E3D4';
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#6E7160',
              marginBottom: '16px'
            }}>Step 3</div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#F6E7B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C1592F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                <rect x="4" y="4" width="6" height="6" rx="1"/>
                <rect x="14" y="4" width="6" height="6" rx="1"/>
                <rect x="4" y="14" width="6" height="6" rx="1"/>
                <path d="M14 14h3v3h-3z"/>
                <path d="M20 17h.01"/>
                <path d="M17 20h.01"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px' }}>Verify &amp; Release</h3>
            <p style={{ color: '#3C3E30', fontSize: '0.95rem', lineHeight: 1.6 }}>A quick QR scan confirms pickup, keeping distribution fair and easy to track for the barangay.</p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section style={{
        padding: '100px 32px',
        background: '#FAF7EE'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px' }}>
          <span style={{
            display: 'inline-block',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#C1592F',
            fontWeight: 700,
            marginBottom: '14px'
          }}>Who it's for</span>
          <h2 style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.7rem)', fontWeight: 800 }}>Built for every neighbor</h2>
          <p style={{ marginTop: '16px', color: '#3C3E30', lineHeight: 1.6, fontSize: '1.02rem' }}>
            Three roles, one shared table. Everyone plays a small part in making sure good food finds a home.
          </p>
        </div>

        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '26px'
        }}>
          {/* Donors */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '30px 26px',
            border: '1px solid #E7E3D4'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#24391F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#E8B44E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d="M3 21h18"/>
                <path d="M5 21V9l7-5 7 5v12"/>
                <path d="M9 21v-6h6v6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '8px' }}>Donors</h3>
            <p style={{ fontSize: '0.92rem', color: '#3C3E30', lineHeight: 1.6 }}>Restaurants, vendors, and stores post surplus food before closing, instead of throwing it out.</p>
          </div>

          {/* Families */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '30px 26px',
            border: '1px solid #E7E3D4'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#24391F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#E8B44E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '8px' }}>Families</h3>
            <p style={{ fontSize: '0.92rem', color: '#3C3E30', lineHeight: 1.6 }}>Register once with your barangay, then get notified the moment food is ready nearby.</p>
          </div>

          {/* Barangay Volunteers */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '30px 26px',
            border: '1px solid #E7E3D4'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#24391F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#E8B44E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d="M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '8px' }}>Barangay Volunteers</h3>
            <p style={{ fontSize: '0.92rem', color: '#3C3E30', lineHeight: 1.6 }}>Verify pickups with a scan and keep an honest, transparent record for the whole community.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <div id="cta" style={{
        maxWidth: '1080px',
        margin: '20px auto 100px',
        padding: '64px 40px',
        borderRadius: '26px',
        background: '#24391F',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: 'clamp(1.8rem, 3.4vw, 2.5rem)',
          fontWeight: 800
        }}>
          Ready to share the table?
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.72)',
          maxWidth: '460px',
          margin: '16px auto 32px',
          lineHeight: 1.6
        }}>
          Whether you have food to give or a family to feed, it starts with one sign-up.
        </p>
        <Link to="/register" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: '#E8B44E',
          color: '#24391F',
          padding: '16px 30px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '1.02rem',
          textDecoration: 'none',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#F6E7B8';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#E8B44E';
        }}>
          Get Started →
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #E7E3D4',
        padding: '44px 32px'
      }}>
        <div style={{
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, textDecoration: 'none', color: '#16180F' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#24391F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
              <path d="M3 12a9 9 0 0 0 18 0z"/>
              <path d="M3 12a9 4 0 0 1 18 0"/>
            </svg>
            bagsakan
          </Link>
          <p style={{ color: '#6E7160', fontSize: '0.85rem' }}>
            © 2026 Barangay Bagsakan · Built with <span style={{ color: '#C1592F' }}>♥</span> for the community
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;