import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck, ZoomIn, AlertCircle, RefreshCw } from 'lucide-react';
import { products as mockProducts, stores as mockStores } from '../data/catalog';
import { getMarketplaceProductById, normalizeProduct } from '../api/marketplace';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/money';
import ProductCard from '../components/ProductCard';
import Rating from '../components/Rating';
import Breadcrumb from '../components/Breadcrumb';

function Quantity({ value, setValue, stock = 50 }) {
  const maxStock = Math.max(1, stock);
  return (
    <div className="quantity-control large">
      <button disabled={value <= 1} onClick={() => setValue(Math.max(1, value - 1))} aria-label="Decrease quantity">
        <Minus size={16} />
      </button>
      <span>{value}</span>
      <button disabled={value >= maxStock} onClick={() => setValue(Math.min(maxStock, value + 1))} aria-label="Increase quantity">
        <Plus size={16} />
      </button>
    </div>
  );
}

function DetailsTabs({ product, store }) {
  const [tab, setTab] = useState('description');
  const codeSuffix = String(product?.id || '').slice(0, 5).toUpperCase() || 'PROD';

  return (
    <section id="reviews" className="details-tabs">
      <div role="tablist">
        {[
          ['description', 'Description'],
          ['specs', 'Specifications'],
          ['shipping', 'Shipping & Delivery'],
          ['reviews', `Reviews (${product?.reviews ?? 18})`]
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
            {product?.description || `${product?.name} from ${product?.storeName || store?.name || 'verified seller'} is verified for authentic quality and reliable freshness.`}
          </p>
          <ul>
            <li>Direct from verified merchant: {product?.storeName || store?.name || 'Shopify'}</li>
            <li>Properly handled and inspected before dispatch</li>
            <li>Backed by MarketFresh satisfaction and authenticity promise</li>
          </ul>
        </div>
      )}
      {tab === 'specs' && (
        <div className="spec-grid">
          <span>Store / Merchant<b>{product?.storeName || store?.name || 'Shopify'}</b></span>
          <span>Department<b>{product?.category || 'General'}</b></span>
          <span>Availability<b>{product?.stock ?? 50} in stock</b></span>
          <span>Item code<b>MF-{codeSuffix}</b></span>
        </div>
      )}
      {tab === 'shipping' && (
        <div className="tab-content">
          <h2>Fast & Tracked Delivery</h2>
          <p>
            Orders are fulfilled directly by {product?.storeName || store?.name || 'the verified merchant'} with rapid dispatch and real-time tracking. Eligible for combined consolidated delivery at checkout.
          </p>
        </div>
      )}
      {tab === 'reviews' && (
        <div className="reviews">
          <Rating value={product?.rating ?? 4.9} />
          <h2>Customer Feedback</h2>
          <article>
            <b>“Exactly as described and arrived fresh.”</b>
            <p>Authentic quality, solid packaging, and great communication from {product?.storeName || store?.name || 'the seller'}.</p>
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState('');
  const [option, setOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const { addToCart, toggleList, wishlist } = useStore();

  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      // Check mock catalog first
      const foundInMock = mockProducts.find((item) => String(item.id) === String(id));
      if (foundInMock) {
        const normalized = normalizeProduct(foundInMock);
        setProduct(normalized);
        setActiveImage(normalized.gallery?.[0] || normalized.image);
        setOption(normalized.colors?.[0] || 'Default');
        return;
      }

      // Fetch from API
      const apiItem = await getMarketplaceProductById(id);
      if (apiItem) {
        const normalized = normalizeProduct(apiItem);
        setProduct(normalized);
        setActiveImage(normalized.gallery?.[0] || normalized.image);
        setOption(normalized.colors?.[0] || 'Default');
        return;
      }

      // Fallback
      if (mockProducts.length > 0) {
        const fallback = normalizeProduct(mockProducts[0]);
        setProduct(fallback);
        setActiveImage(fallback.gallery?.[0] || fallback.image);
        setOption(fallback.colors?.[0] || 'Default');
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      // Fallback to first mock product if available to ensure shopping continuity
      if (mockProducts.length > 0) {
        const fallback = normalizeProduct(mockProducts[0]);
        setProduct(fallback);
        setActiveImage(fallback.gallery?.[0] || fallback.image);
      } else {
        setError(err?.message || 'Failed to load product details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const store = useMemo(() => {
    if (!product) return null;
    const foundStore = mockStores.find((s) => String(s.id) === String(product.storeId));
    if (foundStore) return foundStore;

    return {
      id: product.storeId || 2,
      slug: product.storeSlug || 'MAIN',
      name: product.storeName || 'Shopify',
      specialty: 'Verified Independent Store',
      about: 'Quality products direct from verified neighborhood growers and makers.',
      rating: product.rating || 4.9,
      reviews: product.reviews || 100,
      avatar: product.image,
    };
  }, [product]);

  if (loading && !product) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
          <AlertCircle size={44} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Product Not Found</h2>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button type="button" className="button primary" onClick={loadProduct}>
              <RefreshCw size={15} /> Try Again
            </button>
            <Link to="/" className="button outline">
              Browse Stores
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/" className="button primary" style={{ marginTop: '1rem' }}>
          Back to Stores Directory
        </Link>
      </div>
    );
  }

  const saved = wishlist.some((item) => String(item.id) === String(product.id));
  const gallery = (Array.isArray(product.gallery) && product.gallery.length > 0) 
    ? product.gallery 
    : [product.image];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const stock = product.stock || product.stockQuantity || 50;
  const storeLink = product.storeSlug 
    ? `/vendor/${product.storeSlug}` 
    : (product.storeId ? `/store/${product.storeId}` : '/');

  const related = mockProducts
    .filter((item) => item.category === product.category && String(item.id) !== String(product.id))
    .slice(0, 4)
    .map(normalizeProduct);

  return (
    <main className={`product-page layout-${layout || '1'}`}>
      <div className="container">
        <Breadcrumb current={product.short} category={product.category} />
        <div className="detail-layout">
          <section className="product-gallery">
            <div className="thumbs">
              {gallery.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  className={activeImage === img ? 'active' : ''}
                  onClick={() => setActiveImage(img)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt="" onError={(e) => { e.currentTarget.src = product.image; }} />
                </button>
              ))}
            </div>
            <div className="main-product-image">
              <img 
                src={activeImage || product.image} 
                alt={product.name} 
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <button className="zoom-button" onClick={() => setZoom(true)} aria-label="Zoom image">
                <ZoomIn size={20} />
              </button>
              {product.badge && <span className="product-badge">{product.badge}</span>}
            </div>
            {layout === '2' &&
              gallery.slice(1).map((img, idx) => (
                <button
                  key={`extra-${img}-${idx}`}
                  className="gallery-extra"
                  onClick={() => setActiveImage(img)}
                  aria-label="View gallery image"
                >
                  <img src={img} alt="" />
                </button>
              ))}
          </section>

          <section className="product-info">
            <span className="product-category">
              {product.category} · Sourced from{' '}
              <Link to={storeLink} className="store-pill-link">
                {product.storeName || store?.name}
              </Link>
            </span>
            <h1>
              <span className="product-store-title">
                {product.storeName ? `${product.storeName} · ` : ''}
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
              <strong>{money(product.price, product.currencyCode)}</strong>
              {product.oldPrice && (
                <>
                  <del>{money(product.oldPrice, product.currencyCode)}</del>
                  <span>Save {money(product.oldPrice - product.price, product.currencyCode)}</span>
                </>
              )}
            </div>
            <p className="product-intro">
              {product.description || `Genuine item from ${product.storeName}, inspected for quality and backed by MarketFresh marketplace buyer protection.`}
            </p>
            <div className="stock-note">
              <span>
                <Check size={14} /> In Stock & Ready to Ship
              </span>
              <span>{stock} units available</span>
            </div>
            <div className="flash-box">
              <span>MARKETPLACE SPECIAL</span>
              <b>Extra 10% off verified items with coupon</b>
              <small>
                Use code <b>FRESH10</b> at checkout
              </small>
            </div>
            {colors.length > 0 && (
              <div className="variants">
                <div>
                  <b>Options:</b> <span>Standard Edition</span>
                </div>
                <div className="color-options">
                  {colors.map((choice) => (
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
            )}
            <div className="purchase-actions">
              <Quantity value={quantity} setValue={setQuantity} stock={stock} />
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
            <Link className="button outline small" to={storeLink}>
              Visit Store Catalog →
            </Link>
          </section>
        )}

        {related.length > 0 && (
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
        )}
      </div>

      <div className="sticky-product-bar">
        <div>
          <img src={product.image} alt="" />
          <span>
            {product.short}
            <b>{money(product.price, product.currencyCode)}</b>
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
          <img src={activeImage || product.image} alt={product.name} />
        </div>
      )}
    </main>
  );
}
