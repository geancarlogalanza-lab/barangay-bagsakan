import Icon from './Icon';
import { BARANGAYS, CATEGORIES, STATUS_ORDER, STATUSES } from '../lib/constants';

// Search + filter controls. `values` and `onChange(field, value)` are owned by the page.
function FilterBar({ values, onChange, onClear, showBarangay, showDates }) {
  const active = Object.values(values).some(Boolean);

  return (
    <div className="filter-bar" role="search">
      <label className="filter-bar__search">
        <span className="visually-hidden">Search donations</span>
        <Icon name="search" size={18} />
        <input
          type="search"
          placeholder="Search reference, food or donor"
          value={values.q || ''}
          onChange={(e) => onChange('q', e.target.value)}
        />
      </label>

      <label className="filter">
        <span className="filter__label">Status</span>
        <select value={values.status || ''} onChange={(e) => onChange('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUSES[s].label}</option>)}
        </select>
      </label>

      <label className="filter">
        <span className="filter__label">Category</span>
        <select value={values.category || ''} onChange={(e) => onChange('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      {showBarangay && (
        <label className="filter">
          <span className="filter__label">Barangay</span>
          <select value={values.barangay || ''} onChange={(e) => onChange('barangay', e.target.value)}>
            <option value="">All barangays</option>
            {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
      )}

      {showDates && (
        <>
          <label className="filter">
            <span className="filter__label">Reported from</span>
            <input type="date" value={values.from || ''} max={values.to || undefined} onChange={(e) => onChange('from', e.target.value)} />
          </label>
          <label className="filter">
            <span className="filter__label">to</span>
            <input type="date" value={values.to || ''} min={values.from || undefined} onChange={(e) => onChange('to', e.target.value)} />
          </label>
        </>
      )}

      {active && (
        <button type="button" className="button button--ghost button--small filter-bar__clear" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
