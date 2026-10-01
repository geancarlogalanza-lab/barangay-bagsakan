import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

function NotFound() {
  return (
    <div className="full-page-center not-found">
      <Logo tone="dark" />
      <h1>This page doesn’t exist</h1>
      <p>The link may be old or mistyped.</p>
      <Link to="/" className="button button--primary">Go to the home page</Link>
    </div>
  );
}

export default NotFound;
