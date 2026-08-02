import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true);
  return <section className="filter-group"><button className="filter-title" onClick={() => setOpen(!open)}>{title}<ChevronDown size={17} className={open ? '' : 'rotate'}/></button>{open && <div className="filter-options">{children}</div>}</section>;
}
