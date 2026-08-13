const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || '/api';
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http:')) {
    return envUrl.replace('http:', 'https:');
  }
  return envUrl;
};

const API_URL = getApiUrl();

export const ENDPOINTS = {
  products: '/products',
  categories: '/categories',
  cart: '/cart',
  orders: '/orders',
  account: '/account',
  blog: '/blog',
  faq: '/faq',
  vendor: '/vendor',
  contact: '/contact',
  newsletter: '/newsletter',
  auth: '/auth',
};

export const STORAGE_KEYS = {
  token: 'auth_token',
  cart: 'cart_id',
};

export const REQUEST_TIMEOUT = 15000;

export { API_URL };
