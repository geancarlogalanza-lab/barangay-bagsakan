import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import Alert from '../components/Alert';
import PasswordInput from '../components/PasswordInput';
import { friendlyError } from '../lib/api';
import * as validate from '../lib/validation';

function Login() {
  const { user, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from || '/dashboard';

  if (!authLoading && user) {
    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate.collectErrors({
      email: () => validate.email(email),
      password: () => (password ? '' : 'Enter your password.'),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setSubmitError(friendlyError(error));
      setSubmitting(false);
      return;
    }
    navigate(destination, { replace: true });
  }

  return (
    <AuthShell
      title="Sign in"
      description="Track your donations or manage the barangay’s donation reports."
      aside={
        <>
          <p className="auth__quote">Every donation is tagged, tracked and accounted for, from the donor’s kitchen to a family’s table.</p>
        </>
      }
    >
      {submitError && <Alert tone="error" title="Couldn’t sign in">{submitError}</Alert>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button type="submit" className="button button--primary button--block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth__switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export default Login;
