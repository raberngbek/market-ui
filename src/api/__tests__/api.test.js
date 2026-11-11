import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, apiClient } from '../client';
import { marketPlaceRouter } from '../routers/marketPlace';
import { categoryRouter } from '../routers/categories';
import { authRouter } from '../routers/auth';
import { unitRouter } from '../routers/unit';
import { getMarketplaceHome } from '../marketplace';
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

  describe('getMarketplaceHome service', () => {
    it('should call GET /api/v1/marketplace/home with default parameters and extract envelope data', async () => {
      const mockResult = {
        categories: [{ id: 1, name: 'Phones' }],
        stores: { content: [{ id: 's1', name: 'Tech Store' }], page: 0, totalPages: 1 },
        featuredProducts: [{ id: 'p1', name: 'iPhone 15' }],
        products: { content: [{ id: 'p1', name: 'iPhone 15' }], page: 0, totalPages: 1 }
      };

      const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 200,
          data: mockResult
        }
      });

      const data = await getMarketplaceHome();

      expect(spy).toHaveBeenCalledWith('/api/v1/marketplace/home', expect.objectContaining({
        params: expect.objectContaining({
          size: 24,
          storeSize: 24
        })
      }));
      expect(data).toEqual(mockResult);
    });

    it('should truncate search query to 120 chars and pass categoryId, page, size, storePage, storeSize', async () => {
      const longQuery = 'a'.repeat(150);
      const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: { data: { success: true } }
      });

      await getMarketplaceHome({
        search: longQuery,
        categoryId: 'phones',
        page: 2,
        size: 12,
        storePage: 1,
        storeSize: 6
      });

      expect(spy).toHaveBeenCalledWith('/api/v1/marketplace/home', expect.objectContaining({
        params: {
          search: 'a'.repeat(120),
          categoryId: 'phones',
          page: 2,
          size: 12,
          storePage: 1,
          storeSize: 6
        }
      }));
    });

    it('should attach Bearer token when token is in localStorage', async () => {
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'test-token-123';
        return null;
      });

      const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: { products: [] }
      });

      const data = await getMarketplaceHome();

      expect(spy).toHaveBeenCalledWith('/api/v1/marketplace/home', expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123'
        })
      }));
      expect(data).toEqual({ products: [] });
    });

    it('should attach Bearer token when jwt is in localStorage', async () => {
      mockStorage.getItem.mockImplementation((key) => {
        if (key === 'jwt') return 'jwt-token-456';
        return null;
      });

      const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: { products: [] }
      });

      await getMarketplaceHome();

      expect(spy).toHaveBeenCalledWith('/api/v1/marketplace/home', expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-456'
        })
      }));
    });
  });
});
