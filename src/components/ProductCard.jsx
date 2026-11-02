import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Heart, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/money';
import Rating from './Rating';

export default function ProductCard({ product }) {
  const store = useStore();
  const addToCart = store?.addToCart || (() => {});
  const toggleList = store?.toggleList || (() => {});
  const wishlist = store?.wishlist || [];
  const compare = store?.compare || [];
  const [quickView, setQuickView] = useState(false);

  if (!product) return null;

  const productId = product?.id || '';
  const saved = (wishlist || []).some((item) => item?.id === productId);
  const compared = (compare || []).some((item) => item?.id === productId);
  const categoryStr = (product?.category || '').toLowerCase();

  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/product/${productId}`}>
          <img 
            loading="lazy" 
            src={product?.image || ''} 
            alt={product?.name || 'Product'} 
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </Link>
        {product?.badge && <span className="product-badge">{product.badge}</span>}
        <div className="product-actions">
          <button className={saved ? 'selected' : ''} onClick={() => toggleList('wishlist', product)} aria-label="Save to favorites">
            <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button className={compared ? 'selected' : ''} onClick={() => toggleList('compare', product)} aria-label="Compare product">
            <CircleDollarSign size={18} />
          </button>
          <button onClick={() => setQuickView(true)} aria-label="Quick view food">
            <ShoppingBag size={18} />
          </button>
        </div>
        <button className="quick-add" onClick={() => addToCart(product)} aria-label={`Add ${product?.short || 'item'} to basket`}>
          Add to basket
        </button>
      </div>
      <div className="product-copy">
        <span className="product-category">
          <Link to={`/store/${product?.storeId || ''}`} className="store-pill-link">
            {product?.storeName || product?.brand || 'Local Store'}
          </Link>
          {product?.category && ` · ${product.category}`}
        </span>
        <Link to={`/product/${productId}`}>
          <h3 title={`${product?.storeName || product?.brand || ''} · ${product?.name || ''}`}>
            <span className="product-store-title">
              {product?.storeName || product?.brand ? `${product.storeName || product.brand} · ` : ''}
            </span>
            {product?.name || ''}
          </h3>
        </Link>
        <Rating value={product?.rating ?? 0} reviews={product?.reviews ?? 0} />
        <div className="price">
          <strong>{money(product?.price)}</strong>
          {product?.oldPrice && <del>{money(product.oldPrice)}</del>}
        </div>
      </div>
      {quickView && (
        <div className="quick-view-layer" role="dialog" aria-modal="true" aria-label={`Quick view ${product?.name || 'product'}`}>
          <button className="quick-view-backdrop" onClick={() => setQuickView(false)} aria-label="Close quick view" />
          <div className="quick-view">
            <button className="quick-close" onClick={() => setQuickView(false)} aria-label="Close quick view">
              <X size={19} />
            </button>
            <img src={product?.image || ''} alt="" />
            <div>
              <span className="product-category">
                Store: <Link to={`/store/${product?.storeId || ''}`}>{product?.storeName || product?.brand}</Link> · {product?.category || ''}
              </span>
              <h2>
                <span className="product-store-title">
                  {product?.storeName || product?.brand ? `${product.storeName || product.brand} · ` : ''}
                </span>
                {product?.name || ''}
              </h2>
              <Rating value={product?.rating ?? 0} reviews={product?.reviews ?? 0} />
              <div className="price">
                <strong>{money(product?.price)}</strong>
                {product?.oldPrice && <del>{money(product.oldPrice)}</del>}
              </div>
              <p>Fresh {categoryStr} from {product?.brand || 'local maker'}, hand-picked for your delivery window.</p>
              <button className="button primary" onClick={() => { addToCart(product); setQuickView(false); }}>
                Add to basket
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

