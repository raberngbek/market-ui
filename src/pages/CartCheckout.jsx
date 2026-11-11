import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle2, ChevronRight, CreditCard, LockKeyhole, MapPin, Minus, PackageCheck, Plus, Tag, Trash2, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { money } from '../utils/money';
import Breadcrumb from '../components/Breadcrumb';
import FormField from '../components/FormField';

function Summary({ coupon, setCoupon }) {
  const { cart, totals } = useStore();
  const [couponValue, setCouponValue] = useState('');
  const [couponState, setCouponState] = useState(coupon || '');
  const currencyCode = totals.currencyCode || cart[0]?.currencyCode || 'USD';
  const discount = couponState === 'FRESH10' ? totals.subtotal * 0.1 : 0;

  const apply = () => {
    const accepted = couponValue.trim().toUpperCase() === 'FRESH10';
    setCouponState(accepted ? 'FRESH10' : 'invalid');
    setCoupon(accepted ? 'FRESH10' : '');
  };

  const total = totals.total - discount;

  return (
    <aside className="order-summary">
      <h2>Order summary</h2>
      <div className="summary-items">
        {cart.map((item) => (
          <div key={item.key}>
            <img src={item.image} alt="" />
            <span>
              {item.short}
              <small>Qty {item.quantity} · {item.storeName || item.brand}</small>
            </span>
            <b>{money(item.price * item.quantity, item.currencyCode || currencyCode)}</b>
          </div>
        ))}
      </div>
      {setCoupon && (
        <div className="coupon">
          <Tag size={18} />
          <input
            value={couponValue}
            onChange={(e) => setCouponValue(e.target.value)}
            placeholder="Discount code (try FRESH10)"
          />
          <button onClick={apply}>Apply</button>
          {couponState === 'invalid' && <small className="form-error">Invalid code. Try FRESH10</small>}
          {couponState === 'FRESH10' && <small className="form-success">10% marketplace discount applied!</small>}
        </div>
      )}
      <div className="summary-lines">
        <span>
          Subtotal <b>{money(totals.subtotal, currencyCode)}</b>
        </span>
        {discount > 0 && (
          <span>
            Discount <b>−{money(discount, currencyCode)}</b>
          </span>
        )}
        <span>
          Shipping & Delivery <b>{totals.shipping ? money(totals.shipping, currencyCode) : 'Free'}</b>
        </span>
        <span>
          Estimated tax <b>{money(totals.tax, currencyCode)}</b>
        </span>
        <strong>
          Total <b>{money(total, currencyCode)}</b>
        </strong>
      </div>
    </aside>
  );
}

