import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Field from '../components/Field';
import Alert from '../components/Alert';
import ErrorSummary from '../components/ErrorSummary';
import Icon from '../components/Icon';
import DonationTag from '../components/DonationTag';
import { createDonation, friendlyError, uploadDonationPhoto } from '../lib/api';
import { BARANGAYS, CATEGORIES, DEFAULT_CITY, UNITS } from '../lib/constants';
import { formatDate, formatQuantity, toDateInputValue } from '../lib/format';
import * as validate from '../lib/validation';

const EMPTY_FORM = {
  category: '',
  categoryOther: '',
  foodItem: '',
  quantity: '',
  unit: 'kg',
  description: '',
  datePrepared: toDateInputValue(new Date()),
  expirationDate: '',
  pickupAt: '',
  pickupAddress: '',
  barangay: '',
  city: DEFAULT_CITY,
  landmark: '',
  photo: null,
  confirmed: false,
};

function validateForm(form) {
  return validate.collectErrors({
    category: () => validate.category(form.category),
    categoryOther: () => validate.categoryOther(form.categoryOther, form.category),
    foodItem: () => validate.foodItem(form.foodItem),
    quantity: () => validate.quantity(form.quantity),
    unit: () => validate.unit(form.unit),
    description: () => validate.description(form.description),
    datePrepared: () => validate.datePrepared(form.datePrepared),
    expirationDate: () => validate.expirationDate(form.expirationDate, form.datePrepared),
    pickupAt: () => validate.pickupDateTime(form.pickupAt, form.expirationDate),
    pickupAddress: () => validate.pickupAddress(form.pickupAddress),
    barangay: () => validate.barangay(form.barangay),
    city: () => validate.city(form.city),
    landmark: () => validate.landmark(form.landmark),
    photo: () => validate.photo(form.photo),
    confirmed: () => validate.foodSafeConfirmation(form.confirmed),
  });
}

