'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { requireAuthenticated } from '@/server/require-authenticated';
import { requireOrganiser } from '@/server/require-organiser';
import { getPhase } from '@/server/phase';
import {
  serializeDocument,
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { logger } from '@/server/logger';
import { createHold, holdToBooking } from '@verevoir/bookings';
import {
  createBasket,
  addItem,
  convertToOrder,
  applyPayment,
  money,
} from '@verevoir/commerce';
import type { Money } from '@verevoir/commerce';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

/** Create a ticket batch (bookings calendar). Organiser only. */
export async function createTicketBatch(data: {
  label: string;
  capacity: number;
  price: number;
  currency: string;
  opensAt: string;
  closesAt: string;
}): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();

  const doc = await db.create('ticket-batch', {
    label: data.label,
    capacity: data.capacity,
    sold: 0,
    price: data.price,
    currency: data.currency,
    opensAt: data.opensAt,
    closesAt: data.closesAt,
  });

  logger.info('Ticket batch created', {
    action: 'createTicketBatch',
    documentId: doc.id,
    label: data.label,
    capacity: data.capacity,
  });

  return serializeDocument(doc);
}

/** List ticket batches. */
export async function listTicketBatches(): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  const docs = await db.list('ticket-batch');
  return serializeDocuments(docs);
}

/** Check ticket availability for a batch. */
export async function checkAvailability(
  batchId: string,
): Promise<{ available: number; total: number }> {
  const db = await ensureDb();
  const batch = await db.get(batchId);
  if (!batch) throw new Error('Batch not found');

  const data = batch.data as {
    capacity: number;
    sold: number;
  };

  return {
    available: data.capacity - data.sold,
    total: data.capacity,
  };
}

/** Register for a ticket. Creates a hold, simulates payment, confirms booking. */
export async function registerForTicket(batchId: string): Promise<{
  booking: SerializedDocument;
  order: { id: string; total: Money };
}> {
  const identity = await requireAuthenticated(await getToken());
  const phase = await getPhase();

  if (phase !== 'registration') {
    throw new Error(
      'Registration is only available during the registration phase',
    );
  }

  const db = await ensureDb();
  const batch = await db.get(batchId);
  if (!batch) throw new Error('Batch not found');

  const batchData = batch.data as {
    label: string;
    capacity: number;
    sold: number;
    price: number;
    currency: string;
    opensAt: string;
    closesAt: string;
  };

  // Check availability
  if (batchData.sold >= batchData.capacity) {
    throw new Error('This ticket batch is sold out');
  }

  // Check time window
  const now = new Date();
  if (new Date(batchData.opensAt) > now) {
    throw new Error('This ticket batch has not opened yet');
  }
  if (new Date(batchData.closesAt) < now) {
    throw new Error('This ticket batch has closed');
  }

  // Check if user already has a ticket
  const existingBookings = await db.list('ticket-booking', {
    where: { delegateId: identity.id },
  });
  if (existingBookings.length > 0) {
    throw new Error('You already have a ticket');
  }

  // Use bookings: hold → booking flow
  const configs = await db.list('config', { limit: 1 });
  const conferenceDate =
    configs.length > 0
      ? ((configs[0].data as { date?: string }).date ?? now.toISOString())
      : now.toISOString();

  const dateRange = {
    start: new Date(conferenceDate),
    end: new Date(new Date(conferenceDate).getTime() + 86400000),
  };

  // Create a hold
  const hold = createHold({
    id: `hold-${identity.id}-${batchId}`,
    offeringId: `ticket-${batchId}`,
    slots: [
      {
        calendarId: batchId,
        start: dateRange.start,
        end: dateRange.end,
        count: 1,
      },
    ],
    heldBy: identity.id,
    ttl: { minutes: 10 },
  });

  // Use commerce: basket → order → payment
  const ticketProduct = {
    id: `ticket-${batchId}`,
    type: 'ticket',
    basePrice: money(batchData.price, batchData.currency),
  };

  let basket = createBasket(`basket-${identity.id}-${Date.now()}`);
  basket = addItem(basket, ticketProduct, 1);
  const order = convertToOrder(basket, `order-${identity.id}-${Date.now()}`);

  // Simulate confirmed payment
  const paidOrder = applyPayment(order, {
    id: `pay-${identity.id}-${Date.now()}`,
    amount: money(batchData.price, batchData.currency),
    status: 'confirmed',
  });

  // Confirm the booking
  const booking = holdToBooking(hold, {
    id: `booking-${identity.id}-${batchId}`,
    orderId: paidOrder.id,
  });

  // Persist the booking and update sold count
  const bookingDoc = await db.create('ticket-booking', {
    batchId,
    delegateId: identity.id,
    bookingId: booking.id,
    orderId: paidOrder.id,
    price: batchData.price,
    currency: batchData.currency,
    confirmedAt: new Date().toISOString(),
  });

  await db.update(batch.id, {
    ...batchData,
    sold: batchData.sold + 1,
  });

  logger.info('Ticket registered', {
    action: 'registerForTicket',
    batchId,
    delegateId: identity.id,
    bookingId: booking.id,
    orderId: paidOrder.id,
  });

  return {
    booking: serializeDocument(bookingDoc),
    order: {
      id: paidOrder.id,
      total: money(batchData.price, batchData.currency),
    },
  };
}

/** Get current user's ticket booking. */
export async function getMyTicket(): Promise<SerializedDocument | null> {
  const identity = await requireAuthenticated(await getToken());
  const db = await ensureDb();
  const bookings = await db.list('ticket-booking', {
    where: { delegateId: identity.id },
  });
  if (bookings.length === 0) return null;
  return serializeDocument(bookings[0]);
}
