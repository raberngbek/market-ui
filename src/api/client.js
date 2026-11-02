import axios from 'axios';
import { API_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from './config';

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT) : null;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const token = typeof localStorage !== 'undefined' 
      ? (localStorage.getItem(STORAGE_KEYS.token) || localStorage.getItem('token')) 
      : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller?.signal,
      });

      if (response.status === 401) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEYS.token);
        throw new ApiError(401, 'Session expired. Please sign in again.');
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new ApiError(response.status, body.message || `Request failed (${response.status})`, body);
      }

      if (response.status === 204) return null;
      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError(0, 'Request timed out. Please try again.');
      }
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Network error. Please check your connection.');
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  get(endpoint, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`${endpoint}${query}`);
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  }

  patch(endpoint, data) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(data) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }
}

export const api = new ApiClient(API_URL);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof localStorage !== 'undefined' 
    ? (localStorage.getItem('token') || localStorage.getItem(STORAGE_KEYS.token))
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
