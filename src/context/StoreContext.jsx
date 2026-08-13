import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const StoreContext = createContext(null);
const STORAGE_KEY = 'marketfresh-store-v1';

const readStore = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};

export function StoreProvider({ children }) {
  const [persisted] = useState(readStore);
  const [cart, setCart] = useState(persisted.cart || []);
  const [wishlist, setWishlist] = useState(persisted.wishlist || []);
  const [compare, setCompare] = useState(persisted.compare || []);
  const [orders, setOrders] = useState(persisted.orders || []);
  const [account, setAccount] = useState(persisted.account || { name: 'Alex Morgan', email: 'alex@marketfresh.test', addresses: [{ id: 'home', label: 'Home', value: '68 Cedar Lane, Oakland, CA 94607' }] });
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist, compare, orders, account })); }, [cart, wishlist, compare, orders, account]);

  const notify = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };
  const addToCart = (product, quantity = 1, options = {}) => {
    const key = `${product.id}-${options.color || 'default'}`;
    setCart((items) => {
      const found = items.find((item) => item.key === key);
      return found ? items.map((item) => item.key === key ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item) : [...items, { ...product, key, quantity, options }];
    });
    setCartOpen(true); notify(`${product.short} added to cart`);
  };
  const updateQty = (key, quantity) => setCart((items) => items.map((item) => item.key === key ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item));
  const removeCart = (key) => { setCart((items) => items.filter((item) => item.key !== key)); notify('Removed from your cart'); };
  const toggleList = (kind, product) => {
    const setter = kind === 'wishlist' ? setWishlist : setCompare;
    setter((items) => {
      const has = items.some((item) => item.id === product.id);
      if (has) { notify(`${product.short} removed`); return items.filter((item) => item.id !== product.id); }
      if (kind === 'compare' && items.length >= 4) { notify('Compare supports up to four products'); return items; }
      notify(`${product.short} ${kind === 'wishlist' ? 'saved' : 'added to compare'}`); return [...items, product];
    });
  };
  const clearCart = () => setCart([]);
  const placeOrder = (shipping) => {
    const id = `MP-${String(Date.now()).slice(-6)}`;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = { id, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), status: 'Processing', total, items: cart, shipping };
    setOrders((items) => [order, ...items]); setCart([]); return order;
  };
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 35 ? 0 : 5.99;
    const tax = subtotal * .07;
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  }, [cart]);
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const value = { cart, wishlist, compare, orders, account, setAccount, cartOpen, setCartOpen, toasts, notify, dismissToast, addToCart, updateQty, removeCart, toggleList, clearCart, placeOrder, totals };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
