import { Suspense, useState, useEffect } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Heart, 
  Menu, 
  Search, 
  ShoppingBag, 
  UserRound, 
  X, 
  MapPin, 
  Phone, 
  Truck, 
  Minus, 
  Plus, 
  Trash2, 
  Scale, 
  Store as StoreIcon, 
  ShieldCheck, 
  Sparkles,
  Lock,
  LogOut
} from 'lucide-react';
import { products, stores } from './data/catalog';
import { useStore } from './context/StoreContext';
import { money } from './utils/money';
import PageLoading from './components/PageLoading';
import ScrollTop from './components/ScrollTop';
import NotFound from './components/NotFound';
import FooterList from './components/FooterList';
import NewsletterForm from './components/NewsletterForm';
import Utilities from './components/Utilities';
import LoginModal from './components/LoginModal';

import Home from './pages/Home';
import Storefront from './pages/Storefront';
import Shop from './pages/Shop';
import Product from './pages/Product';
import { Cart, Checkout, OrderConfirmation } from './pages/CartCheckout';
import Account from './pages/Account';
import Content from './pages/Content';
import AdminPanel from './pages/AdminPanel';

function Header({ onLoginClick, isAuthenticated }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { cart, wishlist, compare, setCartOpen } = useStore();

  const productMatches = query.length > 1 
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3) 
    : [];

  const storeMatches = query.length > 1
    ? stores.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.specialty.toLowerCase().includes(query.toLowerCase())).slice(0, 2)
    : [];

  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <>
      <div className="utility-bar">
        <div className="container utility-inner">
          <span><MapPin size={14} /> Delivering Nationwide & Local Express</span>
          <span className="utility-promo">Multi-Category Store Marketplace · Code: <b>FRESH10</b> for 10% Off</span>
          <span><Phone size={14} /> 24/7 Customer Support</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-main">
          <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>

          <Link className="brand" to="/">
            <span className="brand-mark">F</span>
            <span>Market<span>Fresh</span></span>
          </Link>

          <form className="header-search" onSubmit={submitSearch}>
            <Search size={19} />
            <input 
              aria-label="Search stores, phones, cars, fashion, tech, and groceries" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search stores, phones, cars, tech, fashion, or groceries..." 
            />
            <button aria-label="Search" type="submit">Search</button>

            {(productMatches.length > 0 || storeMatches.length > 0) && (
              <div className="search-suggestions">
                {storeMatches.length > 0 && (
                  <div className="suggestion-section">
                    <small className="suggestion-header">STORES</small>
                    {storeMatches.map((s) => (
                      <button key={s.id} type="button" onClick={() => { navigate(`/store/${s.id}`); setQuery(''); }}>
                        <img src={s.avatar} alt="" />
                        <span>{s.name}<small>{s.specialty}</small></span>
                      </button>
                    ))}
                  </div>
                )}
                {productMatches.length > 0 && (
                  <div className="suggestion-section">
                    <small className="suggestion-header">PRODUCTS</small>
                    {productMatches.map((product) => (
                      <button key={product.id} type="button" onClick={() => { navigate(`/product/${product.id}`); setQuery(''); }}>
                        <img src={product.image} alt="" />
                        <span>{product.short}<small>{money(product.price)} · {product.storeName || product.brand}</small></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="header-actions">
            <Link className="header-action hide-mobile" to="/account">
              <UserRound />
              <small>Account</small>
            </Link>
            <Link className="header-action" to="/wishlist">
              <span className="counter-icon">
                <Heart />
                <i>{wishlist.length}</i>
              </span>
              <small>Wishlist</small>
            </Link>
            <Link className="header-action hide-mobile" to="/compare">
              <span className="counter-icon">
                <Scale />
                <i>{compare.length}</i>
              </span>
              <small>Compare</small>
            </Link>
            <button className="header-action cart-action" onClick={() => setCartOpen(true)}>
              <span className="counter-icon">
                <ShoppingBag />
                <i>{cart.reduce((sum, item) => sum + item.quantity, 0)}</i>
              </span>
              <small>Cart</small>
            </button>
          </div>
        </div>

        <nav className="desktop-nav">
          <div className="container nav-inner">
            <div className="category-trigger">
              <button onClick={() => setCategoriesOpen(!categoriesOpen)}>
                <Menu size={19} /> Browse departments <ChevronDown size={16} />
              </button>
              {categoriesOpen && (
                <div className="mega-menu">
                  {[
                    'Phones & Tech', 
                    'Cars & Auto', 
                    'Fashion & Apparel', 
                    'Home & Living', 
                    'Beauty & Wellness', 
                    'Fresh Produce', 
                    'Ready to Eat', 
                    'Bakery', 
                    'Meat & Seafood', 
                    'Dairy & Eggs', 
                    'Pantry & Drinks'
                  ].map((name, index) => (
                    <Link key={name} to={`/category/${encodeURIComponent(name)}`} onClick={() => setCategoriesOpen(false)}>
                      <span>{String(index + 1).padStart(2, '0')}</span>{name}
                    </Link>
                  ))}
                  <div className="mega-promo">
                    <small>ALL-IN-ONE MARKETPLACE</small>
                    <strong>Shop directly from<br />independent stores</strong>
                    <Link to="/">Explore all stores →</Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink className={linkClass} to="/">Stores Directory</NavLink>
            <NavLink className={linkClass} to="/shop">All Products</NavLink>
            <NavLink className={linkClass} to="/deals">Weekly Deals</NavLink>
            <NavLink className={linkClass} to="/vendor/register">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} style={{ color: 'var(--yellow)' }} /> Become a Seller
              </span>
            </NavLink>
            <NavLink className={linkClass} to="/blog">Stories & News</NavLink>
            <NavLink className={linkClass} to="/contact">Help</NavLink>
            <NavLink className={linkClass} to="/admin">Admin Panel</NavLink>

            <span className="nav-spacer" />
            <span className="nav-shipping">
              <Truck size={17} /> Fast Express & Local Delivery
            </span>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mobile-menu-panel">
          <div className="menu-top">
            <Link className="brand" to="/" onClick={() => setMobileOpen(false)}>
              <span className="brand-mark">F</span>Market<span>Fresh</span>
            </Link>
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X />
            </button>
          </div>
          <form className="mobile-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stores and food" />
          </form>
          <nav>
            {[
              ['Stores Directory', '/'],
              ['All Groceries', '/shop'],
              ['Fresh Produce', '/category/Fresh%20Produce'],
              ['Ready to Eat', '/category/Ready%20to%20Eat'],
              ['Meat & Seafood', '/category/Meat%20%26%20Seafood'],
              ['Weekly Deals', '/deals'],
              ['Become a Seller', '/vendor/register'],
              ['Admin Panel', '/admin'],
              ['Recipes & Stories', '/blog'],
              ['My Account', '/account']
            ].map(([name, to]) => (
              <Link key={name} to={to} onClick={() => setMobileOpen(false)}>
                {name} <ChevronDown size={16} />
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-help">
            <Phone size={19} />
            <span>Need delivery help?<small>+1 (800) 123-4567</small></span>
          </div>
        </div>
        <button className="menu-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      </div>
    </>
  );
}

function CartDrawer() {
  const { cartOpen, setCartOpen, cart, totals, updateQty, removeCart } = useStore();
  return (
    <div className={`drawer-wrap ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}>
      <aside className="cart-drawer" aria-label="Grocery basket">
        <header>
          <strong>Your basket <small>({cart.length} items)</small></strong>
          <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close basket">
            <X />
          </button>
        </header>

        <div className="shipping-progress">
          <span>
            {Math.max(0, 35 - totals.subtotal) 
              ? `${money(35 - totals.subtotal)} away from free delivery` 
              : 'Eligible for FREE local delivery!'}
          </span>
          <div>
            <i style={{ width: `${Math.min(100, (totals.subtotal / 35) * 100)}%` }} />
          </div>
        </div>

        <div className="drawer-items">
          {cart.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={38} />
              <h3>Your basket is empty</h3>
              <p>Explore our stores and fill your basket with fresh local food.</p>
              <Link to="/" onClick={() => setCartOpen(false)} className="button primary">
                Browse Local Stores
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <article className="drawer-product" key={item.key}>
                <img src={item.image} alt={item.short} />
                <div>
                  <Link to={`/product/${item.id}`} onClick={() => setCartOpen(false)}>
                    {item.short}
                  </Link>
                  {/* Store Attribution badge in Cart Drawer */}
                  <small className="cart-store-name" style={{ color: 'var(--green)', fontWeight: 600 }}>
                    Store: <Link to={`/store/${item.storeId || ''}`} onClick={() => setCartOpen(false)} style={{ textDecoration: 'underline' }}>
                      {item.storeName || item.brand || 'Local Store'}
                    </Link>
                  </small>
                  {item.options?.color && <small>Option: {item.options.color}</small>}
                  <b>{money(item.price)}</b>
                  <div className="quantity-control">
                    <button onClick={() => updateQty(item.key, item.quantity - 1)} aria-label="Decrease quantity">
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.key, item.quantity + 1)} aria-label="Increase quantity">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <button className="remove-button" onClick={() => removeCart(item.key)} aria-label={`Remove ${item.short}`}>
                  <Trash2 size={17} />
                </button>
              </article>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <footer>
            <div className="totals-row">
              <span>Subtotal</span>
              <strong>{money(totals.subtotal)}</strong>
            </div>
            <Link className="button primary wide" to="/checkout" onClick={() => setCartOpen(false)}>
              Choose delivery time
            </Link>
            <Link className="text-link center" to="/cart" onClick={() => setCartOpen(false)}>
              View basket
            </Link>
          </footer>
        )}
      </aside>
      <button className="drawer-backdrop" aria-label="Close basket" onClick={() => setCartOpen(false)} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <span className="eyebrow">THE MARKETFRESH TABLE</span>
            <h2>Fresh ideas, in your inbox.</h2>
            <p>Seasonal store spotlights, local grower stories, and $10 off your first delivery.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <section className="footer-main">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" to="/">
              <span className="brand-mark">F</span>Market<span>Fresh</span>
            </Link>
            <p>Independent multi-store marketplace connecting regional farms, bakeries, and kitchens directly with your home.</p>
            <a href="tel:+18001234567">+1 (800) 123-4567</a>
            <a href="mailto:hello@marketfresh.test">hello@marketfresh.test</a>
          </div>

          <FooterList
            title="Explore Stores"
            links={[
              ['All Stores Directory', '/'],
              ['Organic Produce Stores', '/category/Fresh%20Produce'],
              ['Local Bakeries', '/category/Bakery'],
              ['Sustainable Seafood', '/category/Meat%20%26%20Seafood'],
              ['Ready Meal Kitchens', '/category/Ready%20to%20Eat']
            ]}
          />

          <FooterList
            title="Delivery & Support"
            links={[
              ['Delivery areas', '/faq'],
              ['Freshness promise', '/faq'],
              ['Contact delivery team', '/contact'],
              ['Track your order', '/account/orders']
            ]}
          />

          <FooterList
            title="For Store Owners"
            links={[
              ['Become a Seller', '/vendor/register'],
              ['Store Owner Login', '/admin'],
              ['Food Standards', '/faq'],
              ['Market Stories & Blog', '/blog']
            ]}
          />
        </div>
      </section>

      <div className="container footer-bottom">
        <span>© 2026 MarketFresh Platform. Good food, thoughtfully delivered from independent stores.</span>
        <span>Secure payments · Visa · Mastercard · PayPal</span>
      </div>
    </footer>
  );
}

function AdminAccessDenied({ onLoginClick }) {
  return (
    <main className="container" style={{ padding: '80px 0' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '8px', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--cream)', color: 'var(--ink)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Lock size={26} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Admin Panel Access</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
          You must be logged in as an administrator or verified store owner to access the management dashboard.
        </p>
        <button 
          onClick={onLoginClick}
          className="button primary wide"
        >
          Log In Now
        </button>
      </div>
    </main>
  );
}

export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(Boolean(localStorage.getItem('token')));
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <>
      <ScrollTop />
      <Header 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        isAuthenticated={isAuthenticated} 
      />

      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* MULTI-STORE DIRECTORY LANDING PAGE */}
          <Route path="/" element={<Home />} />
          <Route path="/stores" element={<Home />} />

          {/* DEDICATED STOREFRONT PAGES */}
          <Route path="/store/:storeId" element={<Storefront />} />
          <Route path="/vendor/:slug" element={<Storefront />} />

          {/* GROCERY & PRODUCT CATALOG */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:category" element={<Shop />} />
          <Route path="/search" element={<Shop search />} />
          <Route path="/deals" element={<Shop deals />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/product/:id/layout/:layout" element={<Product />} />

          {/* CART & CHECKOUT FLOW */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />

          {/* USER WISHLIST & COMPARE */}
          <Route path="/wishlist" element={<Content kind="wishlist" />} />
          <Route path="/compare" element={<Content kind="compare" />} />

          {/* USER ACCOUNT & AUTH */}
          <Route path="/account/*" element={<Account />} />
          <Route path="/login" element={<Account auth="login" />} />
          <Route path="/register" element={<Account auth="register" />} />

          {/* ADMIN & SELLER PANEL */}
          <Route 
            path="/admin" 
            element={
              isAuthenticated 
                ? <AdminPanel /> 
                : <AdminAccessDenied onLoginClick={() => setIsLoginModalOpen(true)} />
            } 
          />

          {/* CONTENT, BLOG & SUPPORT */}
          <Route path="/blog" element={<Content kind="blog" />} />
          <Route path="/blog/:slug" element={<Content kind="article" />} />
          <Route path="/contact" element={<Content kind="contact" />} />
          <Route path="/faq" element={<Content kind="faq" />} />
          <Route path="/vendor/register" element={<Content kind="vendor-register" />} />

          {/* 404 CATCH-ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Footer />
      <CartDrawer />
      <Utilities />

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => {
            setIsLoginModalOpen(false);
            setIsAuthenticated(true);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
