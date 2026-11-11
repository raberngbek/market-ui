/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Shop from '../Shop';
import { StoreProvider, useStore } from '../../context/StoreContext';
import * as marketplaceApi from '../../api/marketplace';

vi.mock('../../api/marketplace', () => ({
  getMarketplaceHome: vi.fn(),
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
    categoryId: item.categoryId ?? 10,
    image: item.thumbnail || item.image || 'https://example.com/item.jpg',
    storeName: item.store?.name || 'Shopify',
    storeId: item.store?.id || 2,
    storeSlug: item.store?.code || 'MAIN',
    stock: item.quantity ?? 50,
    stockQuantity: item.quantity ?? 50,
  })),
}));

const mockHomeData = {
  categories: [
    { id: 10, name: 'Frozen Desserts' },
    { id: 1, name: 'Ice Cream' },
    { id: 4, name: 'Bakery & Desserts' },
  ],
  products: {
    content: [
      {
        productId: 5,
        productName: 'Coconut Pandan Ice Cream Cup',
        shortName: 'Coconut Pandan Ice Cream',
        thumbnail: 'https://example.com/pandan.jpg',
        onlinePrice: 3500,
        currencyCode: 'KHR',
        categoryId: 10,
        categoryName: 'Frozen Desserts',
        quantity: 50,
        store: { id: 2, name: 'Shopify', code: 'MAIN' },
      },
      {
        productId: 6,
        productName: 'Mango Sticky Rice Ice Cream',
        shortName: 'Mango Sticky Rice Ice Cream',
        thumbnail: 'https://example.com/mango.jpg',
        onlinePrice: 5500,
        currencyCode: 'KHR',
        categoryId: 10,
        categoryName: 'Frozen Desserts',
        quantity: 20,
        store: { id: 2, name: 'Shopify', code: 'MAIN' },
      },
      {
        productId: 1,
        productName: 'Ice Cream Classic',
        shortName: 'Ice Cream',
        thumbnail: 'https://example.com/icecream.jpg',
        onlinePrice: 0.5,
        currencyCode: 'USD',
        categoryId: 1,
        categoryName: 'Ice Cream',
        quantity: 100,
        store: { id: 2, name: 'Shopify', code: 'MAIN' },
      },
    ],
    page: 0,
    totalPages: 1,
    totalElements: 13,
  },
};

function CartCountInspector() {
  const { cart } = useStore();
  return <div data-testid="cart-count">{cart.length}</div>;
}

describe('Shop Page Marketplace Catalog Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('loads real products from API and displays accurate total count', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValueOnce(mockHomeData);

    render(
      <MemoryRouter initialEntries={['/shop']}>
        <StoreProvider>
          <Routes>
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Coconut Pandan Ice Cream Cup')).toBeInTheDocument();
    });

    expect(screen.getByText('Mango Sticky Rice Ice Cream')).toBeInTheDocument();
    expect(screen.getByText('Ice Cream Classic')).toBeInTheDocument();

    // Check count matching totalElements (13)
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText(/items found/i)).toBeInTheDocument();
  });

  it('populates dynamic departments in sidebar from API categories', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValueOnce(mockHomeData);

    render(
      <MemoryRouter initialEntries={['/shop']}>
        <StoreProvider>
          <Routes>
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('All Departments')[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText('Frozen Desserts')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ice Cream')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Bakery & Desserts')[0]).toBeInTheDocument();
  });

  it('filters by category when department radio is clicked', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValue(mockHomeData);

    render(
      <MemoryRouter initialEntries={['/shop']}>
        <StoreProvider>
          <Routes>
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ice Cream Classic')).toBeInTheDocument();
    });

    // Click "Frozen Desserts" department
    const frozenOption = screen.getAllByRole('radio', { name: /Frozen Desserts/i })[0];
    fireEvent.click(frozenOption);

    await waitFor(() => {
      expect(marketplaceApi.getMarketplaceHome).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: '10',
        })
      );
    });
  });

  it('adds real API product to cart when clicking Add to basket', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValueOnce(mockHomeData);

    render(
      <MemoryRouter initialEntries={['/shop']}>
        <StoreProvider>
          <CartCountInspector />
          <Routes>
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Coconut Pandan Ice Cream Cup')).toBeInTheDocument();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');

    const addButtons = screen.getAllByRole('button', { name: /Add .* to basket/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });
  });
});
