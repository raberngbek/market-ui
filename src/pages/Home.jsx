import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  ArrowRight, 
  Store as StoreIcon, 
  ShieldCheck, 
  Timer, 
  HeartHandshake, 
  Truck, 
  CheckCircle2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { getMarketplaceHome } from '../api/marketplace';
import { useStore } from '../context/StoreContext';
import Benefit from '../components/Benefit';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [storePage, setStorePage] = useState(0);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setAccount, setCart, setWishlist } = useStore();

  // Debounce search query changes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setStorePage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch marketplace home data from API
  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMarketplaceHome({
        search: debouncedSearch || undefined,
        categoryId: selectedCategoryId === 'all' ? undefined : selectedCategoryId,
        storePage,
        storeSize: 24,
      });
      setData(result || {});
    } catch (err) {
      console.error('Failed to load marketplace stores:', err);
      setError(err?.message || 'Failed to load marketplace stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, [debouncedSearch, selectedCategoryId, storePage]);

  // Sync user state if account, cart, or favorites are returned in data
  useEffect(() => {
    if (!data) return;

    if (data.account && typeof setAccount === 'function') {
      setAccount((current) => ({ ...current, ...data.account }));
    }

    if (data.cart && typeof setCart === 'function') {
      const incomingItems = Array.isArray(data.cart) 
        ? data.cart 
        : (data.cart.items || []);
      if (incomingItems.length > 0) {
        setCart(incomingItems);
      }
    }

    if ((data.favorites || data.wishlist) && typeof setWishlist === 'function') {
      const favList = data.favorites || data.wishlist;
      if (Array.isArray(favList) && favList.length > 0) {
        setWishlist(favList);
      }
    }
  }, [data, setAccount, setCart, setWishlist]);

  const categories = data?.categories || [];
  const stores = data?.stores?.content || (Array.isArray(data?.stores) ? data.stores : []);
  const storeTotalPages = data?.stores?.totalPages || 1;

  return (
    <main className="stores-directory-page">
      {/* MINIMAL HERO SECTION */}
      <section className="directory-hero">
        <div className="container directory-hero-inner">
          <span className="eyebrow">VERIFIED MULTI-STORE MARKETPLACE</span>
          <h1>Find & Shop Verified Independent Stores</h1>

          {/* SINGLE CONSOLIDATED SEARCH BAR */}
          <div className="directory-search-box">
            <div className="search-input-wrap">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search stores by name, specialty, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search stores"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="clear-query-btn"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC CATEGORY FILTER PILLS CONNECTED TO API CATEGORY IDS */}
          <div className="directory-categories-bar" role="toolbar" aria-label="Filter stores by category">
            <button
              type="button"
              className={`category-pill ${selectedCategoryId === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategoryId('all');
                setStorePage(0);
              }}
            >
              All Stores
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${String(selectedCategoryId) === String(cat.id) ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategoryId(String(cat.id));
                  setStorePage(0);
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ERROR FALLBACK STATE */}
      {error && !loading && (
        <section className="section">
          <div className="container">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
              <AlertCircle size={44} className="text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load marketplace stores</h3>
              <p className="text-red-700 text-sm mb-6">{error}</p>
              <button 
                type="button" 
                className="button primary inline-flex items-center gap-2"
                onClick={loadMarketplaceData}
              >
                <RefreshCw size={15} /> Try Again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* LOADING STATE */}
      {loading && !data && (
        <section className="section">
          <div className="container text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading stores directory...</p>
          </div>
        </section>
      )}

      {/* STORES DIRECTORY - PRIMARY VIEW DIRECTLY UNDERNEATH */}
      {(!loading || data) && (
        <section className="section stores-grid-section">
          <div className="container">
            <div className="directory-results-head">
              <div>
                <span className="eyebrow">VERIFIED MERCHANTS & SPECIALTY SHOPS</span>
                <h2>Stores Directory</h2>
                <p>Browse verified storefronts and shop directly from independent sellers.</p>
              </div>
              <div className="stores-counter">
                <b>{stores.length}</b> {stores.length === 1 ? 'store' : 'stores'} available
              </div>
            </div>

            {stores.length > 0 ? (
              <>
                <div className="stores-grid">
                  {stores.map((store) => {
                    const storeSlugOrId = store.slug || store.code || store.id;
                    const storePath = store.slug || store.code 
                      ? `/vendor/${store.slug || store.code}` 
                      : `/store/${store.id}`;
                    const banner = store.banner || store.image || store.coverImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
                    const avatar = store.avatar || store.logo || store.image;
                    const location = [store.city, store.country || store.countryCode].filter(Boolean).join(', ') || store.location || 'Phnom Penh, Cambodia';
                    const storeType = store.storeType || store.type || store.specialty || store.category || 'Store';

                    return (
                      <article className="store-card" key={store.id || store.slug || store.name}>
                        <div className="store-card-banner">
                          <img 
                            src={banner} 
                            alt={`${store.name} banner`} 
                            loading="lazy" 
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
                            }}
                          />
                          <div className="store-card-badges">
                            <span className="store-card-specialty">{storeType}</span>
                            {store.deliveryTime && (
                              <span className="store-card-delivery">
                                <Clock size={12} /> {store.deliveryTime}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="store-card-body">
                          <div className="store-card-header">
                            <div className="store-card-avatar">
                              {avatar ? (
                                <img 
                                  src={avatar} 
                                  alt={store.name} 
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-lg">
                                  {store.name?.slice(0, 1) || 'S'}
                                </div>
                              )}
                            </div>
                            <div className="store-card-headline">
                              <Link to={storePath} className="store-card-name">
                                <h3>{store.name}</h3>
                              </Link>
                              <div className="store-card-meta">
                                <span className="store-rating">
                                  <Star size={13} fill="#F2B84B" color="#F2B84B" />
                                  <b>{store.rating ?? 4.9}</b>
                                  <small>({store.reviews ?? 128})</small>
                                </span>
                                <span className="meta-dot">·</span>
                                <span className="store-location">
                                  <MapPin size={13} /> {location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="store-card-about">
                            {store.about || store.description || 'Verified merchant providing quality products with direct delivery.'}
                          </p>

                          {store.badges && store.badges.length > 0 && (
                            <div className="store-tags-line">
                              {store.badges.slice(0, 2).map((b) => (
                                <span key={b} className="mini-tag">
                                  <CheckCircle2 size={11} /> {b}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="store-card-footer">
                            <span className="mini-tag">
                              <ShieldCheck size={12} /> Verified Merchant
                            </span>
                            <Link 
                              to={storePath} 
                              className="button primary visit-store-btn"
                              aria-label={`Enter ${store.name}`}
                            >
                              Enter Store <ArrowRight size={15} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Store Pagination if multiple pages */}
                {storeTotalPages > 1 && (
                  <nav className="pagination" aria-label="Stores pagination">
                    <button
                      type="button"
                      disabled={storePage <= 0}
                      onClick={() => setStorePage((prev) => Math.max(0, prev - 1))}
                      aria-label="Previous store page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="flex items-center px-4 text-xs font-semibold text-gray-500">
                      Store Page {storePage + 1} of {storeTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={storePage >= storeTotalPages - 1}
                      onClick={() => setStorePage((prev) => Math.min(storeTotalPages - 1, prev + 1))}
                      aria-label="Next store page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="directory-empty-state">
                <StoreIcon size={46} />
                <h3>No approved stores found</h3>
                <p>
                  {searchQuery 
                    ? `We couldn't find any stores matching "${searchQuery}".` 
                    : 'There are currently no approved stores in this category.'}
                </p>
                {(searchQuery || selectedCategoryId !== 'all') && (
                  <button 
                    type="button" 
                    className="button outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId('all');
                      setStorePage(0);
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* BECOME A SELLER CALL TO ACTION BANNER */}
      <section className="seller-cta-section container">
        <div className="seller-cta-banner">
          <div className="seller-cta-content">
            <span className="seller-cta-badge">
              <Sparkles size={14} /> Open Your Online Shop
            </span>
            <h2>Want to open your own store? Become a seller</h2>
            <p>
              Join verified independent stores, shops, and makers. 
              We handle payment processing, escrow protection, and logistics support so you can focus on growing your business.
            </p>
            <div className="seller-cta-perks">
              <span><CheckCircle2 size={16} /> Zero upfront setup fees</span>
              <span><CheckCircle2 size={16} /> Direct weekly payouts</span>
              <span><CheckCircle2 size={16} /> Verified buyer reach</span>
            </div>
            <Link to="/vendor/register" className="button primary seller-apply-btn">
              Apply to Open a Store <ArrowRight size={17} />
            </Link>
          </div>
          <div className="seller-cta-visual">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85" 
              alt="Merchant preparing store catalog" 
              loading="lazy" 
            />
          </div>
        </div>
      </section>

      {/* PLATFORM BENEFITS ASSURANCE */}
      <section className="benefit-section">
        <div className="container benefits">
          <Benefit
            icon={Timer}
            title="Fast Express Delivery"
            text="Same-day local dispatch & express freight"
          />
          <Benefit
            icon={ShieldCheck}
            title="100% Verified Stores"
            text="Authorized tech dealers & certified shops"
          />
          <Benefit
            icon={HeartHandshake}
            title="Support Independent Shops"
            text="Direct sales with guaranteed buyer protection"
          />
          <Benefit
            icon={Truck}
            title="Consolidated Cart"
            text="Combine phones, cars, fashion & food in 1 checkout"
          />
        </div>
      </section>
    </main>
  );
}