function NewDonation() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [created, setCreated] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(form.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  function update(field, value) {
    const next = { ...form, [field]: value };
    setForm(next);
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
    try {
      const photoUrl = form.photo ? await uploadDonationPhoto(user.id, form.photo) : null;
      const result = await createDonation({
        donor_id: user.id,
        category: form.category,
        category_other: form.category === 'Other' ? form.categoryOther.trim() : null,
        food_type: form.foodItem.trim(),
        quantity: Number(form.quantity),
        unit: form.unit,
        description: form.description.trim(),
        date_prepared: form.datePrepared,
        // Food stays good until the end of its expiration day
        expires_at: new Date(`${form.expirationDate}T23:59:59`).toISOString(),
        preferred_pickup_at: new Date(form.pickupAt).toISOString(),
        pickup_address: form.pickupAddress.trim(),
        barangay: form.barangay,
        city: form.city.trim(),
        landmark: form.landmark.trim() || null,
        photo_url: photoUrl,
      });
      setCreated({ ...result, food: form.foodItem.trim(), quantity: formatQuantity(form.quantity, form.unit), expiration: form.expirationDate });
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error('Error submitting donation:', err);
      setSubmitError(friendlyError(err));
    }
    setSubmitting(false);
  }

  function reportAnother() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setCreated(null);
  }

  if (created) {
    return (
      <div className="page page--narrow">
        <PageHeader title="Donation reported" description="An admin will review it and update its status. You can follow every step from My donations." />
        <div className="confirmation">
          <DonationTag
            referenceNo={created.reference_no}
            food={created.food}
            quantity={created.quantity}
            details={[{ label: 'Best before', value: formatDate(created.expiration) }]}
            status="pending"
          />
          <div className="confirmation__body">
            <p>Your reference number is <strong className="ref">{created.reference_no}</strong>. Keep it in case the barangay contacts you about this donation.</p>
            <div className="button-row">
              <Link to={`/donations/${created.id}`} className="button button--primary">View status</Link>
              <button type="button" className="button button--ghost" onClick={reportAnother}>Report another donation</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="page page--narrow">
      <PageHeader
        title="Report a donation"
        description="Tell the barangay what food you’re giving and where to collect it. Fields are required unless marked optional."
      />

      {submitted && errorCount > 0 && (
        <ErrorSummary count={errorCount} attempt={failedAttempts} action="submit this report">
          Each problem is explained under its field.
        </ErrorSummary>
      )}
      {submitError && <Alert tone="error" title="Report not submitted">{submitError}</Alert>}

      <form className="form form--sections" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2 className="form-section__title">Your details</h2>
          <p className="form-section__hint">From your account. The barangay uses these to reach you about pickup.</p>
          <dl className="readonly-grid">
            <div><dt>Name</dt><dd>{profile?.full_name || '—'}</dd></div>
            <div><dt>Email</dt><dd>{profile?.email || user?.email}</dd></div>
            <div><dt>Mobile</dt><dd>{profile?.contact_number || '—'}</dd></div>
            {profile?.organization && <div><dt>Organization</dt><dd>{profile.organization}</dd></div>}
          </dl>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Food</h2>
          <div className="form-row">
            <Field label="Category" error={errors.category}>
              <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            {form.category === 'Other' && (
              <Field label="What kind of food?" error={errors.categoryOther}>
                <input type="text" maxLength={50} value={form.categoryOther} onChange={(e) => update('categoryOther', e.target.value)} />
              </Field>
            )}
          </div>

          <Field label="Food item" hint="For example, Tomatoes or Chicken adobo" error={errors.foodItem}>
            <input type="text" maxLength={100} value={form.foodItem} onChange={(e) => update('foodItem', e.target.value)} />
          </Field>

          <div className="form-row form-row--qty">
            <Field label="Quantity" error={errors.quantity}>
              <input type="number" inputMode="decimal" min="0" step="any" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
            </Field>
            <Field label="Unit" error={errors.unit}>
              <select value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <Field
            label="Description"
            hint={`Condition, packaging and how it’s stored. ${form.description.trim().length}/500`}
            error={errors.description}
          >
            <textarea rows={4} maxLength={500} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </Field>

          <div className="form-row">
            <Field label="Date prepared or packed" error={errors.datePrepared}>
              <input type="date" max={toDateInputValue(new Date())} value={form.datePrepared} onChange={(e) => update('datePrepared', e.target.value)} />
            </Field>
            <Field label="Expiration or best-before date" error={errors.expirationDate}>
              <input type="date" min={toDateInputValue(new Date())} value={form.expirationDate} onChange={(e) => update('expirationDate', e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Pickup</h2>
          <Field label="Pickup address" hint="House or unit number and street" error={errors.pickupAddress}>
            <input type="text" autoComplete="street-address" maxLength={200} value={form.pickupAddress} onChange={(e) => update('pickupAddress', e.target.value)} />
          </Field>
          <div className="form-row">
            <Field label="Barangay" error={errors.barangay}>
              <select value={form.barangay} onChange={(e) => update('barangay', e.target.value)}>
                <option value="">Select a barangay</option>
                {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="City or municipality" error={errors.city}>
              <input type="text" maxLength={60} value={form.city} onChange={(e) => update('city', e.target.value)} />
            </Field>
          </div>
          <Field label="Landmark" optional hint="Helps volunteers find you, e.g. beside the chapel" error={errors.landmark}>
            <input type="text" maxLength={100} value={form.landmark} onChange={(e) => update('landmark', e.target.value)} />
          </Field>
          <Field label="Preferred pickup date and time" error={errors.pickupAt}>
            <input type="datetime-local" value={form.pickupAt} onChange={(e) => update('pickupAt', e.target.value)} />
          </Field>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Photo</h2>
          <Field label="Photo of the food" optional hint="JPG, PNG or WEBP, up to 5 MB. Shows the admin its condition." error={errors.photo}>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => update('photo', e.target.files?.[0] || null)}
            />
          </Field>
          {photoPreview && !errors.photo && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Preview of the uploaded food photo" />
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => {
                  if (photoInputRef.current) photoInputRef.current.value = '';
                  update('photo', null);
                }}
              >
                Remove photo
              </button>
            </div>
          )}
        </section>

        <section className="form-section">
          <div className={`checkbox ${errors.confirmed ? 'checkbox--error' : ''}`}>
            <input
              id="food-safe"
              type="checkbox"
              checked={form.confirmed}
              onChange={(e) => update('confirmed', e.target.checked)}
              aria-invalid={errors.confirmed ? true : undefined}
              aria-describedby={errors.confirmed ? 'food-safe-error' : undefined}
            />
            <label htmlFor="food-safe">
              I confirm this food is safe to eat, properly stored, and not past its expiration date.
            </label>
          </div>
          {errors.confirmed && <p className="field__error" id="food-safe-error">{errors.confirmed}</p>}
        </section>

        <div className="form-actions">
          <Link to="/donations" className="button button--ghost">Cancel</Link>
          <button type="submit" className="button button--primary" disabled={submitting}>
            <Icon name="tag" size={18} />
            {submitting ? 'Submitting…' : 'Submit donation report'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewDonation;
