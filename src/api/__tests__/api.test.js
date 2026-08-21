import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../client';
import { marketPlaceRouter } from '../routers/marketPlace';
import { categoryRouter } from '../routers/categories';
import { authRouter } from '../routers/auth';
import { unitRouter } from '../routers/unit';
import { API_URL } from '../config';

// Mock the global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
vi.stubGlobal('localStorage', mockStorage);

describe('API Service Layer Tests', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    mockStorage.getItem.mockClear();
    // Default mock implementation
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('marketPlaceRouter', () => {
    it('getHome() should fetch marketplace home data and return 200', async () => {
      const mockData = { products: [{ id: 1, name: 'Apple' }] };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const response = await marketPlaceRouter.getHome();
      
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/market_place_home`, expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
      expect(response).toEqual(mockData);
    });
  });

  describe('categoryRouter', () => {
    it('list() should fetch categories and return 200', async () => {
      const mockData = [{ id: 1, name: 'Produce' }];
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const response = await categoryRouter.list();
      
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/categories`, expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
      expect(response).toEqual(mockData);
    });
  });

  describe('authRouter', () => {
    it('login() should make a GET request to /Login and return 200', async () => {
      const mockData = { token: 'abc' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const response = await authRouter.login();
      
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/Login`, expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
      expect(response).toEqual(mockData);
    });
  });

  describe('unitRouter CRUD', () => {
    it('create() should make a POST request and return 201', async () => {
      const payload = { name: 'New Unit' };
      const mockData = { id: 1, ...payload };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData
      });

      const response = await unitRouter.create(payload);
      
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/unit`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload)
      }));
      expect(response).toEqual(mockData);
    });

    it('getUnit() should make a POST request with payload and return 200', async () => {
      const payload = { name: 'Add your name in the body' };
      const mockData = { id: 1, name: 'Unit Name' };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const response = await unitRouter.getUnit(payload);
      
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/unit/get`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload)
      }));
      expect(response).toEqual(mockData);
    });

    it('update() should make a PUT request and return 200', async () => {
      const payload = { name: 'Updated Unit' };
      const mockData = { id: 1, ...payload };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const response = await unitRouter.update(1, payload);
      
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/unit/1`, expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(payload)
      }));
      expect(response).toEqual(mockData);
    });

    it('delete() should make a DELETE request and return 200', async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData
      });

      const response = await unitRouter.delete(1);
      
      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/unit/1`, expect.objectContaining({
        method: 'DELETE'
      }));
      expect(response).toEqual(mockData);
    });
  });
});
