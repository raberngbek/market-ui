import { api } from '../client';

export const marketPlaceRouter = {
  getHome() {
    return api.get('/market_place_home');
  }
};
