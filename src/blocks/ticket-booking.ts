import { defineBlock, text, number } from '@verevoir/schema';

export const ticketBooking = defineBlock({
  name: 'ticket-booking',
  fields: {
    batchId: text('Batch ID'),
    delegateId: text('Delegate ID'),
    bookingId: text('Booking ID'),
    orderId: text('Order ID'),
    price: number('Price'),
    currency: text('Currency'),
    confirmedAt: text('Confirmed At'),
  },
});
