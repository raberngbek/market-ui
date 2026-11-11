import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Filter, Grid2X2, List, Search, SlidersHorizontal, Star, X, RefreshCw, AlertCircle } from 'lucide-react';
import { getMarketplaceHome, getMarketplaceProducts, normalizeProduct } from '../api/marketplace';
import { products as catalogProducts } from '../data/catalog';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import FilterGroup from '../components/FilterGroup';
import { money } from '../utils/money';
import { useStore } from '../context/StoreContext';

function FilterContent({ 
  categories = [], 
  filters, 
  setFilters, 
  close, 
  productsList = [],
  currencyCode = 'USD',
  maxPriceLimit = 10000,
  minPriceLimit = 0
}) {
  const currentFilters = filters || { categoryId: '', category: '', brand: '', rating: 0, inStock: false, maxPrice: maxPriceLimit };
  const safeProducts = Array.isArray(productsList) ? productsList : [];

  // Extract distinct store/brand names dynamically from available products
  const availableBrands = useMemo(() => {
    const brandSet = new Set(
      safeProducts
        .map((p) => p?.storeName || p?.brand || p?.store?.name)
        .filter(Boolean)
    );
    return Array.from(brandSet);
  }, [safeProducts]);

  const select = (key, value) => {
    if (typeof setFilters !== 'function') return;
    setFilters((current) => ({
      ...(current || {}),
      [key]: current?.[key] === value ? '' : value,
    }));
  };

  const handleCategorySelect = (cat) => {
    if (!cat) {
      // Clear category
      setFilters((current) => ({
        ...(current || {}),
        categoryId: '',
        category: '',
      }));
      return;
    }
    const catIdStr = String(cat.id ?? '');
    const isSelected = currentFilters.categoryId === catIdStr || currentFilters.category === cat.name;
    setFilters((current) => ({
      ...(current || {}),
      categoryId: isSelected ? '' : catIdStr,
      category: isSelected ? '' : cat.name,
    }));
  };

  const currentMaxPrice = currentFilters.maxPrice !== undefined && currentFilters.maxPrice !== null 
    ? currentFilters.maxPrice 
    : maxPriceLimit;

  return (
    <div className="filters">
      <div className="filter-head">
        <strong>Filters</strong>
        <button 
          type="button"
          onClick={() => setFilters?.({ 
            categoryId: '', 
            category: '', 
            brand: '', 
            rating: 0, 
            inStock: false, 
            maxPrice: maxPriceLimit 
          })}
        >
          Clear all
        </button>
        {close && (
          <button className="icon-button" onClick={close} aria-label="Close filter drawer">
            <X />
          </button>
        )}
      </div>

      {/* DYNAMIC DEPARTMENT / CATEGORY FILTER FROM LIVE API */}
      <FilterGroup title="Department">
        <label key="all-departments">
          <input
            type="radio"
            name="category"
            checked={!currentFilters?.categoryId && !currentFilters?.category}
            onChange={() => handleCategorySelect(null)}
          />
          <span>All Departments</span>
          <small>{safeProducts.length}</small>
        </label>
        {categories.map((item) => {
          const isChecked = String(currentFilters?.categoryId) === String(item.id) || 
            (currentFilters?.category && currentFilters?.category.toLowerCase() === item.name.toLowerCase());
          
          const catCount = safeProducts.filter((p) => 
            (p?.categoryId !== undefined && String(p?.categoryId) === String(item.id)) ||
            (p?.category && p.category.toLowerCase() === item.name.toLowerCase()) ||
            (p?.categoryName && p.categoryName.toLowerCase() === item.name.toLowerCase())
          ).length;

          return (
            <label key={item.id ?? item.name}>
              <input
                type="radio"
                name="category"
                checked={Boolean(isChecked)}
                onChange={() => handleCategorySelect(item)}
              />
              <span>{item.name}</span>
              <small>{catCount}</small>
            </label>
          );
        })}
      </FilterGroup>

      {/* DYNAMIC PRICE RANGE SLIDER */}
      <FilterGroup title={`Price · under ${money(currentMaxPrice, currencyCode)}`}>
        <input
          className="range"
          type="range"
          min={minPriceLimit}
          max={maxPriceLimit}
          step={maxPriceLimit > 1000 ? 500 : 5}
          value={currentMaxPrice}
          onChange={(e) =>
            setFilters?.((current) => ({ ...(current || {}), maxPrice: Number(e.target.value) }))
          }
        />
        <div className="range-labels">
          <span>{money(minPriceLimit, currencyCode)}</span>
          <span>{money(maxPriceLimit, currencyCode)}</span>
        </div>
      </FilterGroup>

      {/* DYNAMIC STORES / BRANDS FILTER */}
      {availableBrands.length > 0 && (
        <FilterGroup title="Store / Merchant">
          {availableBrands.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={currentFilters?.brand === item}
                onChange={() => select('brand', item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </FilterGroup>
      )}

      {/* CUSTOMER RATING FILTER */}
      <FilterGroup title="Customer rating">
        {[4, 3, 2].map((rating) => (
          <label key={rating}>
            <input
              type="radio"
              name="rating"
              checked={currentFilters?.rating === rating}
              onChange={() => setFilters?.((current) => ({ ...(current || {}), rating }))}
            />
            <span className="stars">
              {Array.from({ length: rating }, (_, i) => (
                <Star key={i} size={13} fill="#F2B84B" color="#F2B84B" />
              ))}
              & up
            </span>
          </label>
        ))}
      </FilterGroup>

      {/* AVAILABILITY FILTER */}
      <label className="availability">
        <input
          type="checkbox"
          checked={Boolean(currentFilters?.inStock)}
          onChange={(e) =>
            setFilters?.((current) => ({ ...(current || {}), inStock: e.target.checked }))
          }
        />
        <span>Available today</span>
      </label>
    </div>
  );
}

function ListProduct({ product }) {
  if (!product) return null;
  const { addToCart } = useStore();
  const productId = product?.id || product?.productId || '';
  const storeName = product?.storeName || product?.brand || product?.store?.name || 'Shopify';
  const storeSlug = product?.storeSlug || product?.store?.code || product?.store?.slug || product?.storeId || '';
  const storeLink = storeSlug ? `/vendor/${storeSlug}` : `/store/${product?.storeId || ''}`;
  const currencyCode = product?.currencyCode || 'USD';
  const price = product?.price ?? product?.onlinePrice ?? 0;
  const oldPrice = product?.oldPrice ?? product?.compareAtPrice;

  return (
    <article className="list-product">
      <Link to={`/product/${productId}`}>
        <img 
          src={product?.image || product?.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'} 
          alt={product?.short || product?.name || 'Product'} 
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </Link>
      <div>
        <span className="product-category">
          <Link to={storeLink}>{storeName}</Link>
          {(product?.category || product?.categoryName) && ` · ${product?.category || product?.categoryName}`}
        </span>
        <Link to={`/product/${productId}`}>
          <h2>
            <span className="product-store-title">
              {storeName ? `${storeName} · ` : ''}
            </span>
            {product?.name || product?.productName || ''}
          </h2>
        </Link>
        <span className="rating">
          <Star size={14} fill="#F2B84B" color="#F2B84B" /> {product?.rating ?? 4.9}{' '}
          <small>({product?.reviews ?? 18} reviews)</small>
        </span>
        <p>{product?.description || 'Selected for verified quality and backed by MarketFresh marketplace buyer protection.'}</p>
        <div className="price">
          <strong>{money(price, currencyCode)}</strong>
          {oldPrice && <del>{money(oldPrice, currencyCode)}</del>}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            type="button" 
            className="button primary small"
            onClick={() => addToCart(product)}
          >
            Add to basket
          </button>
          <Link className="button outline small" to={`/product/${productId}`}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Shop({ search, deals }) {
  const { category } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location?.search || '').get('q') || '';
  const decodedCategory = category ? decodeURIComponent(category) : '';

  const { setProducts, setCategories: setGlobalCategories, setTotalProducts } = useStore();

  const [productList, setProductList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    categoryId: '',
    category: decodedCategory || '',
    brand: '',
    rating: 0,
    inStock: false,
    maxPrice: null,
  });

  const [sort, setSort] = useState((location?.search || '').includes('sort=new') ? 'new' : 'popular');
  const [grid, setGrid] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const deferredQuery = useDeferredValue(query);

  // Fetch live products and categories from API
  const fetchMarketplaceProducts = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Call live marketplace home API
      const result = await getMarketplaceHome({
        size: 100,
        categoryId: filters.categoryId || undefined,
        search: deferredQuery || undefined,
      });

      const rawProducts = result?.products?.content || (Array.isArray(result?.products) ? result.products : []);
      const normalizedProds = rawProducts.map(normalizeProduct);
      const apiCategories = Array.isArray(result?.categories) ? result.categories : [];
      const totalCount = result?.products?.totalElements ?? normalizedProds.length;

      // Extract distinct product categories not already in apiCategories to ensure comprehensive options
      const existingCatIds = new Set(apiCategories.map((c) => String(c.id)));
      const existingCatNames = new Set(apiCategories.map((c) => c.name.toLowerCase()));
      
      const extraCategories = [];
      normalizedProds.forEach((p) => {
        const catId = p.categoryId;
        const catName = p.category || p.categoryName;
        if (catName && !existingCatNames.has(catName.toLowerCase())) {
          existingCatNames.add(catName.toLowerCase());
          extraCategories.push({
            id: catId || catName,
            name: catName,
          });
        }
      });

      const mergedCategories = [...apiCategories, ...extraCategories];

      setProductList(normalizedProds);
      setCategoriesList(mergedCategories);
      setTotalElements(totalCount);

      // Sync to global StoreContext
      if (typeof setProducts === 'function') setProducts(normalizedProds);
      if (typeof setGlobalCategories === 'function') setGlobalCategories(mergedCategories);
      if (typeof setTotalProducts === 'function') setTotalProducts(totalCount);
    } catch (err) {
      console.error('[Shop] Failed to fetch marketplace products:', err);
      setFetchError(err?.message || 'Failed to load live marketplace catalog.');
      // Safe fallback to catalog data if remote call fails
      const fallbackItems = (Array.isArray(catalogProducts) ? catalogProducts : []).map(normalizeProduct);
      setProductList(fallbackItems);
      setTotalElements(fallbackItems.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceProducts();
  }, [filters.categoryId, deferredQuery]);

  // Synchronize URL route category parameter
  useEffect(() => {
    if (decodedCategory) {
      // Check if matches category by name or id
      const matched = categoriesList.find((c) => 
        String(c.id) === decodedCategory || 
        c.name.toLowerCase() === decodedCategory.toLowerCase()
      );
      if (matched) {
        setFilters((prev) => ({ 
          ...(prev || {}), 
          categoryId: String(matched.id), 
          category: matched.name 
        }));
      } else {
        setFilters((prev) => ({ 
          ...(prev || {}), 
          category: decodedCategory 
        }));
      }
    }
    setPage(1);
  }, [decodedCategory, categoriesList]);

  // Determine dynamic price range limits from active products
  const { minPriceLimit, maxPriceLimit, primaryCurrency } = useMemo(() => {
    if (!productList || productList.length === 0) {
      return { minPriceLimit: 0, maxPriceLimit: 10000, primaryCurrency: 'USD' };
    }
    const prices = productList.map((p) => Number(p.price || 0));
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    const currency = productList[0]?.currencyCode || 'USD';
    const dynamicMax = max > 1000 ? Math.ceil(max * 1.2 / 500) * 500 : Math.max(100, Math.ceil(max * 1.5));
    return { 
      minPriceLimit: Math.max(0, min), 
      maxPriceLimit: dynamicMax, 
      primaryCurrency: currency 
    };
  }, [productList]);

  const title = search ? `Results for “${query}”` : deals ? 'Today’s best deals' : filters.category || 'All Products Catalog';

  // Client-side filtering & search matching
  const filtered = useMemo(() => {
    const safeList = Array.isArray(productList) ? productList : [];
    return safeList.filter((product) => {
      if (!product) return false;
      const categoryMatch = !filters?.category || 
        (product?.category && product.category.toLowerCase() === filters.category.toLowerCase()) ||
        (product?.categoryName && product.categoryName.toLowerCase() === filters.category.toLowerCase()) ||
        (filters.categoryId && String(product.categoryId) === String(filters.categoryId));

      const brandMatch = !filters?.brand || 
        (product?.storeName && product.storeName.toLowerCase() === filters.brand.toLowerCase()) ||
        (product?.brand && product.brand.toLowerCase() === filters.brand.toLowerCase());

      const priceMatch = filters?.maxPrice === null || filters?.maxPrice === undefined || (product?.price ?? 0) <= filters.maxPrice;
      const ratingMatch = (product?.rating ?? 4.9) >= (filters?.rating ?? 0);
      const stockMatch = !filters?.inStock || (product?.stockQuantity ?? product?.stock ?? 0) > 0;

      const searchStr = `${product?.name || ''} ${product?.short || ''} ${product?.category || ''} ${product?.storeName || ''} ${product?.description || ''}`.toLowerCase();
      const queryMatch = !deferredQuery || searchStr.includes(deferredQuery.toLowerCase());
      const dealsMatch = !deals || Boolean(product?.oldPrice || product?.compareAtPrice);

      return categoryMatch && brandMatch && priceMatch && ratingMatch && stockMatch && queryMatch && dealsMatch;
    });
  }, [productList, filters, deferredQuery, deals]);

  // Client-side sorting
  const sorted = useMemo(() => {
    const safeFiltered = Array.isArray(filtered) ? filtered : [];
    return [...safeFiltered].sort((a, b) => {
      if (!a || !b) return 0;
      if (sort === 'price-low') return (a?.price ?? 0) - (b?.price ?? 0);
      if (sort === 'price-high') return (b?.price ?? 0) - (a?.price ?? 0);
      if (sort === 'rating') return (b?.rating ?? 0) - (a?.rating ?? 0);
      if (sort === 'new') return Number(b?.id || 0) - Number(a?.id || 0);
      // popular
      if (b?.featured !== a?.featured) return b?.featured ? 1 : -1;
      return (b?.reviews ?? 0) - (a?.reviews ?? 0);
    });
  }, [filtered, sort]);

  const pageSize = 12;
  const safeSorted = Array.isArray(sorted) ? sorted : [];
  const visible = safeSorted.slice((page - 1) * pageSize, page * pageSize);
  const maxPage = Math.max(1, Math.ceil(safeSorted.length / pageSize));

  // Determine displayed total count:
  // When filters/search are active, show the filtered count; otherwise show data.products.totalElements
  const isFiltering = Boolean(filters.categoryId || filters.category || filters.brand || filters.rating || filters.inStock || deferredQuery);
  const displayedCount = isFiltering ? safeSorted.length : (totalElements || safeSorted.length);

  return (
    <main className="shop-page">
      <div className="container">
        <Breadcrumb current={title} />
        <div className="shop-title">
          <div>
            <span className="eyebrow">
              {search ? 'SEARCH RESULTS' : deals ? 'SPECIAL OFFERS & PROMOTIONS' : 'MARKETPLACE CATALOG'}
            </span>
            <h1>{title}</h1>
            <p>
              {search
                ? `${displayedCount} items found matching your search.`
                : `Explore authentic products direct from verified independent stores.`}
            </p>
          </div>
          {deals && (
            <div className="deal-countdown">
              <small>SPECIAL OFFER ENDS IN</small>
              <b>11 : 42 : 08</b>
            </div>
          )}
        </div>

        {fetchError && (
          <div className="empty-state" style={{ minHeight: '100px', padding: '1rem', color: '#c54b42', textAlign: 'center' }}>
            <p>Notice: {fetchError}</p>
            <button type="button" className="button outline small" onClick={fetchMarketplaceProducts} style={{ marginTop: '8px' }}>
              <RefreshCw size={14} /> Retry loading catalog
            </button>
          </div>
        )}

        <div className="shop-layout">
          <aside className="filter-sidebar">
            <FilterContent 
              categories={categoriesList}
              filters={filters} 
              setFilters={setFilters} 
              productsList={productList} 
              currencyCode={primaryCurrency}
              maxPriceLimit={maxPriceLimit}
              minPriceLimit={minPriceLimit}
            />
          </aside>

          <section className="shop-results">
            <div className="listing-controls">
              <span>
                <b>{displayedCount}</b> {displayedCount === 1 ? 'item' : 'items'} found
              </span>
              <div>
                <button className="mobile-filter" onClick={() => setDrawer(true)}>
                  <SlidersHorizontal size={17} /> Filter
                </button>
                <button
                  className={grid ? 'view-toggle selected' : 'view-toggle'}
                  onClick={() => setGrid(true)}
                  aria-label="Grid view"
                >
                  <Grid2X2 size={18} />
                </button>
                <button
                  className={!grid ? 'view-toggle selected' : 'view-toggle'}
                  onClick={() => setGrid(false)}
                  aria-label="List view"
                >
                  <List size={19} />
                </button>
                <label className="sort-select">
                  Sort by{' '}
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="popular">Most popular</option>
                    <option value="new">Newest items</option>
                    <option value="rating">Top rated</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                  </select>
                </label>
              </div>
            </div>

            {loading && !productList.length ? (
              <div className="text-center py-16" style={{ padding: '60px 0', textAlign: 'center' }}>
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600 font-medium">Loading live marketplace products...</p>
              </div>
            ) : visible.length ? (
              <div className={grid ? 'product-grid listing-grid' : 'product-list'}>
                {visible.map((product) =>
                  grid ? (
                    <ProductCard key={product?.id || product?.productId} product={product} />
                  ) : (
                    <ListProduct key={product?.id || product?.productId} product={product} />
                  )
                )}
              </div>
            ) : (
              <div className="empty-state listing-empty">
                <Search size={38} />
                <h3>Nothing matches these filters</h3>
                <p>Try widening your price range or clearing a filter.</p>
                <button
                  className="button outline"
                  onClick={() => setFilters({ categoryId: '', category: '', brand: '', rating: 0, inStock: false, maxPrice: maxPriceLimit })}
                >
                  Clear filters
                </button>
              </div>
            )}

            {maxPage > 1 && (
              <nav className="pagination" aria-label="Product pages">
                {Array.from({ length: maxPage }, (_, index) => (
                  <button
                    key={index}
                    className={page === index + 1 ? 'active' : ''}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            )}
          </section>
        </div>
      </div>

      <div className={`filter-drawer ${drawer ? 'open' : ''}`}>
        <div className="filter-drawer-panel">
          <FilterContent
            categories={categoriesList}
            filters={filters}
            setFilters={setFilters}
            productsList={productList}
            currencyCode={primaryCurrency}
            maxPriceLimit={maxPriceLimit}
            minPriceLimit={minPriceLimit}
            close={() => setDrawer(false)}
          />
          <button className="button primary wide" onClick={() => setDrawer(false)}>
            Show {displayedCount} results
          </button>
        </div>
        <button className="drawer-backdrop" onClick={() => setDrawer(false)} aria-label="Close filters" />
      </div>
    </main>
  );
}
