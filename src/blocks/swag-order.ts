import { defineBlock, text, number } from '@verevoir/schema';

export const swagOrder = defineBlock({
  name: 'swag-order',
  fields: {
    delegateId: text('Delegate ID'),
    orderId: text('Order ID'),
    total: number('Total'),
    currency: text('Currency'),
    confirmedAt: text('Confirmed At'),
  },
});
