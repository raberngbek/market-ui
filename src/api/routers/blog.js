import { api } from '../client';

const BASE = '/blog';

export const blogRouter = {
  list() {
    return api.get(BASE);
  },

  get(slug) {
    return api.get(`${BASE}/${slug}`);
  },

  faq() {
    return api.get('/faq');
  },
};
