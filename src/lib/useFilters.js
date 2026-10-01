import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

// Keeps filter values in the URL so filtered views can be linked and reloaded
export function useFilters(fields) {
  const [params, setParams] = useSearchParams();

  // setSearchParams does not queue updates the way setState does, so track the
  // newest params ourselves; otherwise two quick changes overwrite each other.
  const latest = useRef(params);
  latest.current = params;

  const values = Object.fromEntries(fields.map((f) => [f, params.get(f) || '']));

  function setFilter(field, value) {
    const next = new URLSearchParams(latest.current);
    if (value) next.set(field, value);
    else next.delete(field);
    latest.current = next;
    setParams(next, { replace: true });
  }

  function clearFilters() {
    latest.current = new URLSearchParams();
    setParams(latest.current, { replace: true });
  }

  return { values, setFilter, clearFilters };
}
