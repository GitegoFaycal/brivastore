import { Link } from 'react-router-dom';
import { useTitle } from '../lib/hooks';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-display mt-2 text-7xl">This rack is empty</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-500">The page you are looking for does not exist. Let's get you back to the good stuff.</p>
      <div className="mt-8 flex justify-center gap-3"><Link to="/" className="btn-primary">Home</Link><Link to="/shop" className="btn-secondary">Shop all</Link></div>
    </div>
  );
}
