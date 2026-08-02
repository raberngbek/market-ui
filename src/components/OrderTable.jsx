import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { money } from '../utils/money';

export default function OrderTable({ orders }) {
  return <div className="order-table">{orders.map((order) => <article key={order.id}><span><small>DELIVERY</small><b>{order.id}</b></span><span><small>DATE</small><b>{order.date}</b></span><span><small>STATUS</small><b className="status-pill">{order.status}</b></span><span><small>TOTAL</small><b>{money(order.total)}</b></span><Link to={`/account/orders/${order.id}`}>View <ChevronRight size={15}/></Link></article>)}</div>;
}
