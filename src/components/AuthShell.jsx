import Logo from './Logo';

// Split layout for sign-in and registration
function AuthShell({ title, description, children, aside }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <Logo />
        <div className="auth__aside-body">{aside}</div>
      </aside>
      <main className="auth__main">
        <div className="auth__panel">
          <h1 className="auth__title">{title}</h1>
          {description && <p className="auth__description">{description}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthShell;
