import { defineBlock, text, number } from '@verevoir/schema';

export const swagProduct = defineBlock({
  name: 'swag-product',
  fields: {
    name: text('Name').max(100),
    description: text('Description').optional(),
    price: number('Price').min(0),
    currency: text('Currency').default('GBP'),
    stock: number('Stock').min(0).int().default(0),
  },
});
