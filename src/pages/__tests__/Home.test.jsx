/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';
import { StoreProvider, useStore } from '../../context/StoreContext';
import * as marketplaceApi from '../../api/marketplace';

vi.mock('../../api/marketplace', () => ({
  getMarketplaceHome: vi.fn(),
  getMarketPlaceHome: vi.fn(),
}));

const mockHomeData = {
  categories: [
    { id: 101, name: 'Smartphones & Tech' },
    { id: 102, name: 'Automotive' },
  ],
  stores: {
    content: [
      {
        id: 'tech-nexus',
        slug: 'tech-nexus',
        name: 'Tech Nexus Store',
        city: 'Phnom Penh',
        country: 'Cambodia',
        storeType: 'Electronics',
        about: 'Premium electronics retailer',
        rating: 4.9,
        reviews: 120,
        minOrder: 15,
        banner: 'https://example.com/banner.jpg',
        avatar: 'https://example.com/avatar.jpg',
      },
    ],
    page: 0,
    totalPages: 2,
    totalElements: 15,
  },
  featuredProducts: [
    {
      id: 'feat-1',
      name: 'Featured Super Phone',
      price: 999,
      category: 'Smartphones',
      image: 'https://example.com/phone.jpg',
      badge: 'Bestseller',
      storeName: 'Tech Nexus Store',
      storeId: 'tech-nexus',
    },
  ],
  products: {
    content: [
      {
        id: 'prod-1',
        name: 'Standard Laptop Pro',
        price: 1299,
        category: 'Computers',
        image: 'https://example.com/laptop.jpg',
        storeName: 'Tech Nexus Store',
        storeId: 'tech-nexus',
      },
    ],
    page: 0,
    totalPages: 2,
    totalElements: 25,
  },
  account: {
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
  cart: [
    { id: 'cart-1', key: 'cart-1-default', name: 'Synced Item', price: 50, quantity: 2 },
  ],
  favorites: [
    { id: 'fav-1', name: 'Favorite Item', price: 30 },
  ],
};

function StoreStateInspector() {
  const { account, cart, wishlist } = useStore();
  return (
    <div data-testid="store-state">
      <span data-testid="user-account">{account?.name}</span>
      <span data-testid="cart-count">{cart?.length}</span>
      <span data-testid="wishlist-count">{wishlist?.length}</span>
    </div>
  );
}

describe('Home Page Marketplace Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders stores directory first with categories by id and store cards', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValueOnce(mockHomeData);

    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </MemoryRouter>
    );

    // Initial loading state
    expect(screen.getByText(/Loading stores directory.../i)).toBeInTheDocument();

    // After data loads, it shows Stores Directory
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Stores Directory' })).toBeInTheDocument();
    });

    // Check Category Bar with All Stores option and dynamic categories
    expect(screen.getByRole('button', { name: /^All Stores$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Smartphones & Tech' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Automotive' })).toBeInTheDocument();

    // Check Stores Directory Cards
    expect(screen.getByRole('heading', { name: 'Tech Nexus Store' })).toBeInTheDocument();
    expect(screen.getByText('Phnom Penh, Cambodia')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();

    // Check "Enter Store" link to /vendor/:slug
    const visitLink = screen.getByRole('link', { name: /Enter Tech Nexus Store/i });
    expect(visitLink).toHaveAttribute('href', '/vendor/tech-nexus');
  });

  it('filters by categoryId when category button is clicked and resets on All Stores', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValue(mockHomeData);

    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Smartphones & Tech')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Smartphones & Tech' }));

    await waitFor(() => {
      expect(marketplaceApi.getMarketplaceHome).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: '101',
        })
      );
    });

    // Click "All Stores" reset option
    fireEvent.click(screen.getByRole('button', { name: /^All Stores$/i }));

    await waitFor(() => {
      expect(marketplaceApi.getMarketplaceHome).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: undefined,
        })
      );
    });
  });

  it('syncs user account, cart, and favorites into global context', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValueOnce(mockHomeData);

    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
          <StoreStateInspector />
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-account')).toHaveTextContent('Jane Doe');
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('wishlist-count')).toHaveTextContent('1');
    });
  });

  it('supports pagination controls for stores directory', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValue(mockHomeData);

    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Stores Directory' })).toBeInTheDocument();
    });

    // Click next store page button
    const nextBtn = screen.getByRole('button', { name: /Next store page/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(marketplaceApi.getMarketplaceHome).toHaveBeenCalledWith(
        expect.objectContaining({
          storePage: 1,
        })
      );
    });
  });

  it('handles empty fallback state when no stores match', async () => {
    marketplaceApi.getMarketplaceHome.mockResolvedValueOnce({
      categories: [],
      stores: { content: [], page: 0, totalPages: 0 },
    });

    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No approved stores found')).toBeInTheDocument();
    });
  });

  it('handles error fallback and allows retry', async () => {
    marketplaceApi.getMarketplaceHome.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <StoreProvider>
          <Home />
        </StoreProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load marketplace stores')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    marketplaceApi.getMarketplaceHome.mockResolvedValueOnce(mockHomeData);
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Stores Directory' })).toBeInTheDocument();
    });
  });
});
