import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7EE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: '#FFFFFF',
        padding: '2.5rem',
        borderRadius: '20px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(20,20,10,0.08)',
        border: '1px solid #E7E3D4'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div style={{
            display: 'inline-block',
            background: '#24391F',
            color: '#E8B44E',
            padding: '4px 16px',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Barangay Bagsakan
          </div>
        </div>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '0.25rem',
          color: '#16180F',
          fontSize: '1.6rem',
          fontWeight: 800,
          letterSpacing: '-0.02em'
        }}>
          Welcome back
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#6E7160',
          marginBottom: '1.75rem',
          fontSize: '0.92rem'
        }}>
          Sign in to continue sharing food
        </p>

        {error && (
          <div style={{
            background: '#FFEBEE',
            color: '#C62828',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            border: '1px solid #FFCDD2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#3C3E30'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #E7E3D4',
                borderRadius: '10px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
                background: '#FAFAF8'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#24391F';
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E7E3D4';
                e.currentTarget.style.background = '#FAFAF8';
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#3C3E30'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid #E7E3D4',
                borderRadius: '10px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
                background: '#FAFAF8'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#24391F';
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E7E3D4';
                e.currentTarget.style.background = '#FAFAF8';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#24391F',
              color: '#E8B44E',
              border: 'none',
              borderRadius: '999px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#345A2C';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#24391F';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#6E7160',
          marginTop: '1.25rem'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: '#24391F',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#345A2C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#24391F';
          }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;