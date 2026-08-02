import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({ eyebrow, title, link = '/shop', label = 'Shop all' }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div><Link className="text-link" to={link}>{label}<ArrowRight size={17}/></Link></div>;
}
