'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { listSwagProducts, placeSwagOrder, getMyOrders } from '@/actions/shop';
import type { SerializedDocument } from '@/lib/serialization';
import btn from '@/styles/Button.module.css';
import styles from './SwagShop.module.css';

export function SwagShop() {
  const [products, setProducts] = useState<SerializedDocument[]>([]);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [orders, setOrders] = useState<SerializedDocument[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { isAuthenticated } = useUser();

  useEffect(() => {
    listSwagProducts().then(setProducts);
    if (isAuthenticated) {
      getMyOrders()
        .then(setOrders)
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const updateCart = (productId: string, qty: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(productId);
      } else {
        next.set(productId, qty);
      }
      return next;
    });
  };

  const cartTotal = () => {
    let total = 0;
    cart.forEach((qty, productId) => {
      const p = products.find((pr) => pr.id === productId);
      if (p) total += (p.data.price as number) * qty;
    });
    return total;
  };

  const handleOrder = async () => {
    if (cart.size === 0) return;
    setOrdering(true);
    setMessage(null);
    try {
      const items = Array.from(cart.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));
      const order = await placeSwagOrder(items);
      const data = order.data as Record<string, unknown>;
      setMessage(`Order confirmed! Total: ${data.currency} ${data.total}`);
      setCart(new Map());
      getMyOrders()
        .then(setOrders)
        .catch(() => {});
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className={styles.container}>
      {message && <div className={styles.message}>{message}</div>}
      {products.length === 0 ? (
        <p>No merchandise available yet.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => {
            const data = p.data as Record<string, unknown>;
            const qty = cart.get(p.id) ?? 0;
            return (
              <div key={p.id} className={styles.card}>
                <h3>{String(data.name)}</h3>
                {data.description ? (
                  <p className={styles.description}>
                    {String(data.description)}
                  </p>
                ) : null}
                <p className={styles.price}>
                  {String(data.currency)} {String(data.price)}
                </p>
                {isAuthenticated && (
                  <div className={styles.qty}>
                    <button
                      onClick={() => updateCart(p.id, qty - 1)}
                      className={btn.subtle}
                      disabled={qty === 0}
                    >
                      -
                    </button>
                    <span>{qty}</span>
                    <button
                      onClick={() => updateCart(p.id, qty + 1)}
                      className={btn.subtle}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAuthenticated && cart.size > 0 && (
        <div className={styles.cartBar}>
          <span>Total: GBP {cartTotal().toFixed(2)}</span>
          <button
            onClick={handleOrder}
            disabled={ordering}
            className={btn.primary}
          >
            {ordering ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      )}

      {!isAuthenticated && <p>Sign in to purchase merchandise.</p>}

      {orders.length > 0 && (
        <div className={styles.orders}>
          <h3>My Orders</h3>
          {orders.map((o) => {
            const data = o.data as Record<string, unknown>;
            return (
              <div key={o.id} className={styles.orderCard}>
                <span>
                  {String(data.currency)} {String(data.total)} —{' '}
                  {new Date(String(data.confirmedAt)).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
