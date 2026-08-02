import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="not-found"><span>404</span><h1>That aisle is empty.</h1><p>We couldn't find the food page you were looking for.</p><Link className="button primary" to="/">Back to MarketFresh</Link></main>;
}
