import { Link } from 'react-router-dom';

export default function Breadcrumb({ current }) {
  return <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>{current}</span></div>;
}
