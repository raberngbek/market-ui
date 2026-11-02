import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck, ZoomIn } from 'lucide-react';
import { products, stores } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/money';
import ProductCard from '../components/ProductCard';
import Rating from '../components/Rating';
import Breadcrumb from '../components/Breadcrumb';

function Quantity({ value, setValue, stock }) {
  return (
    <div className="quantity-control large">
      <button disabled={value <= 1} onClick={() => setValue(value - 1)} aria-label="Decrease quantity">
        <Minus size={16} />
      </button>
      <span>{value}</span>
      <button disabled={value >= stock} onClick={() => setValue(value + 1)} aria-label="Increase quantity">
        <Plus size={16} />
      </button>
    </div>
  );
}

function DetailsTabs({ product, store }) {
  const [tab, setTab] = useState('description');
  return (
    <section id="reviews" className="details-tabs">
      <div role="tablist">
        {[
          ['description', 'Description'],
          ['specs', 'Specifications'],
          ['shipping', 'Shipping & Delivery'],
          ['reviews', `Reviews (${product.reviews})`]
        ].map(([key, label]) => (
          <button
            role="tab"
            key={key}
            aria-selected={tab === key}
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'description' && (
        <div className="tab-content">
          <h2>Product Overview</h2>
          <p>
            {product.description || `${product.name} from ${product.storeName || product.brand || store?.name} is verified for quality, authenticity, and premium performance.`}
          </p>
          <ul>
            <li>Direct from verified merchant: {product.storeName || product.brand || store?.name}</li>
            <li>Original packaging with verified serials and documentation</li>
            <li>Inspected before dispatch for complete quality assurance</li>
          </ul>
        </div>
      )}
      {tab === 'specs' && (
        <div className="spec-grid">
          <span>Store / Merchant<b>{product.storeName || product.brand || store?.name}</b></span>
          <span>Department<b>{product.category}</b></span>
          <span>Availability<b>{product.stock} in stock</b></span>
          <span>Item code<b>MF-{product.id.slice(0, 5).toUpperCase()}</b></span>
        </div>
      )}
      {tab === 'shipping' && (
        <div className="tab-content">
          <h2>Fast & Tracked Delivery</h2>
          <p>
            Orders are fulfilled directly by {product.storeName || 'the verified merchant'} with fast dispatch and end-to-end tracking. Eligible for combined consolidated delivery at checkout.
          </p>
        </div>
      )}
      {tab === 'reviews' && (
        <div className="reviews">
          <Rating value={product.rating} />
          <h2>Customer Feedback</h2>
          <article>
            <b>“Exactly as described and arrived fast.”</b>
            <p>Authentic quality, solid packaging, and great communication from {product.storeName || 'the seller'}.</p>
            <small>— Jamie L. · Verified Buyer</small>
          </article>
          <article>
            <b>“Highly recommend this seller.”</b>
            <p>Arrived in perfect condition right on schedule.</p>
            <small>— Morgan P. · Verified Buyer</small>
          </article>
        </div>
      )}
    </section>
  );
}

export default function Product() {
  const { id, layout } = useParams();
  const product = products.find((item) => item.id === id) || products[0];
  const [activeImage, setActiveImage] = useState(product?.gallery?.[0]);
  const [option, setOption] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const { addToCart, toggleList, wishlist } = useStore();

  const store = useMemo(() => {
    if (!product) return null;
    return (
      stores.find((s) => s.id === product.storeId) || {
        id: product.storeId || 'good-earth-farm',
        name: product.storeName || product.brand || 'Local Producer',
        specialty: 'Independent Local Store',
        about: 'Fresh seasonal staples direct from verified neighborhood growers and makers.',
        rating: product.rating || 4.9,
        reviews: product.reviews || 100,
        avatar: product.image
      }
    );
  }, [product]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.gallery?.[0]);
      setOption(product.colors?.[0]);
      setQuantity(1);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
      </div>
    );
  }

  const saved = wishlist.some((item) => item.id === product.id);
  const related = useMemo(
    () => products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4),
    [product]
  );

  return (
    <main className={`product-page layout-${layout || '1'}`}>
      <div className="container">
        <Breadcrumb current={product.short} category={product.category} />
        <div className="detail-layout">
          <section className="product-gallery">
            <div className="thumbs">
              {product.gallery.map((image, index) => (
                <button
                  key={image}
                  className={activeImage === image ? 'active' : ''}
                  onClick={() => setActiveImage(image)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
            <div className="main-product-image">
              <img src={activeImage} alt={product.name} />
              <button className="zoom-button" onClick={() => setZoom(true)} aria-label="Zoom image">
                <ZoomIn size={20} />
              </button>
              {product.badge && <span className="product-badge">{product.badge}</span>}
            </div>
            {layout === '2' &&
              product.gallery.slice(1).map((image) => (
                <button
                  key={image}
                  className="gallery-extra"
                  onClick={() => setActiveImage(image)}
                  aria-label="View gallery image"
                >
                  <img src={image} alt="" />
                </button>
              ))}
          </section>

          <section className="product-info">
            <span className="product-category">
              {product.category} · Sourced from{' '}
              <Link to={`/store/${product.storeId || store?.id || ''}`} className="store-pill-link">
                {product.storeName || product.brand || store?.name}
              </Link>
            </span>
            <h1>
              <span className="product-store-title">
                {product.storeName || product.brand ? `${product.storeName || product.brand} · ` : ''}
              </span>
              {product.name}
            </h1>
            <div className="review-line">
              <Rating value={product.rating} reviews={product.reviews} />
              <span>·</span>
              <a href="#reviews">{product.reviews} reviews</a>
              <span>·</span>
              <span>Verified Merchant</span>
            </div>
            <div className="detail-price">
              <strong>{money(product.price)}</strong>
              {product.oldPrice && (
                <>
                  <del>{money(product.oldPrice)}</del>
                  <span>Save {money(product.oldPrice - product.price)}</span>
                </>
              )}
            </div>
            <p className="product-intro">
              {product.about || `Genuine item from ${product.storeName || product.brand || 'verified seller'}, inspected for quality and backed by MarketFresh marketplace buyer protection.`}
            </p>
            <div className="stock-note">
              <span>
                <Check size={14} /> In Stock & Ready to Ship
              </span>
              <span>{product.stock} units available</span>
            </div>
            <div className="flash-box">
              <span>MARKETPLACE SPECIAL</span>
              <b>Extra 10% off verified items with coupon</b>
              <small>
                Use code <b>FRESH10</b> at checkout
              </small>
            </div>
            <div className="variants">
              <div>
                <b>Options:</b> <span>Standard Edition</span>
              </div>
              <div className="color-options">
                {product.colors.map((choice) => (
                  <button
                    key={choice}
                    aria-label="Select product option"
                    className={option === choice ? 'active' : ''}
                    style={{ backgroundColor: choice }}
                    onClick={() => setOption(choice)}
                  />
                ))}
              </div>
            </div>
            <div className="purchase-actions">
              <Quantity value={quantity} setValue={setQuantity} stock={product.stock} />
              <button
                className="button primary add-main"
                onClick={() => addToCart(product, quantity, { option })}
              >
                <ShoppingBag size={18} /> Add to basket
              </button>
              <button
                className={saved ? 'wish-button selected' : 'wish-button'}
                onClick={() => toggleList('wishlist', product)}
                aria-label="Save to favorites"
              >
                <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
            <Link
              to="/checkout"
              onClick={() => addToCart(product, quantity, { option })}
              className="buy-now"
            >
              Proceed to Checkout
            </Link>
            <div className="product-assurances">
              <span>
                <Truck size={19} />
                <b>Fast delivery</b>
                <small>Tracked express shipping</small>
              </span>
              <span>
                <RotateCcw size={19} />
                <b>Buyer protection</b>
                <small>30-day hassle-free returns</small>
              </span>
              <span>
                <ShieldCheck size={19} />
                <b>100% authentic</b>
                <small>Verified seller guarantee</small>
              </span>
            </div>
          </section>
        </div>

        <DetailsTabs product={product} store={store} />

        {/* VERIFIED LOCAL STORE CARD */}
        {store && (
          <section className="seller-card">
            <div className="seller-avatar" style={{ overflow: 'hidden', padding: 0 }}>
              {store.avatar ? (
                <img
                  src={store.avatar}
                  alt={store.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                'F'
              )}
            </div>
            <div>
              <span className="eyebrow">VERIFIED LOCAL STORE</span>
              <h2>{store.name}</h2>
              <p>{store.about || store.specialty}</p>
            </div>
            <div className="seller-stats">
              <span>
                <b>{store.rating} / 5</b> rating
              </span>
              <span>
                <b>{store.reviews}+</b> verified reviews
              </span>
            </div>
            <Link className="button outline small" to={`/store/${product.storeId || store.id}`}>
              Visit Store Catalog →
            </Link>
          </section>
        )}

        <section className="related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">RECOMMENDED FOR YOU</span>
              <h2>More in {product.category}</h2>
            </div>
            <Link className="text-link" to={`/category/${encodeURIComponent(product.category)}`}>
              Explore category →
            </Link>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </div>

      <div className="sticky-product-bar">
        <div>
          <img src={product.image} alt="" />
          <span>
            {product.short}
            <b>{money(product.price)}</b>
          </span>
        </div>
        <button className="button primary" onClick={() => addToCart(product, quantity, { option })}>
          Add to basket
        </button>
      </div>

      {zoom && (
        <div className="image-modal" role="dialog" aria-modal="true">
          <button onClick={() => setZoom(false)} className="icon-button" aria-label="Close zoom">
            ×
          </button>
          <img src={activeImage} alt={product.name} />
        </div>
      )}
    </main>
  );
}
