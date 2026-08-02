import { api } from '../client';

const BASE = '/products';

export const productRouter = {
  list(params) {
    return api.get(BASE, params);
  },

  get(id) {
    return api.get(`${BASE}/${id}`);
  },

  search(query) {
    return api.get(`${BASE}/search`, { q: query });
  },

  deals() {
    return api.get(`${BASE}/deals`);
  },

  featured() {
    return api.get(`${BASE}/featured`);
  },

  byCategory(category) {
    return api.get(BASE, { category });
  },

  related(id, limit = 4) {
    return api.get(`${BASE}/${id}/related`, { limit });
  },

  reviews(id) {
    return api.get(`${BASE}/${id}/reviews`);
  },

  addReview(id, data) {
    return api.post(`${BASE}/${id}/reviews`, data);
  },
};
