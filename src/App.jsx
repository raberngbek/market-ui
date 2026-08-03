import { lazy, Suspense, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Menu, Search, ShoppingBag, UserRound, X, MapPin, Phone, Truck, Minus, Plus, Trash2, LogOut, Scale, PackageCheck } from 'lucide-react';
import { products } from './data/catalog';
import { useStore } from './context/StoreContext';
import { money } from './utils/money';
import PageLoading from './components/PageLoading';
import ScrollTop from './components/ScrollTop';
import NotFound from './components/NotFound';
import FooterList from './components/FooterList';
import NewsletterForm from './components/NewsletterForm';
import Utilities from './components/Utilities';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/CartCheckout').then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/CartCheckout').then((m) => ({ default: m.Checkout })));
const OrderConfirmation = lazy(() => import('./pages/CartCheckout').then((m) => ({ default: m.OrderConfirmation })));
const Account = lazy(() => import('./pages/Account'));
const Content = lazy(() => import('./pages/Content'));


function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { cart, wishlist, compare, setCartOpen } = useStore();
  const matches = query.length > 1 ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : [];
  const submitSearch = (event) => { event.preventDefault(); if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setQuery(''); } };
  const linkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';
  return <>
    <div className="utility-bar"><div className="container utility-inner"><span><MapPin size={14}/> Delivering to 94607</span><span className="utility-promo">Free delivery on $10000+ · Code: <b>FRESH10</b></span><span><Phone size={14}/> Delivery help</span></div></div>
    <header className="site-header">
      <div className="container header-main">
        <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu /></button>
        <Link className="brand" to="/"><span className="brand-mark">F</span><span>Market<span>Fresh</span></span></Link>
        <form className="header-search" onSubmit={submitSearch}><Search size={19}/><input aria-label="Search groceries" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fresh food, pantry and ready meals"/><button aria-label="Search" type="submit">Search</button>{matches.length > 0 && <div className="search-suggestions">{matches.map((product) => <button key={product.id} type="button" onClick={() => { navigate(`/product/${product.id}`); setQuery(''); }}><img src={product.image} alt=""/><span>{product.short}<small>{money(product.price)}</small></span></button>)}</div>}</form>
        <div className="header-actions">
          <Link className="header-action hide-mobile" to="/account"><UserRound/><small>Account</small></Link>
          <Link className="header-action" to="/wishlist"><span className="counter-icon"><Heart/><i>{wishlist.length}</i></span><small>Wishlist</small></Link>
          <Link className="header-action hide-mobile" to="/compare"><span className="counter-icon"><Scale/><i>{compare.length}</i></span><small>Compare</small></Link>
          <button className="header-action cart-action" onClick={() => setCartOpen(true)}><span className="counter-icon"><ShoppingBag/><i>{cart.reduce((sum, item) => sum + item.quantity, 0)}</i></span><small>Cart</small></button>
        </div>
      </div>
      <nav className="desktop-nav"><div className="container nav-inner"><div className="category-trigger"><button onClick={() => setCategoriesOpen(!categoriesOpen)}><Menu size={19}/> Browse food aisles <ChevronDown size={16}/></button>{categoriesOpen && <div className="mega-menu">{['Fresh Produce','Ready to Eat','Meat & Seafood','Dairy & Eggs','Bakery','Pantry','Drinks','Organic Market'].map((name, index) => <Link key={name} to={`/category/${encodeURIComponent(name)}`} onClick={() => setCategoriesOpen(false)}><span>{String(index + 1).padStart(2, '0')}</span>{name}</Link>)}<div className="mega-promo"><small>FRESH THIS WEEK</small><strong>Save 20% on<br/>local produce</strong><Link to="/shop">Shop the harvest →</Link></div></div>}</div><NavLink className={linkClass} to="/">Home</NavLink><NavLink className={linkClass} to="/shop">Groceries</NavLink><NavLink className={linkClass} to="/category/Fresh%20Produce">Fresh produce</NavLink><NavLink className={linkClass} to="/category/Ready%20to%20Eat">Ready meals</NavLink><NavLink className={linkClass} to="/deals">Deals</NavLink><NavLink className={linkClass} to="/blog">Recipes</NavLink><NavLink className={linkClass} to="/contact">Help</NavLink><span className="nav-spacer"/><span className="nav-shipping"><Truck size={17}/> Delivery in as little as 60 min</span></div></nav>
    </header>
    <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}><div className="mobile-menu-panel"><div className="menu-top"><Link className="brand" to="/" onClick={() => setMobileOpen(false)}><span className="brand-mark">F</span>Market<span>Fresh</span></Link><button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X/></button></div><form className="mobile-search" onSubmit={submitSearch}><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food and groceries"/></form><nav>{[['Home','/'],['All groceries','/shop'],['Fresh produce','/category/Fresh%20Produce'],['Ready to eat','/category/Ready%20to%20Eat'],['Meat & seafood','/category/Meat%20%26%20Seafood'],['Deals','/deals'],['Recipes','/blog'],['Delivery help','/faq'],['My account','/account']].map(([name,to]) => <Link key={name} to={to} onClick={() => setMobileOpen(false)}>{name}<ChevronDown size={16}/></Link>)}</nav><div className="mobile-menu-help"><Phone size={19}/><span>Need delivery help?<small>+1 (800) 123-4567</small></span></div></div><button className="menu-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/></div>
  </>;
}

