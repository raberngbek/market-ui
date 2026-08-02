const API_URL = import.meta.env.VITE_API_URL || '/api';

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
