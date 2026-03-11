'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { requireAuthenticated } from '@/server/require-authenticated';
import { requireOrganiser } from '@/server/require-organiser';
import {
  serializeDocument,
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { logger } from '@/server/logger';
import {
  createBasket,
  addItem,
  convertToOrder,
  applyPayment,
  basketTotal,
  money,
} from '@verevoir/commerce';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

/** Create a swag product. Organiser only. */
export async function createSwagProduct(
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();
  const doc = await db.create('swag-product', data);

  logger.info('Swag product created', {
    action: 'createSwagProduct',
    documentId: doc.id,
  });

  return serializeDocument(doc);
}

/** List swag products. */
export async function listSwagProducts(): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  return serializeDocuments(await db.list('swag-product'));
}

/** Update a swag product. Organiser only. */
export async function updateSwagProduct(
  id: string,
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();
  const doc = await db.update(id, data);
  return serializeDocument(doc);
}

/** Delete a swag product. Organiser only. */
export async function deleteSwagProduct(id: string): Promise<void> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();
  await db.delete(id);
}

/** Place a swag order. Any authenticated user. */
export async function placeSwagOrder(
  items: Array<{ productId: string; quantity: number }>,
): Promise<SerializedDocument> {
  const identity = await requireAuthenticated(await getToken());
  const db = await ensureDb();

  // Load products
  const productDocs = await db.list('swag-product');
  const productMap = new Map(productDocs.map((d) => [d.id, d]));

  // Build commerce basket
  let basket = createBasket(`basket-${identity.id}-${Date.now()}`);
  for (const item of items) {
    const productDoc = productMap.get(item.productId);
    if (!productDoc) throw new Error(`Product not found: ${item.productId}`);
    const data = productDoc.data as {
      name: string;
      price: number;
      currency: string;
    };
    const product = {
      id: item.productId,
      type: 'swag',
      basePrice: money(data.price, data.currency),
    };
    basket = addItem(basket, product, item.quantity);
  }

  const totals = basketTotal(basket);
  if (!totals) throw new Error('Empty basket');
  const order = convertToOrder(basket, `order-${identity.id}-${Date.now()}`);

  // Simulate confirmed payment
  const paidOrder = applyPayment(order, {
    id: `pay-${identity.id}-${Date.now()}`,
    amount: totals.total,
    status: 'confirmed',
  });

  // Persist the order
  const orderDoc = await db.create('swag-order', {
    delegateId: identity.id,
    items: items.map((i) => {
      const doc = productMap.get(i.productId);
      const data = doc?.data as { name?: string } | undefined;
      return {
        productId: i.productId,
        name: data?.name ?? 'Unknown',
        quantity: i.quantity,
      };
    }),
    total: totals.total.amount,
    currency: totals.total.currency,
    orderId: paidOrder.id,
    confirmedAt: new Date().toISOString(),
  });

  logger.info('Swag order placed', {
    action: 'placeSwagOrder',
    orderId: paidOrder.id,
    delegateId: identity.id,
    total: totals.total.amount,
  });

  return serializeDocument(orderDoc);
}

/** Get current user's swag orders. */
export async function getMyOrders(): Promise<SerializedDocument[]> {
  const identity = await requireAuthenticated(await getToken());
  const db = await ensureDb();
  return serializeDocuments(
    await db.list('swag-order', { where: { delegateId: identity.id } }),
  );
}
