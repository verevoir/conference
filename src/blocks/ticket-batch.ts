import { defineBlock, text, number } from '@verevoir/schema';

export const ticketBatch = defineBlock({
  name: 'ticket-batch',
  fields: {
    label: text('Label').max(100),
    capacity: number('Capacity').min(1).int(),
    sold: number('Sold').min(0).int().default(0),
    price: number('Price').min(0),
    currency: text('Currency').default('GBP'),
    opensAt: text('Opens At'),
    closesAt: text('Closes At'),
  },
});
