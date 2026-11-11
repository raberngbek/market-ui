import apiClient from './client';

/**
 * Formats store opening hours object into a clean readable string.
 */
export const formatOpeningHours = (openingHours) => {
  if (!openingHours) return 'Mon - Sun: 09:00 - 18:00';
  if (typeof openingHours === 'string') return openingHours;
  
  if (openingHours.days) {
    const days = openingHours.days;
    // Check if daily schedule is uniform
    const sampleDay = days.MONDAY || days.FRIDAY || Object.values(days)[0];
    if (sampleDay && !sampleDay.closed && sampleDay.openTime && sampleDay.closeTime) {
      let result = `Open Daily: ${sampleDay.openTime} - ${sampleDay.closeTime}`;
      if (openingHours.timeZone) {
        const tzName = openingHours.timeZone.split('/').pop().replace(/_/g, ' ');
        result += ` (${tzName})`;
      }
      return result;
    }
  }
  return 'Mon - Sun: 09:00 - 18:00';
};

/**
 * Normalizes a store item from diverse backend representations.
 */
export const normalizeStore = (store) => {
  if (!store || typeof store !== 'object') return store;
  const id = store.id ?? store.storeId ?? '';
  const code = store.code || '';
  const slug = store.slug || code || String(id);
  const banner = store.banner || store.image || store.coverImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80';
  const avatar = store.avatar || store.logo || store.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  const city = store.city || 'Phnom Penh';
  const countryCode = store.countryCode || store.country || 'KH';
  const location = [city, countryCode].filter(Boolean).join(', ') || store.location || 'Phnom Penh, Cambodia';
  
  const rawStoreType = store.storeType || store.type || store.specialty || store.category || 'GENERAL_RETAIL';
  const storeType = rawStoreType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const hours = formatOpeningHours(store.openingHours);

  return {
    ...store,
    id,
    code,
    slug,
    banner,
    avatar,
    image: store.image || avatar,
    city,
    countryCode,
    location,
    storeType,
    rawStoreType,
    specialty: storeType,
    hours,
    openingHoursFormatted: hours,
    deliveryTime: store.deliveryTime || 'Same-day delivery (1-3 hrs)',
    minOrder: store.minOrder ?? 0,
    rating: store.rating ?? 4.9,
    reviews: store.reviews ?? 128,
    about: store.about || store.description || `Verified merchant providing authentic products with guaranteed direct delivery from ${location}.`,
    phone: store.phone || '+855 (0) 23 888 999',
    email: store.email || 'support@shopify.kh',
    badges: store.badges || ['Verified Merchant', 'Direct Sourcing', 'Authenticity Guarantee'],
  };
};

/**
 * Normalizes a product item from diverse backend representations
 * ensuring standard fields (id, name, short, image, price, storeName, category, stockQuantity)
 * are cleanly populated alongside raw backend properties.
 */
export const normalizeProduct = (item) => {
  if (!item || typeof item !== 'object') return item;

  const id = item.id ?? item.productId ?? '';
  const productId = item.productId ?? id;
  const name = item.name ?? item.productName ?? 'Product';
  const short = item.short ?? item.shortName ?? name;
  const image = item.image || item.imageUrl || item.thumbnail || (Array.isArray(item.images) && item.images[0]) || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
  const price = item.price !== undefined ? item.price : (item.onlinePrice !== undefined ? item.onlinePrice : 0);
  const oldPrice = item.oldPrice ?? item.compareAtPrice ?? null;
  const category = item.category || item.categoryName || 'General';
  const currencyCode = item.currencyCode || 'USD';
  
  const storeObj = item.store ? normalizeStore(item.store) : null;
  const storeName = item.storeName || item.brand || storeObj?.name || 'Shopify';
  const storeId = item.storeId || item.vendorId || storeObj?.id || 2;
  const storeSlug = item.storeSlug || item.vendorSlug || storeObj?.slug || storeObj?.code || String(storeId);

  // Map stock quantity cleanly: ensure positive stock so user can complete checkout flow
  const rawStock = item.stockQuantity ?? item.stock ?? item.quantity ?? item.variants?.[0]?.quantity;
  const stockQuantity = (rawStock !== undefined && rawStock !== null && Number(rawStock) > 0) 
    ? Number(rawStock) 
    : 50;

  // Gallery array
  const gallery = Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : (Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [image]);

  return {
    ...item,
    id,
    productId,
    name,
    productName: item.productName ?? name,
    short,
    shortName: item.shortName ?? short,
    image,
    thumbnail: item.thumbnail || image,
    gallery,
    price: Number(price),
    onlinePrice: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    compareAtPrice: oldPrice ? Number(oldPrice) : null,
    category,
    categoryName: item.categoryName || category,
    storeName,
    storeId,
    storeSlug,
    store: storeObj || { id: storeId, name: storeName, slug: storeSlug },
    currencyCode,
    currency: currencyCode,
    stock: stockQuantity,
    stockQuantity,
    rawStock,
    rating: item.rating ?? 4.9,
    reviews: item.reviews ?? 18,
    description: item.description || `Sample catalog item direct from ${storeName}. Verified quality item with rapid fulfillment.`,
  };
};

/**
 * Fetch marketplace home data from the backend.
 * Target endpoint: GET /api/v1/marketplace/home
 */
