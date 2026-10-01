import { useState } from 'react';
import Icon from './Icon';

// Password input with a show/hide toggle. Extra props (id, aria-*) pass through
// so it works inside <Field>.
function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-with-action">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="input-action"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  );
}

export default PasswordInput;
