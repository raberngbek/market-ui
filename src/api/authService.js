import apiClient from './client';

export const login = async (credentials) => {
  const response = await apiClient.post('/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};
