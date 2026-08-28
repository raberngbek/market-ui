import apiClient from './client';

export const getUnits = async () => {
  const response = await apiClient.get('/units');
  return response.data;
};

export const createUnit = async (unitData) => {
  const response = await apiClient.post('/units', unitData);
  return response.data;
};

export const updateUnit = async (id, unitData) => {
  const response = await apiClient.put(`/units/${id}`, unitData);
  return response.data;
};

export const deleteUnit = async (id) => {
  const response = await apiClient.delete(`/units/${id}`);
  return response.data;
};
