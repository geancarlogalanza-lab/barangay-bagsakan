import { useEffect, useRef, useState } from 'react';
import Field from './Field';
import Alert from './Alert';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { NOTE_REQUIRED, STATUSES, STATUS_ACTIONS } from '../lib/constants';
import * as validate from '../lib/validation';

// Modal used by admins to move a donation to its next status
function StatusDialog({ donation, initialStatus, onClose, onSave }) {
  const dialogRef = useRef(null);
  const options = STATUSES[donation.status]?.next || [];
  const [nextStatus, setNextStatus] = useState(initialStatus || options[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const noteRequired = NOTE_REQUIRED.includes(nextStatus);

  // Tell the page directly instead of waiting for the native "close" event,
  // which some browsers deliver late or not at all.
  function close() {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const message = validate.statusNote(note, noteRequired);
    setError(message);
    if (message) return;

    setSaving(true);
    setSubmitError('');
    try {
      await onSave(nextStatus, note.trim());
      close();
    } catch (err) {
      setSubmitError(err.message);
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onCancel={(e) => { e.preventDefault(); close(); }}
      aria-labelledby="status-dialog-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="dialog__header">
          <h2 id="status-dialog-title">Update status</h2>
          <button type="button" className="icon-button" onClick={close} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <p className="dialog__current">
          {donation.reference_no} is currently <StatusBadge status={donation.status} size="sm" />
        </p>

        <fieldset className="choice-list">
          <legend className="field__label">Move to</legend>
          {options.map((status) => (
            <label key={status} className={`choice ${nextStatus === status ? 'choice--selected' : ''}`}>
              <input
                type="radio"
                name="next-status"
                value={status}
                checked={nextStatus === status}
                onChange={() => { setNextStatus(status); setError(''); }}
              />
              <span className="choice__body">
                <StatusBadge status={status} size="sm" />
                <span className="choice__hint">{STATUSES[status].description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Field
          label={noteRequired ? 'Reason' : 'Note'}
          optional={!noteRequired}
          hint={noteRequired ? 'Shown to the donor, e.g. “Goods were spoiled on arrival.”' : 'Shown on the donation’s history.'}
          error={error}
        >
          <textarea
            rows={3}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        {submitError && <Alert tone="error" title="Status not updated">{submitError}</Alert>}

        <div className="dialog__actions">
          <button type="button" className="button button--ghost" onClick={close}>
            Cancel
          </button>
          <button
            type="submit"
            className={`button ${nextStatus === 'rejected' ? 'button--danger' : 'button--primary'}`}
            disabled={saving}
          >
            {saving ? 'Saving…' : STATUS_ACTIONS[nextStatus]}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default StatusDialog;
