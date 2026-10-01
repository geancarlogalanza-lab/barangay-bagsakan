import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../lib/constants';
import Icon from './Icon';
import Logo from './Logo';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['donor', 'admin'] },
  { to: '/donations/new', label: 'Report a donation', icon: 'plus', roles: ['donor'] },
  { to: '/donations', label: 'My donations', icon: 'donations', roles: ['donor'], end: true },
  { to: '/donations', label: 'Donations', icon: 'donations', roles: ['admin'], end: true },
  { to: '/reports', label: 'Reports', icon: 'reports', roles: ['admin'] },
  { to: '/users', label: 'Users', icon: 'users', roles: ['admin'] },
];

function AppLayout() {
  const { profile, role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu after navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const links = NAV.filter((item) => item.roles.includes(role));

  return (
    <div className={`app ${menuOpen ? 'app--menu-open' : ''}`}>
      <a href="#main" className="skip-link">Skip to content</a>

      <header className="topbar no-print">
        <Logo to="/dashboard" />
        <button
          type="button"
          className="icon-button icon-button--on-dark"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
        >
          <Icon name="menu" size={24} />
        </button>
      </header>

      <div className="sidebar-backdrop no-print" onClick={() => setMenuOpen(false)} aria-hidden="true" />

      <aside id="sidebar" className="sidebar no-print" aria-label="Main navigation">
        <div className="sidebar__top">
          <Logo to="/dashboard" />
          <button
            type="button"
            className="icon-button icon-button--on-dark sidebar__close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {links.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__account">
          <p className="sidebar__name">{profile?.full_name || profile?.email || 'Signed in'}</p>
          <p className="sidebar__role">{ROLES[role] || role} account</p>
          <button type="button" className="nav-link nav-link--button" onClick={handleSignOut}>
            <Icon name="logout" />
            Sign out
          </button>
        </div>
      </aside>

      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
