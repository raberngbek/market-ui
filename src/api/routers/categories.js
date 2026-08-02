import { api } from '../client';

const BASE = '/categories';

export const categoryRouter = {
  list() {
    return api.get(BASE);
  },

  get(name) {
    return api.get(`${BASE}/${encodeURIComponent(name)}`);
  },

  products(name, params) {
    return api.get(`${BASE}/${encodeURIComponent(name)}/products`, params);
  },
};
