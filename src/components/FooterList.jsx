import { Link } from 'react-router-dom';

export default function FooterList({ title, links }) {
  return <div><h3>{title}</h3>{links.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}</div>;
}
