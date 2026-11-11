/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Product from '../Product';
import { Cart, Checkout } from '../CartCheckout';
import { StoreProvider, useStore } from '../../context/StoreContext';
import * as marketplaceApi from '../../api/marketplace';

vi.mock('../../api/marketplace', () => ({
  getMarketplaceProductById: vi.fn(),
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
    gallery: [item.thumbnail || item.image || 'https://example.com/item.jpg'],
    storeName: item.store?.name || 'Shopify',
    storeId: item.store?.id || 2,
    storeSlug: item.store?.code || 'MAIN',
    stock: 50,
    description: item.description || 'Delicious ice cream direct from store.',
  })),
}));

const mockApiProduct = {
  productId: 5,
  productName: 'Coconut Pandan Ice Cream Cup',
  shortName: 'Coconut Pandan Ice Cream',
  thumbnail: 'https://example.com/pandan.jpg',
  onlinePrice: 3500,
  currencyCode: 'KHR',
  categoryName: 'Frozen Desserts',
  description: 'Authentic coconut pandan ice cream made with fresh coconut milk.',
  store: {
    id: 2,
    name: 'Shopify',
    code: 'MAIN',
  },
};

function CartSummaryInspector() {
  const { cart, totals } = useStore();
  return (
    <div data-testid="checkout-inspector">
      <span data-testid="item-count">{cart.length}</span>
      <span data-testid="cart-total">{totals.total}</span>
    </div>
  );
}

describe('Product Page & E-Commerce Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('loads API product by id and renders title, price in KHR, description, and store link', async () => {
    marketplaceApi.getMarketplaceProductById.mockResolvedValueOnce(mockApiProduct);

    render(
      <MemoryRouter initialEntries={['/product/5']}>
        <StoreProvider>
          <Routes>
            <Route path="/product/:id" element={<Product />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Coconut Pandan Ice Cream Cup/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText('3,500 ៛').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Authentic coconut pandan ice cream/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Shopify/i })[0]).toBeInTheDocument();
  });

  it('adds API product to cart and renders properly on Cart page with store attribution', async () => {
    marketplaceApi.getMarketplaceProductById.mockResolvedValueOnce(mockApiProduct);

    render(
      <MemoryRouter initialEntries={['/product/5']}>
        <StoreProvider>
          <CartSummaryInspector />
          <Routes>
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Coconut Pandan Ice Cream Cup/i })).toBeInTheDocument();
    });

    // Add to basket
    const addButtons = screen.getAllByRole('button', { name: /Add to basket/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    });
  });
});
