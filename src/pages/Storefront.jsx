import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  Star, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronRight,
  Store as StoreIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { stores as mockStores, products as mockProducts, getStoreById as getMockStoreById } from '../data/catalog';
import { getMarketplaceStoreById, getMarketplaceProducts, normalizeProduct } from '../api/marketplace';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/money';

export default function Storefront() {
  const { storeId, slug } = useParams();
  const targetId = storeId || slug;

  const [store, setStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const { notify } = useStore();

  // Load store details & store products
  const fetchStoreData = async () => {
    if (!targetId) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Try fetching store from API
      let resolvedStore = await getMarketplaceStoreById(targetId);
      let resolvedProducts = [];

      if (resolvedStore) {
        // Fetch products matching this store ID from API
        try {
          const prodsRes = await getMarketplaceProducts({ storeId: resolvedStore.id, size: 100 });
          const list = Array.isArray(prodsRes?.content) ? prodsRes.content : (Array.isArray(prodsRes) ? prodsRes : []);
          resolvedProducts = list.map(normalizeProduct);
        } catch (prodErr) {
          console.warn('Failed to load store products from API:', prodErr.message);
        }
      } else {
        // Fallback to local catalog for mock stores
        const mockStore = getMockStoreById(targetId) || mockStores.find((s) => s.id === targetId || s.slug === targetId);
        if (mockStore) {
          resolvedStore = mockStore;
          resolvedProducts = mockProducts.filter((p) => 
            p.storeId === mockStore.id || 
            p.brand === mockStore.name || 
            (p.storeName && p.storeName.toLowerCase() === mockStore.name.toLowerCase())
          ).map(normalizeProduct);
        }
      }

      setStore(resolvedStore || null);
      setStoreProducts(resolvedProducts);
      setSelectedCategory('All Items');
    } catch (err) {
      console.error('Error loading storefront:', err);
      setError(err?.message || 'Failed to load store details. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [targetId]);

  // Extract distinct categories dynamically from the store's products
  const storeCategories = useMemo(() => {
    const cats = new Set(
      storeProducts
        .map((p) => p.category || p.categoryName)
        .filter(Boolean)
    );
    return ['All Items', ...Array.from(cats)];
  }, [storeProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return storeProducts
      .filter((product) => {
        const prodCat = product.category || product.categoryName || '';
        const matchesCategory = selectedCategory === 'All Items' || prodCat.toLowerCase() === selectedCategory.toLowerCase();
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || 
          (product.name && product.name.toLowerCase().includes(q)) ||
          (product.short && product.short.toLowerCase().includes(q)) ||
          (product.description && product.description.toLowerCase().includes(q)) ||
          prodCat.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.sold || 0) - (a.sold || 0);
      });
  }, [storeProducts, selectedCategory, searchQuery, sortBy]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      notify('Store link copied to clipboard!');
    }
  };

  // Loading state
  if (loading && !store) {
    return (
      <main className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Loading store profile and products...</p>
      </main>
    );
  }

  // Error state
  if (error && !store) {
    return (
      <main className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
          <AlertCircle size={44} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Store Unavailable</h2>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button type="button" className="button primary" onClick={fetchStoreData}>
              <RefreshCw size={15} /> Try Again
            </button>
            <Link to="/" className="button outline">
              Back to Stores
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Not found state
  if (!store) {
    return (
      <main className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Store Not Found</h2>
        <p>The shop you were looking for does not exist or has moved.</p>
        <Link to="/" className="button primary" style={{ marginTop: '20px' }}>
          Back to Stores Directory
        </Link>
      </main>
    );
  }

  const banner = store.banner || store.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
  const avatar = store.avatar || store.logo || store.image;
  const location = store.location || [store.city, store.countryCode || store.country].filter(Boolean).join(', ') || 'Phnom Penh, Cambodia';
  const storeType = store.storeType || store.specialty || 'General Retail';
  const hours = store.hours || store.openingHoursFormatted || 'Mon - Sun: 09:00 - 18:00';
  const deliveryTime = store.deliveryTime || 'Same-day delivery (1-3 hrs)';
  const phone = store.phone || '+855 (0) 23 888 999';
  const email = store.email || 'support@shopify.kh';
  const minOrder = store.minOrder ? money(store.minOrder, store.currencyCode || 'USD') : '$0.00';

  return (
    <main className="storefront-page">
      {/* STORE HERO BANNER */}
      <section className="store-banner-wrap">
        <div 
          className="store-banner-bg" 
          style={{ backgroundImage: `url(${banner})` }}
        >
          <div className="store-banner-overlay" />
        </div>

        <div className="container store-header-container">
          <div className="store-nav-breadcrumb">
            <Link to="/" className="store-back-link">
              <ArrowLeft size={16} /> Back to all stores
            </Link>
          </div>

          <div className="store-header-card">
            <div className="store-identity">
              <div className="store-avatar-wrap">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={store.name} 
                    className="store-avatar-img"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-2xl">
                    {store.name?.slice(0, 1) || 'S'}
                  </div>
                )}
              </div>
              <div className="store-title-area">
                <div className="store-badge-line">
                  <span className="store-specialty-badge">{storeType}</span>
                  <span className="store-verified-pill">
                    <CheckCircle2 size={13} /> Verified Store
                  </span>
                </div>
                <h1 className="store-name">{store.name}</h1>
                <div className="store-meta-line">
                  <span className="store-rating">
                    <Star size={15} fill="#F2B84B" color="#F2B84B" />
                    <b>{store.rating ?? 4.9}</b>
                    <small>({store.reviews ?? 128} reviews)</small>
                  </span>
                  <span className="meta-separator">·</span>
                  <span className="store-location">
                    <MapPin size={14} /> {location}
                  </span>
                  <span className="meta-separator">·</span>
                  <span className="store-delivery-time">
                    <Clock size={14} /> {hours}
                  </span>
                </div>
              </div>
            </div>

            <p className="store-description">
              {store.about || store.description || `Verified independent seller located in ${location}. Quality inspected products with direct dispatch.`}
            </p>

            <div className="store-highlights-bar">
              <div className="store-highlight-item">
                <Truck size={17} />
                <span>
                  <b>Min order {minOrder}</b>
                  <small>{deliveryTime}</small>
                </span>
              </div>
              <div className="store-highlight-item">
                <Clock size={17} />
                <span>
                  <b>{hours}</b>
                  <small>Operating Hours</small>
                </span>
              </div>
              <div className="store-highlight-item">
                <Phone size={17} />
                <span>
                  <b>{phone}</b>
                  <small>{email}</small>
                </span>
              </div>
              <div className="store-header-actions">
                <button type="button" onClick={handleShare} className="button outline small">
                  Share Store
                </button>
                <Link to="/contact" className="button primary small">
                  Contact Store
                </Link>
              </div>
            </div>

            {store.badges && store.badges.length > 0 && (
              <div className="store-badges-row">
                {store.badges.map((badge) => (
                  <span key={badge} className="store-feature-tag">
                    <ShieldCheck size={13} /> {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STORE PRODUCTS CATALOG */}
      <section className="store-catalog-section">
        <div className="container">
          <div className="store-catalog-header">
            <div>
              <span className="eyebrow">STORE CATALOG</span>
              <h2>Products from {store.name}</h2>
              <p>Explore items sold directly by this verified merchant.</p>
            </div>

            <div className="store-search-sort">
              <div className="store-search-field">
                <Search size={17} />
                <input
                  type="text"
                  placeholder={`Search in ${store.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search store products"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="clear-search-btn"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                className="store-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* CATEGORY TABS FOR THIS STORE */}
          {storeCategories.length > 1 && (
            <div className="store-categories-tabs" role="tablist" aria-label="Store departments">
              {storeCategories.map((cat) => {
                const count = cat === 'All Items'
                  ? storeProducts.length
                  : storeProducts.filter((p) => (p.category || p.categoryName || '').toLowerCase() === cat.toLowerCase()).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === cat}
                    className={`store-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                    <span className="tab-count">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* STORE PRODUCTS GRID */}
          {filteredProducts.length > 0 ? (
            <div className="product-grid storefront-product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id || product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="store-empty-catalog">
              <ShoppingBag size={44} />
              <h3>No items found in this section</h3>
              <p>Try clearing your search query or selecting another category.</p>
              <button
                type="button"
                className="button outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Items');
                }}
              >
                Show All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SELLER PLEDGE / LOCAL ASSURANCE */}
      <section className="store-pledge-section">
        <div className="container store-pledge-card">
          <div>
            <span className="eyebrow">DIRECT FROM THE SOURCE</span>
            <h3>100% Guaranteed Authentic from {store.name}</h3>
            <p>
              Every order from this store is packed with care and fulfilled with tracked delivery.
              If anything does not meet your complete satisfaction, we provide an immediate replacement or full refund.
            </p>
          </div>
          <Link to="/contact" className="button outline">
            Questions about this store?
          </Link>
        </div>
      </section>
    </main>
  );
}
