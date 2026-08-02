import { api } from '../client';

const BASE = '/cart';

export const cartRouter = {
  get() {
    return api.get(BASE);
  },

  add(product, quantity = 1, options = {}) {
    return api.post(`${BASE}/items`, { productId: product.id, quantity, options });
  },

  update(key, quantity) {
    return api.patch(`${BASE}/items/${key}`, { quantity });
  },

  remove(key) {
    return api.delete(`${BASE}/items/${key}`);
  },

  clear() {
    return api.delete(BASE);
  },

  applyCoupon(code) {
    return api.post(`${BASE}/coupon`, { code });
  },

  totals() {
    return api.get(`${BASE}/totals`);
  },
};
