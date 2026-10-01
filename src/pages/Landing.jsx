import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import DonationTag from '../components/DonationTag';
import StatusBadge from '../components/StatusBadge';

const STEPS = [
  { status: 'pending', who: 'Donor', text: 'Report the food: what it is, how much, when it expires, and where to pick it up. A photo helps.' },
  { status: 'accepted', who: 'Admin', text: 'The barangay checks the report and approves it for collection.' },
  { status: 'to_be_delivered', who: 'Admin', text: 'Pickup is scheduled and the food is on its way to the barangay.' },
  { status: 'distributed', who: 'Admin', text: 'The food is handed out to families, and the donation is closed.' },
];

function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing">
      <header className="landing__nav">
        <Logo tone="dark" />
        <nav aria-label="Account">
          <a href="#how" className="landing__link">How it works</a>
          <Link to="/login" className="landing__link">Sign in</Link>
          <Link to="/register" className="button button--primary button--small">Create an account</Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero__text">
            <h1 className="hero__title">Know what happened to every food donation.</h1>
            <p className="hero__lead">
              Donors report surplus food. Barangay admins record each step, from review to pickup
              to the families who receive it, so nothing goes to waste unnoticed.
            </p>
            <div className="button-row">
              <Link to="/register" className="button button--primary button--large">Create an account</Link>
              <Link to="/login" className="button button--ghost button--large">Sign in</Link>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <span className="hero__string" />
            <DonationTag
              className="donation-tag--hero"
              referenceNo="BB-2026-0042"
              food="Pandesal"
              quantity="120 pcs"
              details={[
                { label: 'From', value: 'Panaderia ni Lola' },
                { label: 'Best before', value: 'Tomorrow' },
              ]}
              stamps={['accepted', 'to_be_delivered', 'distributed']}
            />
          </div>
        </section>

        <section id="how" className="landing__section">
          <div className="landing__section-head">
            <h2>How a donation moves</h2>
            <p>Every change is saved with who made it and when, so the barangay can report on it later.</p>
          </div>
          <ol className="steps">
            {STEPS.map((step) => (
              <li key={step.status} className="step">
                <StatusBadge status={step.status} />
                <p className="step__who">{step.who}</p>
                <p className="step__text">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="steps__aside">
            At any point an admin can mark a donation <StatusBadge status="rejected" size="sm" /> with a reason,
            for example spoiled goods, or <StatusBadge status="expired" size="sm" /> if it passed its date before reaching anyone.
          </p>
        </section>

        <section className="landing__section landing__section--accounts">
          <div className="landing__section-head">
            <h2>Two kinds of accounts</h2>
            <p>Choose one when you register.</p>
          </div>
          <div className="accounts">
            <article className="account">
              <h3>Donor</h3>
              <p>For households, stores, restaurants and market vendors with food to give.</p>
              <ul>
                <li>Report donations with a photo and pickup details</li>
                <li>Follow each donation’s status</li>
                <li>See notes from the barangay, including reasons for rejection</li>
              </ul>
            </article>
            <article className="account">
              <h3>Admin</h3>
              <p>For barangay staff who receive and distribute donations.</p>
              <ul>
                <li>Review and update the status of every donation</li>
                <li>Build reports by period, status, category and barangay</li>
                <li>Print reports or export them as spreadsheets</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="landing__cta">
          <h2>Have food to give, or donations to track?</h2>
          <Link to="/register" className="button button--gold button--large">Create an account</Link>
        </section>
      </main>

      <footer className="landing__footer">
        <Logo tone="dark" />
        <p>A food donation reporting system for the barangay. © 2026 Barangay Bagsakan.</p>
      </footer>
    </div>
  );
}

export default Landing;
