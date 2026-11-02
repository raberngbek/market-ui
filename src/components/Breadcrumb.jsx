import { Link } from 'react-router-dom';

export default function Breadcrumb({ current, category }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <Link to="/">Home</Link>
      <span className="breadcrumb-separator">/</span>
      {category && (
        <>
          <Link to={`/category/${encodeURIComponent(category)}`}>{category}</Link>
          <span className="breadcrumb-separator">/</span>
        </>
      )}
      <span className="breadcrumb-current">{current}</span>
    </nav>
  );
}
