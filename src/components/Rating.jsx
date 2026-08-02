import { Star } from 'lucide-react';

export default function Rating({ value, reviews }) {
  return <span className="rating"><Star size={14} fill="currentColor"/> {value} {reviews && <small>({reviews})</small>}</span>;
}
