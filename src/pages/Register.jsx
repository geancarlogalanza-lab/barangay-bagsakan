import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import Alert from '../components/Alert';
import ErrorSummary from '../components/ErrorSummary';
import PasswordInput from '../components/PasswordInput';
import { friendlyError } from '../lib/api';
import * as validate from '../lib/validation';

const ACCOUNT_TYPES = [
  { value: 'donor', title: 'Donor', text: 'I have surplus food to give: a household, store, restaurant or vendor.' },
  { value: 'admin', title: 'Admin', text: 'I work for the barangay and review and track donations.' },
];

const EMPTY_FORM = {
  role: 'donor',
  fullName: '',
  email: '',
  contactNumber: '',
  organization: '',
  password: '',
  confirmPassword: '',
  agreed: false,
};

function validateForm(form) {
  return validate.collectErrors({
    role: () => validate.role(form.role),
    fullName: () => validate.fullName(form.fullName),
    email: () => validate.email(form.email),
    contactNumber: () => validate.contactNumber(form.contactNumber),
    organization: () => validate.organization(form.organization),
    password: () => validate.password(form.password),
    confirmPassword: () => validate.confirmPassword(form.confirmPassword, form.password),
    agreed: () => validate.agreement(form.agreed),
  });
}

function Register() {
  const { user, loading: authLoading, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  if (!authLoading && user && !submitting) {
    return <Navigate to="/dashboard" replace />;
  }

  function update(field, value) {
    const next = { ...form, [field]: value };
    setForm(next);
    // After the first submit attempt, re-check as the user fixes things
    if (submitted) setErrors(validateForm(next));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const found = validateForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFailedAttempts((n) => n + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    const { data, error } = await signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      fullName: form.fullName.trim().replace(/\s+/g, ' '),
      role: form.role,
      contactNumber: validate.normalizeMobile(form.contactNumber),
      organization: form.organization.trim(),
    });

    if (error) {
      setSubmitError(friendlyError(error));
      setSubmitting(false);
      return;
    }

    if (data.session) {
      navigate('/dashboard', { replace: true });
    } else {
      // Email confirmation is switched on in Supabase
      setNeedsConfirmation(true);
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;
  const aside = (
    <ul className="auth__points">
      <li><strong>Donors</strong> report surplus food and follow it until it reaches a family.</li>
      <li><strong>Admins</strong> review each donation and record what happened to it.</li>
    </ul>
  );

  if (needsConfirmation) {
    return (
      <AuthShell title="Check your email" aside={aside}>
        <Alert tone="success" title="Account created">
          We sent a confirmation link to <strong>{form.email}</strong>. Open it, then sign in.
        </Alert>
        <Link to="/login" className="button button--primary button--block">Go to sign in</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create an account"
      description="It takes a minute. Fields are required unless marked optional."
      aside={aside}
    >
      {submitted && errorCount > 0 && <ErrorSummary count={errorCount} attempt={failedAttempts} />}
      {submitError && <Alert tone="error" title="Account not created">{submitError}</Alert>}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <fieldset className="choice-list choice-list--row">
          <legend className="field__label">I am registering as</legend>
          {ACCOUNT_TYPES.map((type) => (
            <label key={type.value} className={`choice ${form.role === type.value ? 'choice--selected' : ''}`}>
              <input
                type="radio"
                name="role"
                value={type.value}
                checked={form.role === type.value}
                onChange={() => update('role', type.value)}
              />
              <span className="choice__body">
                <span className="choice__title">{type.title}</span>
                <span className="choice__hint">{type.text}</span>
              </span>
            </label>
          ))}
          {errors.role && <p className="field__error">{errors.role}</p>}
        </fieldset>

        <Field label="Full name" error={errors.fullName}>
          <input
            type="text"
            autoComplete="name"
            maxLength={100}
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>

        <Field label="Mobile number" hint="11 digits, like 09171234567" error={errors.contactNumber}>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={16}
            value={form.contactNumber}
            onChange={(e) => update('contactNumber', e.target.value)}
          />
        </Field>

        <Field
          label={form.role === 'admin' ? 'Office or position' : 'Organization or business'}
          optional
          hint={form.role === 'admin' ? 'For example, Barangay Health Office' : 'For example, Aling Nena’s Carinderia'}
          error={errors.organization}
        >
          <input
            type="text"
            autoComplete="organization"
            maxLength={100}
            value={form.organization}
            onChange={(e) => update('organization', e.target.value)}
          />
        </Field>

        <div className="form-row">
          <Field label="Password" hint="At least 8 characters, with a letter and a number" error={errors.password}>
            <PasswordInput
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </Field>
          <Field label="Confirm password" error={errors.confirmPassword}>
            <PasswordInput
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
            />
          </Field>
        </div>

        <div className={`checkbox ${errors.agreed ? 'checkbox--error' : ''}`}>
          <input
            id="agree"
            type="checkbox"
            checked={form.agreed}
            onChange={(e) => update('agreed', e.target.checked)}
            aria-invalid={errors.agreed ? true : undefined}
            aria-describedby={errors.agreed ? 'agree-error' : undefined}
          />
          <label htmlFor="agree">
            I agree that Barangay Bagsakan may store my name, email and mobile number to
            coordinate donations, as allowed by the Data Privacy Act of 2012.
          </label>
        </div>
        {errors.agreed && <p className="field__error" id="agree-error">{errors.agreed}</p>}

        <button type="submit" className="button button--primary button--block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth__switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export default Register;