function CartDrawer() {
  const { cartOpen, setCartOpen, cart, totals, updateQty, removeCart } = useStore();
  return <div className={`drawer-wrap ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen}><aside className="cart-drawer" aria-label="Grocery basket"><header><strong>Your basket <small>({cart.length} items)</small></strong><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close basket"><X/></button></header><div className="shipping-progress"><span>You're {Math.max(0, 35 - totals.subtotal) ? money(35 - totals.subtotal) : 'eligible'} away from free delivery</span><div><i style={{ width: `${Math.min(100, totals.subtotal / 35 * 100)}%` }}/></div></div><div className="drawer-items">{cart.length === 0 ? <div className="empty-state"><ShoppingBag size={38}/><h3>Your basket is empty</h3><p>Let’s fill it with something fresh.</p><Link to="/shop" onClick={() => setCartOpen(false)} className="button primary">Shop fresh food</Link></div> : cart.map((item) => <article className="drawer-product" key={item.key}><img src={item.image} alt={item.short}/><div><Link to={`/product/${item.id}`} onClick={() => setCartOpen(false)}>{item.short}</Link><small>{item.options.color && `Option: ${item.options.color}`}</small><b>{money(item.price)}</b><div className="quantity-control"><button onClick={() => updateQty(item.key, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => updateQty(item.key, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><button className="remove-button" onClick={() => removeCart(item.key)} aria-label={`Remove ${item.short}`}><Trash2 size={17}/></button></article>)}</div>{cart.length > 0 && <footer><div className="totals-row"><span>Subtotal</span><strong>{money(totals.subtotal)}</strong></div><Link className="button primary wide" to="/checkout" onClick={() => setCartOpen(false)}>Choose delivery time</Link><Link className="text-link center" to="/cart" onClick={() => setCartOpen(false)}>View basket</Link></footer>}</aside><button className="drawer-backdrop" aria-label="Close basket" onClick={() => setCartOpen(false)}/></div>;
}

function Footer() { return <footer className="site-footer"><section className="newsletter"><div className="container newsletter-inner"><div><span className="eyebrow">THE MARKETFRESH TABLE</span><h2>Fresh ideas, in your inbox.</h2><p>Seasonal picks, simple recipes, and $10 off your first food delivery.</p></div><NewsletterForm/></div></section><section className="footer-main"><div className="container footer-grid"><div><Link className="brand footer-brand" to="/"><span className="brand-mark">F</span>Market<span>Fresh</span></Link><p>Fresh groceries and ready-to-eat food, delivered from local producers to your door.</p><a href="tel:+18001234567">+1 (800) 123-4567</a><a href="mailto:hello@marketfresh.test">hello@marketfresh.test</a></div><FooterList title="Shop food" links={[['All groceries','/shop'],['Fresh today','/category/Fresh%20Produce'],['Ready meals','/category/Ready%20to%20Eat'],['Weekly deals','/deals']]}/><FooterList title="Delivery help" links={[['Delivery areas','/faq'],['Freshness promise','/faq'],['Contact us','/contact'],['Track your order','/account/orders']]}/><FooterList title="About MarketFresh" links={[['Recipes & stories','/blog'],['Our local producers','/vendor/atlas'],['Become a producer','/vendor/register'],['Food standards','/faq']]}/></div></section><div className="container footer-bottom"><span>© 2026 MarketFresh. Good food, thoughtfully delivered.</span><span>Secure payments · Visa · Mastercard · PayPal</span></div></footer>; }

export default function App() { return <><ScrollTop/><Header/><Suspense fallback={<PageLoading/>}><Routes><Route path="/" element={<Home/>}/><Route path="/home-2" element={<Home variant="two"/>}/><Route path="/shop" element={<Shop/>}/><Route path="/category/:category" element={<Shop/>}/><Route path="/search" element={<Shop search/>}/><Route path="/deals" element={<Shop deals/>}/><Route path="/product/:id" element={<Product/>}/><Route path="/product/:id/layout/:layout" element={<Product/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/order-confirmation/:id" element={<OrderConfirmation/>}/><Route path="/wishlist" element={<Content kind="wishlist"/>}/><Route path="/compare" element={<Content kind="compare"/>}/><Route path="/account/*" element={<Account/>}/><Route path="/login" element={<Account auth="login"/>}/><Route path="/register" element={<Account auth="register"/>}/><Route path="/blog" element={<Content kind="blog"/>}/><Route path="/blog/:slug" element={<Content kind="article"/>}/><Route path="/contact" element={<Content kind="contact"/>}/><Route path="/faq" element={<Content kind="faq"/>}/><Route path="/vendor/register" element={<Content kind="vendor-register"/>}/><Route path="/vendor/:slug" element={<Content kind="vendor"/>}/><Route path="*" element={<NotFound/>}/></Routes></Suspense><Footer/><CartDrawer/><Utilities/></>; }
