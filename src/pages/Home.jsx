import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Keep static posts/products as fallback if API doesn't provide them
import { posts, products as staticProducts, categories as staticCategories } from "../data/catalog";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import Benefit from "../components/Benefit";
import { categoryRouter } from "../api/routers/categories";
import { marketPlaceRouter } from "../api/routers/marketPlace";

export default function Home({ variant }) {
  const meals = variant === "two";
  
  const [categoriesData, setCategoriesData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, market] = await Promise.all([
          categoryRouter.list().catch(() => staticCategories),
          marketPlaceRouter.getHome().catch(() => staticProducts)
        ]);
        
        // Handle different possible payload structures gracefully
        setCategoriesData(Array.isArray(cats) ? cats : (cats?.data || staticCategories));
        setMarketData(Array.isArray(market) ? market : (market?.products || market?.data || staticProducts));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayCategories = categoriesData.length > 0 ? categoriesData : staticCategories;
  const displayProducts = marketData.length > 0 ? marketData : staticProducts;

  if (loading) {
    return (
      <main className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Loading Marketplace...</h2>
        <div className="skeleton-loader" style={{ height: '200px', background: '#f0f0f0', marginTop: '20px', borderRadius: '8px' }}></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>Failed to load marketplace data. Please try again later.</p>
        <button onClick={() => window.location.reload()} className="button primary">Retry</button>
      </main>
    );
  }

  return (
    <main>
      <section className={`hero ${meals ? "hero-two" : ""}`}>
        <div className="container hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              {meals ? "DINNER, DELIVERED" : "FROM LOCAL FIELDS"}
            </span>
            <h1>
              {meals ? (
                <>
                  Good food. Less
                  <br />
                  <em>thinking.</em>
                </>
              ) : (
                <>
                  Fresh food for
                  <br />
                  <em>real life.</em>
                </>
              )}
            </h1>
            <p>
              {meals
                ? "Ready meals, brilliant staples, and the ingredients for a dinner worth sitting down for."
                : "Hand-picked groceries from local growers, bakers, and makers—at your door in as little as an hour."}
            </p>
            <div className="hero-buttons">
              <Link
                className="button primary"
                to={meals ? "/category/Ready%20to%20Eat" : "/shop"}
              >
                Shop fresh food <ArrowRight size={18} />
              </Link>
              <Link className="text-link hero-link" to="/home-2">
                Plan dinner
              </Link>
            </div>
            <div className="hero-note">
              <Leaf size={16} /> Seasonal food, sourced with care
            </div>
          </div>
          <div className="hero-visual">
            <img
              src={
                meals
                  ? "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1500&q=90"
                  : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1500&q=90"
              }
              alt={
                meals
                  ? "Fresh vegetables ready for dinner"
                  : "Fresh produce at a market"
              }
            />
            <div className="hero-float-card">
              <span>{meals ? "DINNER IN 20" : "FRESH THIS MORNING"}</span>
              <strong>
                {meals ? "Easy meals, better nights" : "The local harvest"}
              </strong>
              <Link to="/shop">
                Shop now <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>
        <div className="container hero-ticker">
          <span>Delivery in as little as 60 min</span>
          <i />
          <span>Hand-picked for freshness</span>
          <i />
          <span>Local makers & growers</span>
          <i />
          <span>Easy replacements</span>
        </div>
      </section>
      
      {/* CATEGORIES INTEGRATION */}
      <section className="section categories-section">
        <div className="container">
          <SectionHeading
            eyebrow="SHOP THE MARKET"
            title="What are you hungry for?"
          />
          {displayCategories.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>No categories found.</div>
          ) : (
            <div className="category-grid">
              {displayCategories.map((category) => (
                <Link
                  className="category-card"
                  key={category.name || category.id}
                  to={`/category/${encodeURIComponent(category.name || 'unknown')}`}
                >
                  <img loading="lazy" src={category.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80"} alt="" />
                  <span>
                    {category.name}
                    <ArrowRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* MARKET PLACE HOME INTEGRATION */}
      <section className="section tint-section">
        <div className="container">
          <SectionHeading
            eyebrow="PICKED THIS MORNING"
            title="Fresh favorites, ready when you are."
          />
          {displayProducts.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>No products found.</div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4200, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              spaceBetween={18}
              slidesPerView={1.25}
              breakpoints={{
                540: { slidesPerView: 2.25 },
                900: { slidesPerView: 3.25 },
                1180: { slidesPerView: 4 },
              }}
              className="product-swiper"
            >
              {displayProducts.slice(0, 7).map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>
      
      <section className="split-promo">
        <div className="promo-photo">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"
            alt="A bowl of warming tomato soup"
          />
        </div>
        <div className="promo-content">
          <span className="eyebrow">DINNER, SORTED</span>
          <h2>
            Less prep. More
            <br />
            <em>good food.</em>
          </h2>
          <p>
            Ready-to-heat meals and a few fresh extras make the best kind of
            weeknight dinner.
          </p>
          <Link className="button light" to="/category/Ready%20to%20Eat">
            Shop ready meals <ArrowRight size={18} />
          </Link>
          <span className="promo-index">01 / 03</span>
        </div>
      </section>
      <section className="section container">
        <div className="feature-banner">
          <div>
            <span className="eyebrow">WEEKLY FARM BOX</span>
            <h2>Meet this week’s harvest.</h2>
            <p>Peak-season produce, chosen by the people who grew it.</p>
            <Link className="text-link" to="/category/Fresh%20Produce">
              Shop produce <ArrowRight size={17} />
            </Link>
          </div>
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1300&q=85"
            alt="Colorful fresh vegetables"
          />
          <span className="banner-discount">
            SAVE
            <br />
            <b>20%</b>
            <br />
            TODAY
          </span>
        </div>
      </section>
      
      {/* SECOND MARKET PLACE SECTION */}
      <section className="section container">
        <SectionHeading
          eyebrow="FRESH IN THE BASKET"
          title="Pantry staples and little luxuries."
          link="/shop?sort=new"
          label="See what’s new"
        />
        {displayProducts.length > 5 ? (
          <div className="product-grid">
            {displayProducts.slice(5, 11).map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>Check back later for more products.</div>
        )}
      </section>
      
      <section className="section editorial-section">
        <div className="container editorial-grid">
          <div className="editorial-copy">
            <span className="eyebrow">THE MARKETFRESH TABLE</span>
            <h2>
              Recipes for
              <br />
              <em>everyday good eating.</em>
            </h2>
            <p>
              Simple ideas from farmers, cooks, and people who think dinner
              should be a pleasure.
            </p>
            <Link className="button outline" to="/blog">
              Read the recipes <ArrowRight size={18} />
            </Link>
          </div>
          <div className="post-stack">
            {posts.slice(0, 2).map((post) => (
              <Link
                to={`/blog/${post.slug}`}
                className="mini-post"
                key={post.slug}
              >
                <img loading="lazy" src={post.image} alt="" />
                <div>
                  <span>
                    {post.category} · {post.date}
                  </span>
                  <h3>{post.title}</h3>
                  <b>
                    Read recipe <ArrowRight size={15} />
                  </b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="benefit-section">
        <div className="container benefits">
          <Benefit
            icon={Timer}
            title="Delivery in 60 minutes"
            text="Choose a time that suits you"
          />
          <Benefit
            icon={ShieldCheck}
            title="Freshness promise"
            text="We make it right, every time"
          />
          <Benefit
            icon={HeartHandshake}
            title="Easy replacements"
            text="You approve every swap"
          />
          <Benefit
            icon={Truck}
            title="Local delivery"
            text="From nearby food makers"
          />
        </div>
      </section>
    </main>
  );
}
