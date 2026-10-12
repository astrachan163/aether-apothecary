import { writeFileSync } from 'node:fs';
import { mockProducts } from '../src/data/products';
import { ingredients } from '../src/data/ingredients';
import { mockStories } from '../src/data/stories';

const products = mockProducts.map((item) => ({
  ...item,
  published: true,
  createdAt: '2023-01-10',
  updatedAt: '2023-01-10',
}));
const stories = mockStories.map((item) => ({ ...item, published: true, sample: true }));
const faqs = [{
  id: 'shipping',
  question: 'How does a test order work?',
  answer: 'Test mode does not create a real charge.',
  published: true,
}];
const orders = [{ id: 'sample-order', name: 'Sample order', amountTotal: 0, sample: true }];
const files = {
  products,
  ingredients: ingredients.map((item) => ({ ...item, published: true })),
  stories,
  faqs,
  orders,
};

for (const [name, value] of Object.entries(files)) {
  const json = `${JSON.stringify(value, null, 2)}\n`;
  writeFileSync(`seed/${name}.json`, json);
  writeFileSync(`functions/seed/${name}.json`, json);
}

console.log(Object.fromEntries(Object.entries(files).map(([key, value]) => [key, value.length])));
