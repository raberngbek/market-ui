import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import Toast from './Toast';

export default function Utilities() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => { const onScroll = () => setShowTop(window.scrollY > 500); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  return <>{showTop && <button className="back-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={19}/></button>}<Toast/></>;
}
