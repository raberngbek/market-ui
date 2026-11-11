/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Storefront from '../Storefront';
import { StoreProvider, useStore } from '../../context/StoreContext';
import * as marketplaceApi from '../../api/marketplace';

vi.mock('../../api/marketplace', () => ({
  getMarketplaceStoreById: vi.fn(),
  getMarketplaceProducts: vi.fn(),
  normalizeProduct: vi.fn((item) => ({
    id: item.productId || item.id,
    productId: item.productId || item.id,
    name: item.productName || item.name || 'Product',
    short: item.shortName || item.short || item.productName || item.name,
    price: item.onlinePrice ?? item.price ?? 0,
    currencyCode: item.currencyCode || 'KHR',
    category: item.categoryName || item.category || 'Desserts',
    categoryName: item.categoryName || item.category || 'Desserts',
    image: item.thumbnail || item.image || 'https://example.com/item.jpg',
    storeName: item.store?.name || 'Shopify',
    storeId: item.store?.id || 2,
    storeSlug: item.store?.code || 'MAIN',
    stock: 50,
  })),
}));

const mockApiStore = {
  id: 2,
  code: 'MAIN',
  slug: 'MAIN',
  name: 'Shopify',
  storeType: 'General Retail',
  rawStoreType: 'GENERAL_RETAIL',
  city: 'Phnom Penh',
  countryCode: 'KH',
  location: 'Phnom Penh, KH',
  hours: 'Open Daily: 09:00 - 18:00 (Phnom Penh)',
  image: 'https://example.com/shopify-logo.jpg',
  avatar: 'https://example.com/shopify-logo.jpg',
  banner: 'https://example.com/shopify-banner.jpg',
  rating: 4.9,
  reviews: 128,
  minOrder: 0,
  phone: '+855 (0) 23 888 999',
  email: 'support@shopify.kh',
  about: 'Verified Shopify retail outlet in Phnom Penh.',
};

const mockApiProducts = [
  {
    productId: 5,
    productName: 'Coconut Pandan Ice Cream Cup',
    shortName: 'Coconut Pandan Ice Cream',
    thumbnail: 'https://example.com/pandan.jpg',
    onlinePrice: 3500,
    currencyCode: 'KHR',
    categoryName: 'Frozen Desserts',
    store: { id: 2, name: 'Shopify', code: 'MAIN' },
  },
  {
    productId: 6,
    productName: 'Mango Sticky Rice Ice Cream',
    shortName: 'Mango Sticky Rice Ice Cream',
    thumbnail: 'https://example.com/mango.jpg',
    onlinePrice: 5500,
    currencyCode: 'KHR',
    categoryName: 'Frozen Desserts',
    store: { id: 2, name: 'Shopify', code: 'MAIN' },
  },
  {
    productId: 1,
    productName: 'Ice Cream Classic',
    shortName: 'Ice Cream',
    thumbnail: 'https://example.com/icecream.jpg',
    onlinePrice: 0.5,
    currencyCode: 'USD',
    categoryName: 'Ice Cream',
    store: { id: 2, name: 'Shopify', code: 'MAIN' },
  },
];

function CartInspector() {
  const { cart } = useStore();
  return <div data-testid="cart-count">{cart.length}</div>;
}

describe('Storefront Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('loads store and displays header details, opening hours, and location from API', async () => {
    marketplaceApi.getMarketplaceStoreById.mockResolvedValueOnce(mockApiStore);
    marketplaceApi.getMarketplaceProducts.mockResolvedValueOnce({ content: mockApiProducts });

    render(
      <MemoryRouter initialEntries={['/vendor/MAIN']}>
        <StoreProvider>
          <Routes>
            <Route path="/vendor/:slug" element={<Storefront />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    // Header details
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Shopify' })).toBeInTheDocument();
    });

    expect(screen.getByText('Phnom Penh, KH')).toBeInTheDocument();
    expect(screen.getByText('General Retail')).toBeInTheDocument();
    expect(screen.getAllByText(/Open Daily: 09:00 - 18:00/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Verified Shopify retail outlet in Phnom Penh/i)).toBeInTheDocument();
  });

  it('renders all products belonging to the store and dynamic categories', async () => {
    marketplaceApi.getMarketplaceStoreById.mockResolvedValueOnce(mockApiStore);
    marketplaceApi.getMarketplaceProducts.mockResolvedValueOnce({ content: mockApiProducts });

    render(
      <MemoryRouter initialEntries={['/vendor/MAIN']}>
        <StoreProvider>
          <Routes>
            <Route path="/vendor/:slug" element={<Storefront />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Coconut Pandan Ice Cream Cup')).toBeInTheDocument();
    });

    expect(screen.getByText('Mango Sticky Rice Ice Cream')).toBeInTheDocument();
    expect(screen.getByText('Ice Cream Classic')).toBeInTheDocument();

    // Check categories derived dynamically
    expect(screen.getByRole('tab', { name: /All Items/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Frozen Desserts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ice Cream/i })).toBeInTheDocument();
  });

  it('wires Add to basket on product cards directly into StoreContext cart', async () => {
    marketplaceApi.getMarketplaceStoreById.mockResolvedValueOnce(mockApiStore);
    marketplaceApi.getMarketplaceProducts.mockResolvedValueOnce({ content: mockApiProducts });

    render(
      <MemoryRouter initialEntries={['/store/2']}>
        <StoreProvider>
          <CartInspector />
          <Routes>
            <Route path="/store/:storeId" element={<Storefront />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Coconut Pandan Ice Cream Cup')).toBeInTheDocument();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');

    // Click "Add to basket" on the first product card
    const addButtons = screen.getAllByRole('button', { name: /Add .* to basket/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });
  });
});
