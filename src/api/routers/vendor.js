import { api } from '../client';

const BASE = '/vendor';

export const vendorRouter = {
  get(slug) {
    return api.get(`${BASE}/${slug}`);
  },

  products(slug) {
    return api.get(`${BASE}/${slug}/products`);
  },

  register(data) {
    return api.post(`${BASE}/register`, data);
  },
};

export const contactRouter = {
  submit(data) {
    return api.post('/contact', data);
  },
};

export const newsletterRouter = {
  subscribe(email) {
    return api.post('/newsletter', { email });
  },

  unsubscribe(email) {
    return api.delete('/newsletter', { email });
  },
};
