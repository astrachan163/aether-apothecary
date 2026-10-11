import { mockProducts } from '@/data/products';
import ProductDetailPage from './product-detail';

export function generateStaticParams() {
  return mockProducts.map((product) => ({ id: product.id }));
}

// A literal false is required. `output: 'export'` rejects `dynamicParams: true`,
// and Next.js only accepts a boolean literal in this config field.
export const dynamicParams = false;

export default function ProductPage() {
  return <ProductDetailPage />;
}
