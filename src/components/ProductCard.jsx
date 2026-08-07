import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Heart, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/money';
import Rating from './Rating';

export default function ProductCard({ product }) {
  const { addToCart, toggleList, wishlist, compare } = useStore();
  const [quickView, setQuickView] = useState(false);
  if (!product) return null;
  const saved = wishlist.some((item) => item.id === product?.id);
  const compared = compare.some((item) => item.id === product?.id);
  return <article className="product-card"><div className="product-image"><Link to={`/product/${product.id}`}><img loading="lazy" src={product.image} alt={product.name}/></Link>{product.badge && <span className="product-badge">{product.badge}</span>}<div className="product-actions"><button className={saved ? 'selected' : ''} onClick={() => toggleList('wishlist', product)} aria-label="Save to favorites"><Heart size={18} fill={saved ? 'currentColor' : 'none'}/></button><button className={compared ? 'selected' : ''} onClick={() => toggleList('compare', product)} aria-label="Compare product"><CircleDollarSign size={18}/></button><button onClick={() => setQuickView(true)} aria-label="Quick view food"><ShoppingBag size={18}/></button></div><button className="quick-add" onClick={() => addToCart(product)} aria-label={`Add ${product.short} to basket`}>Add to basket</button></div><div className="product-copy"><span className="product-category">{product.brand}</span><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><Rating value={product.rating} reviews={product.reviews}/><div className="price"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div></div>{quickView && <div className="quick-view-layer" role="dialog" aria-modal="true" aria-label={`Quick view ${product.name}`}><button className="quick-view-backdrop" onClick={() => setQuickView(false)} aria-label="Close quick view"/><div className="quick-view"><button className="quick-close" onClick={() => setQuickView(false)} aria-label="Close quick view"><X size={19}/></button><img src={product.image} alt=""/><div><span className="product-category">{product.category} · {product.brand}</span><h2>{product.name}</h2><Rating value={product.rating} reviews={product.reviews}/><div className="price"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div><p>Fresh {product.category.toLowerCase()} from {product.brand}, hand-picked for your delivery window.</p><button className="button primary" onClick={() => { addToCart(product); setQuickView(false); }}>Add to basket</button></div></div></div>}</article>;
}