export function Cart() {
  const { cart, totals, updateQty, removeCart } = useStore();
  const [coupon, setCoupon] = useState('');

  return (
    <main className="cart-page">
      <div className="container">
        <Breadcrumb current="Your cart" />
        <div className="cart-heading">
          <h1>Your marketplace cart</h1>
          <p>
            {cart.length
              ? `${cart.length} items from independent stores ready for consolidated checkout.`
              : 'Your cart is currently empty.'}
          </p>
        </div>
        {cart.length ? (
          <div className="cart-layout">
            <section className="cart-list">
              {cart.map((item) => {
                const storeRoute = item.storeSlug ? `/vendor/${item.storeSlug}` : `/store/${item.storeId || ''}`;
                return (
                  <article className="cart-row" key={item.key}>
                    <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.short} />
                    </Link>
                    <div className="cart-product-info">
                      <span className="product-category">
                        Store: <Link to={storeRoute}>{item.storeName || item.brand}</Link>
                      </span>
                      <Link to={`/product/${item.id}`}>
                        <h2>{item.name || item.short}</h2>
                      </Link>
                      <p>Verified seller item · Express shipping available</p>
                      <button className="remove-text" onClick={() => removeCart(item.key)}>
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                    <div className="cart-row-price">
                      <b>{money(item.price, item.currencyCode)}</b>
                      {item.oldPrice && <del>{money(item.oldPrice, item.currencyCode)}</del>}
                    </div>
                    <div className="quantity-control large">
                      <button onClick={() => updateQty(item.key, item.quantity - 1)}>
                        <Minus size={15} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.key, item.quantity + 1)}>
                        <Plus size={15} />
                      </button>
                    </div>
                    <strong className="cart-subtotal">{money(item.price * item.quantity, item.currencyCode)}</strong>
                  </article>
                );
              })}
            </section>
            <div>
              <Summary coupon={coupon} setCoupon={setCoupon} />
              <Link className="button primary wide" to="/checkout">
                Proceed to Checkout <ChevronRight size={18} />
              </Link>
              <Link className="continue-shopping" to="/shop">
                ← Keep shopping products
              </Link>
              <div className="cart-security">
                <LockKeyhole size={16} /> Safe encrypted checkout · Verified seller guarantee
              </div>
            </div>
          </div>
        ) : (
          <div className="cart-empty-panel">
            <p>Your cart is empty. Explore verified stores to add items to your basket.</p>
            <Link to="/" className="button primary" style={{ marginTop: '16px', display: 'inline-block' }}>
              Explore Stores Directory
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export function Checkout() {
  const { cart, placeOrder, totals } = useStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: 'alex@marketplace.test',
      firstName: 'Alex',
      lastName: 'Morgan',
      country: 'United States'
    }
  });
  const [coupon, setCoupon] = useState('');

  const submit = (values) => {
    const order = placeOrder(values);
    navigate(`/order-confirmation/${order.id}`, { replace: true });
  };

  if (!cart.length) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="empty-state cart-empty">
            <PackageCheck size={44} />
            <h1>There’s nothing to checkout yet.</h1>
            <Link className="button primary" to="/shop">
              Explore Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-logo">
        <Link className="brand" to="/">
          <span className="brand-mark">F</span>
          Market<span>Fresh</span>
        </Link>
        <span>
          <LockKeyhole size={15} /> Encrypted marketplace checkout
        </span>
      </div>
      <div className="container checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit(submit)}>
          <div className="checkout-step">
            <div className="checkout-section-title">
              <span>1</span>
              <h1>Contact Details</h1>
              <Link to="/login">Sign in</Link>
            </div>
            <FormField
              label="Email address"
              name="email"
              type="email"
              register={register}
              errors={errors}
              rules={{
                required: 'Enter your email address',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' }
              }}
            />
            <label className="checkbox-line">
              <input type="checkbox" defaultChecked /> Send me order tracking and deals from registered stores
            </label>
          </div>

          <div className="checkout-step">
            <div className="checkout-section-title">
              <span>2</span>
              <h2>Shipping Address</h2>
            </div>
            <div className="form-grid">
              <FormField
                label="First name"
                name="firstName"
                register={register}
                errors={errors}
                rules={{ required: 'Required' }}
              />
              <FormField
                label="Last name"
                name="lastName"
                register={register}
                errors={errors}
                rules={{ required: 'Required' }}
              />
            </div>
            <FormField
              label="Street address"
              name="address"
              register={register}
              errors={errors}
              rules={{ required: 'Enter your delivery address' }}
            />
            <FormField
              label="Apartment, suite, unit (optional)"
              name="apartment"
              register={register}
              errors={errors}
            />
            <div className="form-grid thirds">
              <FormField
                label="City"
                name="city"
                register={register}
                errors={errors}
                rules={{ required: 'Required' }}
              />
              <FormField
                label="State"
                name="state"
                register={register}
                errors={errors}
                rules={{ required: 'Required' }}
              />
              <FormField
                label="ZIP code"
                name="zip"
                register={register}
                errors={errors}
                rules={{
                  required: 'Required',
                  pattern: { value: /^\d{5}(-\d{4})?$/, message: 'Use a valid ZIP code' }
                }}
              />
            </div>
            <FormField
              label="Phone number (for courier dispatch)"
              name="phone"
              type="tel"
              register={register}
              errors={errors}
              rules={{ required: 'Enter a phone number' }}
            />
            <div className="delivery-option">
              <Truck size={20} />
              <div>
                <b>Consolidated Express Dispatch</b>
                <span>Coordinated delivery from all selected stores</span>
              </div>
              <b>{totals.subtotal >= 45 ? 'Free' : '$5.99'}</b>
            </div>
          </div>

          <div className="checkout-step">
            <div className="checkout-section-title">
              <span>3</span>
              <h2>Payment Method</h2>
            </div>
            <p className="muted">Your payment is encrypted and held in escrow until dispatch.</p>
            <div className="payment-card">
              <div>
                <CreditCard size={20} />
                <b>Credit or debit card</b>
                <CheckCircle2 size={18} />
              </div>
              <FormField
                label="Card number"
                name="card"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                register={register}
                errors={errors}
                rules={{
                  required: 'Enter a card number',
                  pattern: { value: /^[\d ]{16,19}$/, message: 'Enter a valid card number' }
                }}
              />
              <div className="form-grid">
                <FormField
                  label="Expiration date (MM / YY)"
                  name="expiry"
                  placeholder="08 / 28"
                  register={register}
                  errors={errors}
                  rules={{ required: 'Required' }}
                />
                <FormField
                  label="Security code (CVC)"
                  name="cvc"
                  placeholder="123"
                  register={register}
                  errors={errors}
                  rules={{ required: 'Required', pattern: { value: /^\d{3,4}$/, message: 'Invalid code' } }}
                />
              </div>
            </div>
          </div>

          <button disabled={isSubmitting} className="button primary checkout-submit" type="submit">
            {isSubmitting ? 'Confirming order…' : `Place marketplace order · ${money(totals.total, totals.currencyCode)}`}
          </button>
        </form>
        <Summary coupon={coupon} setCoupon={setCoupon} />
      </div>
    </main>
  );
}

export function OrderConfirmation() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = orders.find((item) => item.id === id);

  return (
    <main className="confirmation">
      <div className="confirmation-card">
        <div className="confirmation-icon">
          <CheckCircle2 size={42} />
        </div>
        <span className="eyebrow">ORDER CONFIRMED</span>
        <h1>Your marketplace order is confirmed!</h1>
        <p>
          We’ve dispatched a receipt and tracking link to <b>{order?.shipping?.email || 'your inbox'}</b>.
          The independent stores are preparing your items for express delivery.
        </p>
        <div className="order-number">
          <span>Order Reference</span>
          <b>{id}</b>
          {order?.total !== undefined && (
            <span style={{ marginTop: '6px', display: 'block', fontSize: '15px' }}>
              Total Paid: <b>{money(order.total, order.currencyCode)}</b>
            </span>
          )}
        </div>
        <div className="confirmation-details">
          <span>
            <PackageCheck size={20} />
            <b>Order status: Processing</b>
            <small>Stores are packaging items with verified tracking.</small>
          </span>
          <span>
            <MapPin size={20} />
            <b>Delivering to</b>
            <small>{order?.shipping?.address || 'Your saved shipping address'}</small>
          </span>
        </div>
        <div className="confirmation-buttons">
          <Link className="button primary" to="/account/orders">
            Track Order
          </Link>
          <Link className="button outline" to="/shop">
            Keep Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
