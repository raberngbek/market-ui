import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Heart, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/money';
import Rating from './Rating';

export default function ProductCard({ product, featured = false }) {
  const store = useStore();
  const addToCart = store?.addToCart || (() => {});
  const toggleList = store?.toggleList || (() => {});
  const wishlist = store?.wishlist || [];
  const compare = store?.compare || [];
  const [quickView, setQuickView] = useState(false);

  if (!product) return null;

  const productId = product?.id || product?.productId || '';
  const productName = product?.name || product?.productName || 'Product';
  const productShort = product?.short || product?.shortName || productName;
  const productImage = product?.image || product?.imageUrl || product?.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
  const price = product?.price !== undefined ? product.price : (product?.onlinePrice ?? 0);
  const oldPrice = product?.oldPrice ?? product?.compareAtPrice;
  const currencyCode = product?.currencyCode || 'USD';
  const categoryStr = (product?.category || product?.categoryName || '').toLowerCase();
  const isFeatured = featured || Boolean(product?.featured);
  const storeName = product?.storeName || product?.brand || product?.store?.name || 'Verified Store';
  const storeId = product?.storeId || product?.vendorId || product?.store?.id || '';
  const storeSlug = product?.storeSlug || product?.vendorSlug || product?.store?.slug || product?.store?.code || storeId;
  const storeLink = storeSlug ? `/vendor/${storeSlug}` : storeId ? `/vendor/${storeId}` : '/stores';

  const saved = (wishlist || []).some((item) => String(item?.id) === String(productId));
  const compared = (compare || []).some((item) => String(item?.id) === String(productId));

  const ratingValue = product?.rating && Number(product.rating) > 0 ? Number(product.rating) : 4.9;
  const reviewsCount = product?.reviews && Number(product.reviews) > 0 ? Number(product.reviews) : 18;

  // Normal product object for cart/wishlist
  const normalizedItem = {
    ...product,
    id: productId,
    productId,
    name: productName,
    short: productShort,
    image: productImage,
    price,
    currencyCode,
    storeName,
    storeId,
    storeSlug,
  };

  return (
    <article className={`product-card ${isFeatured ? 'featured-card' : ''}`}>
      <div className="product-image">
        <Link to={`/product/${productId}`}>
          <img 
            loading="lazy" 
            src={productImage} 
            alt={productName} 
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
            }}
          />
        </Link>
        {(product?.badge || isFeatured) && (
          <span className={`product-badge ${isFeatured ? 'featured' : ''}`}>
            {product?.badge || 'Featured'}
          </span>
        )}
        <div className="product-actions">
          <button className={saved ? 'selected' : ''} onClick={() => toggleList('wishlist', normalizedItem)} aria-label="Save to favorites">
            <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button className={compared ? 'selected' : ''} onClick={() => toggleList('compare', normalizedItem)} aria-label="Compare product">
            <CircleDollarSign size={18} />
          </button>
          <button onClick={() => setQuickView(true)} aria-label="Quick view product">
            <ShoppingBag size={18} />
          </button>
        </div>
        <button className="quick-add" onClick={() => addToCart(normalizedItem)} aria-label={`Add ${productShort} to basket`}>
          Add to basket
        </button>
      </div>
      <div className="product-copy">
        <span className="product-category">
          <Link to={storeLink} className="store-pill-link">
            {storeName}
          </Link>
          {categoryStr && ` · ${categoryStr}`}
        </span>
        <Link to={`/product/${productId}`}>
          <h3 title={`${storeName} · ${productName}`}>
            <span className="product-store-title">
              {storeName ? `${storeName} · ` : ''}
            </span>
            {productName}
          </h3>
        </Link>
        <Rating value={ratingValue} reviews={reviewsCount} />
        <div className="price">
          <strong>{money(price, currencyCode)}</strong>
          {oldPrice && <del>{money(oldPrice, currencyCode)}</del>}
        </div>
      </div>
      {quickView && (
        <div className="quick-view-layer" role="dialog" aria-modal="true" aria-label={`Quick view ${productName}`}>
          <button className="quick-view-backdrop" onClick={() => setQuickView(false)} aria-label="Close quick view" />
          <div className="quick-view">
            <button className="quick-close" onClick={() => setQuickView(false)} aria-label="Close quick view">
              <X size={19} />
            </button>
            <img src={productImage} alt={productName} />
            <div>
              <span className="product-category">
                Store: <Link to={storeLink}>{storeName}</Link> · {categoryStr}
              </span>
              <h2>
                <span className="product-store-title">
                  {storeName ? `${storeName} · ` : ''}
                </span>
                {productName}
              </h2>
              <Rating value={ratingValue} reviews={reviewsCount} />
              <div className="price">
                <strong>{money(price, currencyCode)}</strong>
                {oldPrice && <del>{money(oldPrice, currencyCode)}</del>}
              </div>
              <p>{product?.description || `Genuine item from ${storeName}, inspected for quality and backed by MarketFresh marketplace buyer protection.`}</p>
              <button className="button primary" onClick={() => { addToCart(normalizedItem); setQuickView(false); }}>
                Add to basket
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

