import { api } from '../client';

const BASE = '/account';

export const accountRouter = {
  profile() {
    return api.get(`${BASE}/profile`);
  },

  updateProfile(data) {
    return api.put(`${BASE}/profile`, data);
  },

  addresses() {
    return api.get(`${BASE}/addresses`);
  },

  addAddress(data) {
    return api.post(`${BASE}/addresses`, data);
  },

  updateAddress(id, data) {
    return api.put(`${BASE}/addresses/${id}`, data);
  },

  deleteAddress(id) {
    return api.delete(`${BASE}/addresses/${id}`);
  },

  login(credentials) {
    return api.post(`/auth/login`, credentials);
  },

  register(data) {
    return api.post(`/auth/register`, data);
  },

  logout() {
    return api.post(`/auth/logout`);
  },
};
