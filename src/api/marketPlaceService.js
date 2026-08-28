import apiClient from './client';

export const getMarketPlaceHome = async () => {
  const response = await apiClient.get('/market_place_home');
  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};
