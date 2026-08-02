import { api } from '../client';

const BASE = '/orders';

export const orderRouter = {
  list() {
    return api.get(BASE);
  },

  get(id) {
    return api.get(`${BASE}/${id}`);
  },

  place(shipping) {
    return api.post(BASE, { shipping });
  },

  track(id) {
    return api.get(`${BASE}/${id}/tracking`);
  },

  cancel(id) {
    return api.post(`${BASE}/${id}/cancel`);
  },
};