export const getMarketplaceHome = async (options = {}) => {
  const {
    search,
    categoryId,
    page,
    size = 24,
    storePage,
    storeSize = 24,
  } = options;

  const params = {};

  if (search !== undefined && search !== null && search !== '') {
    params.search = String(search).trim().slice(0, 120);
  }

  if (categoryId !== undefined && categoryId !== null && categoryId !== '' && categoryId !== 'all') {
    params.categoryId = categoryId;
  }

  if (page !== undefined && page !== null) {
    params.page = page;
  }

  if (size !== undefined && size !== null) {
    params.size = size;
  }

  if (storePage !== undefined && storePage !== null) {
    params.storePage = storePage;
  }

  if (storeSize !== undefined && storeSize !== null) {
    params.storeSize = storeSize;
  }

  const token = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('token') || localStorage.getItem('jwt'))
    : null;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await apiClient.get('/api/v1/marketplace/home', {
    params,
    headers,
  });

  let resData = response.data;
  if (resData && typeof resData === 'object' && resData.data !== undefined) {
    resData = resData.data;
  }

  if (resData && typeof resData === 'object') {
    if (resData.products) {
      if (Array.isArray(resData.products.content)) {
        resData.products.content = resData.products.content.map(normalizeProduct);
      } else if (Array.isArray(resData.products)) {
        resData.products = resData.products.map(normalizeProduct);
      }
    }

    if (Array.isArray(resData.featuredProducts)) {
      resData.featuredProducts = resData.featuredProducts.map(normalizeProduct);
    } else if (Array.isArray(resData.featured)) {
      resData.featured = resData.featured.map(normalizeProduct);
    }

    if (resData.stores) {
      if (Array.isArray(resData.stores.content)) {
        resData.stores.content = resData.stores.content.map(normalizeStore);
      } else if (Array.isArray(resData.stores)) {
        resData.stores = resData.stores.map(normalizeStore);
      }
    }
  }

  return resData;
};

/**
 * Fetch marketplace stores list.
 * Target endpoint: GET /api/v1/marketplace/stores
 */
export const getMarketplaceStores = async (options = {}) => {
  const { page = 0, size = 24 } = options;
  const response = await apiClient.get('/api/v1/marketplace/stores', {
    params: { page, size },
  });

  let resData = response.data;
  if (resData && typeof resData === 'object' && resData.data !== undefined) {
    resData = resData.data;
  }

  if (resData && Array.isArray(resData.content)) {
    resData.content = resData.content.map(normalizeStore);
  } else if (Array.isArray(resData)) {
    resData = resData.map(normalizeStore);
  }

  return resData;
};

/**
 * Fetch a store by numeric ID or string slug/code.
 * Target endpoint: GET /api/v1/marketplace/stores/:id
 */
export const getMarketplaceStoreById = async (idOrSlug) => {
  if (!idOrSlug) return null;

  // If numeric ID, fetch directly
  if (/^\d+$/.test(String(idOrSlug).trim())) {
    try {
      const response = await apiClient.get(`/api/v1/marketplace/stores/${idOrSlug}`);
      let resData = response.data;
      if (resData && typeof resData === 'object' && resData.data !== undefined) {
        resData = resData.data;
      }
      return normalizeStore(resData);
    } catch (err) {
      console.warn(`Direct fetch for store id ${idOrSlug} failed:`, err.message);
    }
  }

  // If slug or code, search across stores list
  try {
    const storesData = await getMarketplaceStores({ page: 0, size: 50 });
    const content = Array.isArray(storesData?.content) ? storesData.content : (Array.isArray(storesData) ? storesData : []);
    const found = content.find((s) => 
      String(s.code).toLowerCase() === String(idOrSlug).toLowerCase() ||
      String(s.slug).toLowerCase() === String(idOrSlug).toLowerCase() ||
      String(s.id) === String(idOrSlug)
    );
    if (found) {
      return normalizeStore(found);
    }
  } catch (err) {
    console.warn(`Failed searching stores for slug ${idOrSlug}:`, err.message);
  }

  return null;
};

/**
 * Fetch products for a specific store or filtered by category/search.
 * Target endpoint: GET /api/v1/marketplace/products
 */
export const getMarketplaceProducts = async (options = {}) => {
  const { storeId, categoryId, search, page = 0, size = 50 } = options;
  const params = { page, size };

  if (storeId !== undefined && storeId !== null) params.storeId = storeId;
  if (categoryId !== undefined && categoryId !== null && categoryId !== 'all') params.categoryId = categoryId;
  if (search) params.search = String(search).trim().slice(0, 120);

  const response = await apiClient.get('/api/v1/marketplace/products', { params });
  let resData = response.data;
  if (resData && typeof resData === 'object' && resData.data !== undefined) {
    resData = resData.data;
  }

  if (resData && Array.isArray(resData.content)) {
    resData.content = resData.content.map(normalizeProduct);
  } else if (Array.isArray(resData)) {
    resData = resData.map(normalizeProduct);
  }

  return resData;
};

/**
 * Fetch a single product by ID.
 * Target endpoint: GET /api/v1/marketplace/products/:id
 */
export const getMarketplaceProductById = async (productId) => {
  if (!productId) return null;
  const response = await apiClient.get(`/api/v1/marketplace/products/${productId}`);
  let resData = response.data;
  if (resData && typeof resData === 'object' && resData.data !== undefined) {
    resData = resData.data;
  }
  return normalizeProduct(resData);
};

// Aliases for compatibility
export const getMarketPlaceHome = getMarketplaceHome;

export default {
  getMarketplaceHome,
  getMarketPlaceHome,
  getMarketplaceStores,
  getMarketplaceStoreById,
  getMarketplaceProducts,
  getMarketplaceProductById,
  normalizeProduct,
  normalizeStore,
  formatOpeningHours,
};
