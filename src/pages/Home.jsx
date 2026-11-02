import React, { useState, useMemo } from 'react';
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
  ShoppingBag,
  Grid
} from 'lucide-react';
import { stores, storeCategories, products } from '../data/catalog';
import ProductCard from '../components/ProductCard';
import Benefit from '../components/Benefit';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Stores');

  const isStoresDirectory = selectedCategory === 'All Stores';

  // Stores matching current category & search
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const sCat = (store.category || '').toLowerCase();
      const sel = selectedCategory.toLowerCase();
      let matchCategory = false;

      if (selectedCategory === 'All Stores') {
        matchCategory = true;
      } else if (sel.includes('phone') || sel.includes('tech')) {
        matchCategory = sCat.includes('phone') || sCat.includes('tech') || store.specialty.toLowerCase().includes('tech') || store.specialty.toLowerCase().includes('phone');
      } else if (sel.includes('car') || sel.includes('auto')) {
        matchCategory = sCat.includes('car') || sCat.includes('auto') || store.specialty.toLowerCase().includes('auto') || store.specialty.toLowerCase().includes('car');
      } else if (sel.includes('fashion') || sel.includes('apparel')) {
        matchCategory = sCat.includes('fashion') || sCat.includes('apparel') || store.specialty.toLowerCase().includes('streetwear') || store.specialty.toLowerCase().includes('fashion');
      } else if (sel.includes('home') || sel.includes('living')) {
        matchCategory = sCat.includes('home') || sCat.includes('living') || store.specialty.toLowerCase().includes('furniture');
      } else if (sel.includes('beauty') || sel.includes('wellness')) {
        matchCategory = sCat.includes('beauty') || sCat.includes('wellness') || store.specialty.toLowerCase().includes('skincare');
      } else if (sel.includes('produce')) {
        matchCategory = sCat.includes('produce') || store.specialty.toLowerCase().includes('produce') || store.specialty.toLowerCase().includes('fruit');
      } else if (sel.includes('meal') || sel.includes('prepared')) {
        matchCategory = sCat.includes('prepared') || store.specialty.toLowerCase().includes('meal') || store.specialty.toLowerCase().includes('deli');
      } else if (sel.includes('bakery')) {
        matchCategory = sCat.includes('bakery') || store.specialty.toLowerCase().includes('bread') || store.specialty.toLowerCase().includes('pastries');
      } else if (sel.includes('seafood')) {
        matchCategory = sCat.includes('seafood') || store.specialty.toLowerCase().includes('seafood') || store.specialty.toLowerCase().includes('fish');
      } else if (sel.includes('dairy') || sel.includes('egg')) {
        matchCategory = sCat.includes('dairy') || store.specialty.toLowerCase().includes('dairy') || store.specialty.toLowerCase().includes('egg');
      } else if (sel.includes('pantry')) {
        matchCategory = sCat.includes('pantry') || store.specialty.toLowerCase().includes('olive') || store.specialty.toLowerCase().includes('oil');
      } else if (sel.includes('drink')) {
        matchCategory = sCat.includes('drink') || store.specialty.toLowerCase().includes('tonic') || store.specialty.toLowerCase().includes('drink');
      } else {
        matchCategory = sCat === sel || store.specialty.toLowerCase().includes(sel);
      }

      const searchStr = `${store.name} ${store.specialty} ${store.category} ${store.location} ${store.about}`.toLowerCase();
      const matchSearch = !searchQuery.trim() || searchStr.includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Direct products matching the selected category & search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const pCat = (product.category || '').toLowerCase();
      const sel = selectedCategory.toLowerCase();
      let matchCategory = false;

      if (selectedCategory === 'All Stores') {
        matchCategory = true;
      } else if (sel.includes('phone') || sel.includes('tech')) {
        matchCategory = pCat.includes('phone') || pCat.includes('tech') || pCat.includes('gadget');
      } else if (sel.includes('car') || sel.includes('auto')) {
        matchCategory = pCat.includes('car') || pCat.includes('auto') || pCat.includes('motor');
      } else if (sel.includes('fashion') || sel.includes('apparel')) {
        matchCategory = pCat.includes('fashion') || pCat.includes('apparel') || pCat.includes('clothing') || pCat.includes('shoe');
      } else if (sel.includes('home') || sel.includes('living')) {
        matchCategory = pCat.includes('home') || pCat.includes('living') || pCat.includes('furniture');
      } else if (sel.includes('beauty') || sel.includes('wellness')) {
        matchCategory = pCat.includes('beauty') || pCat.includes('wellness') || pCat.includes('skin');
      } else if (sel.includes('produce')) {
        matchCategory = pCat.includes('produce') || pCat.includes('organic') || pCat.includes('fruit') || pCat.includes('vegetable');
      } else if (sel.includes('meal') || sel.includes('prepared')) {
        matchCategory = pCat.includes('ready') || pCat.includes('meal') || pCat.includes('deli');
      } else if (sel.includes('seafood')) {
        matchCategory = pCat.includes('seafood') || pCat.includes('meat') || pCat.includes('fish');
      } else if (sel.includes('dairy') || sel.includes('egg')) {
        matchCategory = pCat.includes('dairy') || pCat.includes('egg');
      } else if (sel.includes('bakery')) {
        matchCategory = pCat.includes('bakery') || pCat.includes('bread');
      } else if (sel.includes('pantry')) {
        matchCategory = pCat.includes('pantry') || pCat.includes('oil');
      } else if (sel.includes('drink')) {
        matchCategory = pCat.includes('drink') || pCat.includes('water');
      } else {
        matchCategory = pCat.includes(sel);
      }

      const searchStr = `${product.name} ${product.short} ${product.category} ${product.brand} ${product.storeName || ''}`.toLowerCase();
      const matchSearch = !searchQuery.trim() || searchStr.includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main className="stores-directory-page">
      {/* DIRECTORY HERO */}
      <section className="directory-hero">
        <div className="container directory-hero-inner">
          <span className="eyebrow">VERIFIED MULTI-CATEGORY MARKETPLACE</span>
          <h1>
            Phones, cars, fashion & food,
            <br />
            <em>from verified stores in one place.</em>
          </h1>
          <p>
            Connect directly with verified independent sellers across tech, automotive, fashion, home, and fresh pantry goods—all with unified delivery and buyer protection.
          </p>

          {/* STORE SEARCH & CATEGORY BAR */}
          <div className="directory-search-box">
            <div className="search-input-wrap">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder={isStoresDirectory ? "Search stores, phones, cars, fashion, tech, or groceries..." : `Search ${selectedCategory} products or stores...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search marketplace"
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

          <div className="directory-categories-bar">
            {storeCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONDITIONAL CONTENT: STORES DIRECTORY vs DIRECT PRODUCTS */}
      <section className="section stores-grid-section">
        <div className="container">
          {isStoresDirectory ? (
            /* ALL STORES DIRECTORY VIEW */
            <>
              <div className="directory-results-head">
                <div>
                  <span className="eyebrow">VERIFIED MERCHANTS & SPECIALTY SHOPS</span>
                  <h2>Registered Stores & Shops</h2>
                  <p>Explore independent storefronts and direct catalog offerings.</p>
                </div>
                <div className="stores-counter">
                  <b>{filteredStores.length}</b> {filteredStores.length === 1 ? 'store' : 'stores'} available
                </div>
              </div>

              {filteredStores.length > 0 ? (
                <div className="stores-grid">
                  {filteredStores.map((store) => (
                    <article className="store-card" key={store.id}>
                      <div className="store-card-banner">
                        <img 
                          src={store.banner} 
                          alt={`${store.name} banner`} 
                          loading="lazy" 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div className="store-card-badges">
                          <span className="store-card-specialty">{store.specialty}</span>
                          <span className="store-card-delivery">
                            <Clock size={12} /> {store.deliveryTime}
                          </span>
                        </div>
                      </div>

                      <div className="store-card-body">
                        <div className="store-card-header">
                          <div className="store-card-avatar">
                            <img src={store.avatar} alt={store.name} />
                          </div>
                          <div className="store-card-headline">
                            <Link to={`/store/${store.id}`} className="store-card-name">
                              <h3>{store.name}</h3>
                            </Link>
                            <div className="store-card-meta">
                              <span className="store-rating">
                                <Star size={13} fill="#F2B84B" color="#F2B84B" />
                                <b>{store.rating}</b>
                                <small>({store.reviews})</small>
                              </span>
                              <span className="meta-dot">·</span>
                              <span className="store-location">
                                <MapPin size={13} /> {store.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="store-card-about">{store.about}</p>

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
                          <div className="store-min-order">
                            <small>Min order ${store.minOrder}</small>
                          </div>
                          <Link 
                            to={`/store/${store.id}`} 
                            className="button primary visit-store-btn"
                            aria-label={`Visit ${store.name}`}
                          >
                            Visit Store <ArrowRight size={15} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="directory-empty-state">
                  <StoreIcon size={46} />
                  <h3>No stores match your search</h3>
                  <p>We couldn't find any stores matching "{searchQuery}". Try clearing your search.</p>
                  <button 
                    type="button" 
                    className="button outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            /* DIRECT PRODUCTS VIEW (FOR SELECTED PRODUCT CATEGORY) */
            <>
              {/* MATCHING STORES STRIP FOR THIS CATEGORY */}
              {filteredStores.length > 0 && (
                <div className="category-stores-bar">
                  <div className="category-stores-header">
                    <span className="eyebrow">LOCAL SHOPS FOR {selectedCategory.toUpperCase()}</span>
                    <small>Visit full store catalogs</small>
                  </div>
                  <div className="category-stores-scroll">
                    {filteredStores.map((s) => (
                      <Link key={s.id} to={`/store/${s.id}`} className="category-store-chip">
                        <img src={s.avatar} alt={s.name} />
                        <div>
                          <strong>{s.name}</strong>
                          <small><Star size={11} fill="#F2B84B" color="#F2B84B" /> {s.rating} · {s.location}</small>
                        </div>
                        <span className="visit-arrow">Visit Store →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* DIRECT PRODUCTS HEADER */}
              <div className="directory-results-head">
                <div>
                  <span className="eyebrow">DIRECT FROM LOCAL STORES</span>
                  <h2>{selectedCategory} Products</h2>
                  <p>
                    Showing fresh products from verified local stores. Each product displays the store in its title.
                  </p>
                </div>
                <div className="stores-counter">
                  <b>{filteredProducts.length}</b> {filteredProducts.length === 1 ? 'product' : 'products'} available
                </div>
              </div>

              {/* DIRECT PRODUCTS GRID WITH STORE IN TITLE */}
              {filteredProducts.length > 0 ? (
                <div className="product-grid" style={{ marginBottom: '40px' }}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="directory-empty-state">
                  <ShoppingBag size={46} />
                  <h3>No products found for {selectedCategory}</h3>
                  <p>Try clearing your search query or selecting another category.</p>
                  <button 
                    type="button" 
                    className="button outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Stores');
                    }}
                  >
                    View All Stores
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* BECOME A SELLER CALL TO ACTION BANNER */}
      <section className="seller-cta-section container">
        <div className="seller-cta-banner">
          <div className="seller-cta-content">
            <span className="seller-cta-badge">
              <Sparkles size={14} /> Open Your Online Shop
            </span>
            <h2>Want to open your own store? Become a seller</h2>
            <p>
              Join hundreds of local farms, bakeries, fisheries, and specialty food producers. 
              We handle local cold-chain delivery logistics and payment processing so you can focus on what you grow and make.
            </p>
            <div className="seller-cta-perks">
              <span><CheckCircle2 size={16} /> Zero upfront setup fees</span>
              <span><CheckCircle2 size={16} /> Direct weekly payouts</span>
              <span><CheckCircle2 size={16} /> Fast customer local delivery</span>
            </div>
            <Link to="/vendor/register" className="button primary seller-apply-btn">
              Apply to Open a Store <ArrowRight size={17} />
            </Link>
          </div>
          <div className="seller-cta-visual">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85" 
              alt="Farmer selling fresh food" 
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
