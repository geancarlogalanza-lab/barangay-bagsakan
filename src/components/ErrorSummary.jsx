import { useEffect, useRef } from 'react';
import Alert from './Alert';

// Error box shown above a form after a failed submit. It takes keyboard and
// screen-reader focus on each failed attempt (`attempt` changes), but not while
// the user is fixing fields.
function ErrorSummary({ count, attempt, action = 'continue', children }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, [attempt]);

  return (
    <div ref={ref} tabIndex={-1} className="error-summary">
      <Alert tone="error" title={`Fix ${count} ${count === 1 ? 'field' : 'fields'} to ${action}`}>
        {children}
      </Alert>
    </div>
  );
}

export default ErrorSummary;
