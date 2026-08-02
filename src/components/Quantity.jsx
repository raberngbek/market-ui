import { Minus, Plus } from 'lucide-react';

export default function Quantity({ value, setValue, stock }) {
  return <div className="quantity-control large"><button disabled={value <= 1} onClick={() => setValue(value - 1)} aria-label="Decrease quantity"><Minus size={16}/></button><span>{value}</span><button disabled={value >= stock} onClick={() => setValue(value + 1)} aria-label="Increase quantity"><Plus size={16}/></button></div>;
}
