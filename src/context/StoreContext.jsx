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
  const [account, setAccount] = useState(persisted.account || { name: 'Alex Morgan', email: 'alex@marketfresh.test', addresses: [{ id: 'home', label: 'Home', value: '68 Cedar Lane, Phnom Penh' }] });
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Live marketplace products and categories state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist, compare, orders, account })); 
  }, [cart, wishlist, compare, orders, account]);

  const notify = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };

  const addToCart = (product, quantity = 1, options = {}) => {
    const prodId = product.id ?? product.productId ?? 'item';
    const optKey = options.color || options.option || 'default';
    const key = `${prodId}-${optKey}`;
    const storeId = product.storeId || product.store?.id || (product.brand ? product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'store-2');
    const storeName = product.storeName || product.store?.name || product.brand || 'Verified Store';
    const storeSlug = product.storeSlug || product.store?.slug || product.store?.code || String(storeId);
    const currencyCode = product.currencyCode || product.currency || 'USD';
    const stockLimit = product.stock || product.stockQuantity || 99;

    const normalizedCartItem = {
      ...product,
      id: prodId,
      productId: prodId,
      name: product.name || product.productName || 'Product',
      short: product.short || product.shortName || product.name || 'Product',
      price: Number(product.price ?? product.onlinePrice ?? 0),
      image: product.image || product.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      currencyCode,
      currency: currencyCode,
      storeId,
      storeName,
      storeSlug,
      key,
      quantity,
      options,
      stock: stockLimit,
    };

    setCart((items) => {
      const found = items.find((item) => item.key === key);
      return found
        ? items.map((item) => item.key === key ? { ...item, quantity: Math.min(item.quantity + quantity, stockLimit) } : item)
        : [...items, normalizedCartItem];
    });
    setCartOpen(true);
    notify(`${normalizedCartItem.short} added to cart`);
  };

  const updateQty = (key, quantity) => setCart((items) => 
    items.map((item) => item.key === key ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock || 99)) } : item)
  );

  const removeCart = (key) => { 
    setCart((items) => items.filter((item) => item.key !== key)); 
    notify('Removed from your cart'); 
  };

  const toggleList = (kind, product) => {
    const prodId = product.id ?? product.productId;
    const setter = kind === 'wishlist' ? setWishlist : setCompare;
    setter((items) => {
      const has = items.some((item) => String(item.id) === String(prodId));
      if (has) { 
        notify(`${product.short || product.name} removed`); 
        return items.filter((item) => String(item.id) !== String(prodId)); 
      }
      if (kind === 'compare' && items.length >= 4) { 
        notify('Compare supports up to four products'); 
        return items; 
      }
      notify(`${product.short || product.name} ${kind === 'wishlist' ? 'saved to favorites' : 'added to compare'}`); 
      return [...items, product];
    });
  };

  const clearCart = () => setCart([]);

  const placeOrder = (shipping) => {
    const id = `MP-${String(Date.now()).slice(-6)}`;
    const primaryCurrency = cart[0]?.currencyCode || 'USD';
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = { 
      id, 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
      status: 'Processing', 
      total, 
      currencyCode: primaryCurrency,
      items: cart, 
      shipping 
    };
    setOrders((items) => [order, ...items]); 
    setCart([]); 
    return order;
  };

  const totals = useMemo(() => {
    const primaryCurrency = cart[0]?.currencyCode || 'USD';
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
    const isKHR = primaryCurrency === 'KHR';
    const freeShippingThreshold = isKHR ? 140000 : 35;
    const standardShipping = isKHR ? 24000 : 5.99;
    
    const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : standardShipping;
    const tax = isKHR ? 0 : subtotal * 0.07;
    return { 
      subtotal, 
      shipping, 
      tax, 
      total: subtotal + shipping + tax, 
      currencyCode: primaryCurrency 
    };
  }, [cart]);

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const value = { 
    cart, 
    setCart, 
    wishlist, 
    setWishlist, 
    compare, 
    setCompare, 
    orders, 
    setOrders, 
    account, 
    setAccount, 
    cartOpen, 
    setCartOpen, 
    toasts, 
    notify, 
    dismissToast, 
    addToCart, 
    updateQty, 
    removeCart, 
    toggleList, 
    clearCart, 
    placeOrder, 
    totals,
    products,
    setProducts,
    categories,
    setCategories,
    totalProducts,
    setTotalProducts,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
