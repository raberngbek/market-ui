import apiClient from './client';
import { getMarketplaceHome } from './marketplace';

export { getMarketplaceHome, getMarketplaceHome as getMarketPlaceHome } from './marketplace';

export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};
