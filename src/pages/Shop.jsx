import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Filter, Grid2X2, List, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { products as catalogProducts } from '../data/catalog';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import FilterGroup from '../components/FilterGroup';
import { money } from '../utils/money';
import { api } from '../api';

const brands = ['Good Earth Farm', 'Kitchen Kind', 'Berry & Co.', 'Harbor Catch', 'Early Bird Bakery', 'Olive Grove'];

function FilterContent({ filters, setFilters, close, productsList = [] }) {
  const currentFilters = filters || { category: '', brand: '', rating: 0, inStock: false, maxPrice: 50 };
  const safeProducts = Array.isArray(productsList) ? productsList : [];

  const select = (key, value) => {
    if (typeof setFilters !== 'function') return;
    setFilters((current) => ({
      ...(current || {}),
      [key]: current?.[key] === value ? '' : value,
    }));
  };

  return (
    <div className="filters">
      <div className="filter-head">
        <strong>Filters</strong>
        <button onClick={() => setFilters?.({ category: '', brand: '', rating: 0, inStock: false, maxPrice: 50 })}>
          Clear all
        </button>
        {close && (
          <button className="icon-button" onClick={close}>
            <X />
          </button>
        )}
      </div>
      <FilterGroup title="Food aisle">
        {['Fresh Produce', 'Ready to Eat', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery'].map((item) => (
          <label key={item}>
            <input
              type="radio"
              name="category"
              checked={currentFilters?.category === item}
              onChange={() => select('category', item)}
            />
            <span>{item}</span>
            <small>{safeProducts.filter((p) => p?.category === item).length}</small>
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title={`Price · under ${money(currentFilters?.maxPrice ?? 50)}`}>
        <input
          className="range"
          type="range"
          min="3"
          max="50"
          step="1"
          value={currentFilters?.maxPrice ?? 50}
          onChange={(e) =>
            setFilters?.((current) => ({ ...(current || {}), maxPrice: Number(e.target.value) }))
          }
        />
        <div className="range-labels">
          <span>$3</span>
          <span>{money(currentFilters?.maxPrice ?? 50)}</span>
        </div>
      </FilterGroup>
      <FilterGroup title="Producer">
        {brands.map((item) => (
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
                <Star key={i} size={13} fill="currentColor" />
              ))}
              & up
            </span>
          </label>
        ))}
      </FilterGroup>
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

export default function Shop({ search, deals }) {
  const { category } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location?.search || '').get('q') || '';
  const decodedCategory = category ? decodeURIComponent(category) : '';

  // Initial state hooks default to empty arrays and valid safe objects
  const [productList, setProductList] = useState([]);
  const [filters, setFilters] = useState({
    category: decodedCategory || '',
    brand: '',
    rating: 0,
    inStock: false,
    maxPrice: 50,
  });
  const [sort, setSort] = useState((location?.search || '').includes('sort=new') ? 'new' : 'popular');
  const [grid, setGrid] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Safe async API fetch wrapped in try...catch block
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        setFetchError(null);
        // Fallback safely to catalog data if remote call fails or is unconfigured
        const items = Array.isArray(catalogProducts) ? catalogProducts : [];
        if (isMounted) {
          setProductList(items);
        }
      } catch (err) {
        console.error('[Shop] Failed to fetch products:', err);
        if (isMounted) {
          setFetchError(err?.message || 'Failed to load products');
          setProductList(Array.isArray(catalogProducts) ? catalogProducts : []);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...(prev || {}), category: decodedCategory || '' }));
    setPage(1);
  }, [decodedCategory, query]);

  const deferredQuery = useDeferredValue(query);
  const title = search ? `Results for “${query}”` : deals ? 'Today’s best deals' : decodedCategory || 'Shop all';

  const filtered = useMemo(() => {
    const safeList = Array.isArray(productList) ? productList : [];
    return safeList.filter((product) => {
      if (!product) return false;
      const categoryMatch = !filters?.category || product?.category === filters?.category;
      const brandMatch = !filters?.brand || product?.brand === filters?.brand;
      const priceMatch = (product?.price ?? 0) <= (filters?.maxPrice ?? 50);
      const ratingMatch = (product?.rating ?? 0) >= (filters?.rating ?? 0);
      const stockMatch = !filters?.inStock || (product?.stock ?? 0) > 0;
      const searchStr = `${product?.name || ''} ${product?.category || ''} ${product?.brand || ''}`.toLowerCase();
      const queryMatch = !deferredQuery || searchStr.includes((deferredQuery || '').toLowerCase());
      const dealsMatch = !deals || Boolean(product?.oldPrice);
      return categoryMatch && brandMatch && priceMatch && ratingMatch && stockMatch && queryMatch && dealsMatch;
    });
  }, [productList, filters, deferredQuery, deals]);

  const sorted = useMemo(() => {
    const safeFiltered = Array.isArray(filtered) ? filtered : [];
    return [...safeFiltered].sort((a, b) => {
      if (!a || !b) return 0;
      if (sort === 'price-low') return (a?.price ?? 0) - (b?.price ?? 0);
      if (sort === 'price-high') return (b?.price ?? 0) - (a?.price ?? 0);
      if (sort === 'rating') return (b?.rating ?? 0) - (a?.rating ?? 0);
      if (sort === 'new') return String(b?.id || '').localeCompare(String(a?.id || ''));
      return (b?.sold ?? 0) - (a?.sold ?? 0);
    });
  }, [filtered, sort]);

  const pageSize = 8;
  const safeSorted = Array.isArray(sorted) ? sorted : [];
  const visible = safeSorted.slice((page - 1) * pageSize, page * pageSize);
  const maxPage = Math.max(1, Math.ceil(safeSorted.length / pageSize));

  return (
    <main className="shop-page">
      <div className="container">
        <Breadcrumb current={title} />
        <div className="shop-title">
          <div>
            <span className="eyebrow">
              {search ? 'SEARCH RESULTS' : deals ? 'FRESH SAVINGS THIS WEEK' : 'FRESH FOOD, LOCAL FLAVOR'}
            </span>
            <h1>{title}</h1>
            <p>
              {search
                ? `${safeSorted.length} food picks found`
                : 'Groceries and ready-to-eat favorites, selected from producers we trust.'}
            </p>
          </div>
          {deals && (
            <div className="deal-countdown">
              <small>FRESH DEAL ENDS IN</small>
              <b>11 : 42 : 08</b>
            </div>
          )}
        </div>

        {fetchError && (
          <div className="empty-state" style={{ minHeight: '120px', padding: '1rem', color: '#c54b42' }}>
            <p>Notice: {fetchError}</p>
          </div>
        )}

        <div className="shop-layout">
          <aside className="filter-sidebar">
            <FilterContent filters={filters} setFilters={setFilters} productsList={productList} />
          </aside>

          <section className="shop-results">
            <div className="listing-controls">
              <span>
                <b>{safeSorted.length}</b> fresh picks
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
                    <option value="new">New this week</option>
                    <option value="rating">Top rated</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                  </select>
                </label>
              </div>
            </div>

            {visible.length ? (
              <div className={grid ? 'product-grid listing-grid' : 'product-list'}>
                {visible.map((product) =>
                  grid ? (
                    <ProductCard key={product?.id || Math.random()} product={product} />
                  ) : (
                    <ListProduct key={product?.id || Math.random()} product={product} />
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
                  onClick={() => setFilters({ category: '', brand: '', rating: 0, inStock: false, maxPrice: 50 })}
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
            filters={filters}
            setFilters={setFilters}
            productsList={productList}
            close={() => setDrawer(false)}
          />
          <button className="button primary wide" onClick={() => setDrawer(false)}>
            Show {safeSorted.length} fresh picks
          </button>
        </div>
        <button className="drawer-backdrop" onClick={() => setDrawer(false)} aria-label="Close filters" />
      </div>
    </main>
  );
}

function ListProduct({ product }) {
  if (!product) return null;
  const productId = product?.id || '';
  return (
    <article className="list-product">
      <Link to={`/product/${productId}`}>
        <img src={product?.image || ''} alt={product?.short || 'Product'} />
      </Link>
      <div>
        <span className="product-category">
          {product?.category || ''} · {product?.brand || ''}
        </span>
        <Link to={`/product/${productId}`}>
          <h2>{product?.name || ''}</h2>
        </Link>
        <span className="rating">
          <Star size={14} fill="currentColor" /> {product?.rating ?? 0}{' '}
          <small>({product?.reviews ?? 0} reviews)</small>
        </span>
        <p>Selected for peak freshness and hand-picked shortly before your delivery window.</p>
        <div className="price">
          <strong>{money(product?.price)}</strong>
          {product?.oldPrice && <del>{money(product.oldPrice)}</del>}
        </div>
        <Link className="button outline small" to={`/product/${productId}`}>
          Choose delivery
        </Link>
      </div>
    </article>
  );
}

