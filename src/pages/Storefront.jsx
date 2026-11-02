import React, { useState, useMemo } from 'react';
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
  SlidersHorizontal, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronRight,
  Store as StoreIcon 
} from 'lucide-react';
import { stores, products, getStoreById } from '../data/catalog';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import { useStore } from '../context/StoreContext';

export default function Storefront() {
  const { storeId, slug } = useParams();
  const targetId = storeId || slug;
  const store = getStoreById(targetId) || stores.find((s) => s.id === targetId || s.slug === targetId) || stores[0];

  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const { notify } = useStore();

  // Find all products strictly belonging to this store
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return products.filter((p) => 
      p.storeId === store.id || 
      p.brand === store.name || 
      (p.storeName && p.storeName.toLowerCase() === store.name.toLowerCase())
    );
  }, [store]);

  // Extract distinct categories present in this store
  const storeCategories = useMemo(() => {
    const cats = new Set(storeProducts.map((p) => p.category));
    return ['All Items', ...Array.from(cats)];
  }, [storeProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return storeProducts
      .filter((product) => {
        const matchesCategory = selectedCategory === 'All Items' || product.category === selectedCategory;
        const matchesSearch = !searchQuery.trim() || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.short.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (b.sold || 0) - (a.sold || 0);
      });
  }, [storeProducts, selectedCategory, searchQuery, sortBy]);

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      notify('Store link copied to clipboard!');
    }
  };

  return (
    <main className="storefront-page">
      {/* STORE HERO BANNER */}
      <section className="store-banner-wrap">
        <div 
          className="store-banner-bg" 
          style={{ backgroundImage: `url(${store.banner})` }}
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
                <img src={store.avatar} alt={store.name} className="store-avatar-img" />
              </div>
              <div className="store-title-area">
                <div className="store-badge-line">
                  <span className="store-specialty-badge">{store.specialty}</span>
                  <span className="store-verified-pill">
                    <CheckCircle2 size={13} /> Verified Store
                  </span>
                </div>
                <h1 className="store-name">{store.name}</h1>
                <div className="store-meta-line">
                  <span className="store-rating">
                    <Star size={15} fill="#f3bd44" color="#f3bd44" />
                    <b>{store.rating}</b>
                    <small>({store.reviews} reviews)</small>
                  </span>
                  <span className="meta-separator">·</span>
                  <span className="store-location">
                    <MapPin size={14} /> {store.location}
                  </span>
                  <span className="meta-separator">·</span>
                  <span className="store-delivery-time">
                    <Clock size={14} /> {store.deliveryTime}
                  </span>
                </div>
              </div>
            </div>

            <p className="store-description">{store.about}</p>

            <div className="store-highlights-bar">
              <div className="store-highlight-item">
                <Truck size={17} />
                <span>
                  <b>Min order ${store.minOrder}</b>
                  <small>Free delivery on orders $35+</small>
                </span>
              </div>
              <div className="store-highlight-item">
                <Clock size={17} />
                <span>
                  <b>{store.hours}</b>
                  <small>Prepared fresh to order</small>
                </span>
              </div>
              <div className="store-highlight-item">
                <Phone size={17} />
                <span>
                  <b>{store.phone}</b>
                  <small>{store.email}</small>
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
              <p>Explore farm-fresh groceries and specialties sold directly by this producer.</p>
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
          <div className="store-categories-tabs">
            {storeCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`store-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="tab-count">
                  {cat === 'All Items'
                    ? storeProducts.length
                    : storeProducts.filter((p) => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* STORE PRODUCTS GRID */}
          {filteredProducts.length > 0 ? (
            <div className="product-grid storefront-product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
            <h3>100% Guaranteed Fresh from {store.name}</h3>
            <p>
              Every order from this store is packed in temperature-controlled totes by local food couriers.
              If anything is not completely fresh, we provide an immediate replacement or full refund.
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
