import { api } from '../client';

export const unitRouter = {
  getUnit(data) {
    return api.post('/unit/get', data);
  },

  create(data) {
    return api.post('/unit', data);
  },

  update(id, data) {
    return api.put(`/unit/${id}`, data);
  },

  delete(id) {
    return api.delete(`/unit/${id}`);
  }
};
