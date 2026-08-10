import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { supabase } from '../services/supabase';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error } = await signUp(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      try {
        const { error: donorError } = await supabase
          .from('donors')
          .insert({
            id: data.user.id,
            name: email.split('@')[0] || 'Donor',
            email: email,
            address: 'Barangay Pasig'
          });

        if (donorError) {
          console.error('Error creating donor:', donorError);
        } else {
          console.log('Donor profile created for:', email);
        }
      } catch (err) {
        console.error('Error in donor creation:', err);
      }
    }
    
    navigate('/login');
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
          Create Account
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#6E7160',
          marginBottom: '1.75rem',
          fontSize: '0.92rem'
        }}>
          Register as a donor
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
          <div style={{ marginBottom: '1rem' }}>
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
              placeholder="Min 6 characters"
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
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#6E7160',
          marginTop: '1.25rem'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
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
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;