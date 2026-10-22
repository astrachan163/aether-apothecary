import { mockProducts } from '@/data/products';

const exportedIds = new Set(mockProducts.map(product => product.id));

export function selectedProductId(value: string | null): string | null {
  return value && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value) ? value : null;
}

export function productHref(id: string): string {
  const valid = selectedProductId(id);
  if (!valid) return '/product';
  return exportedIds.has(valid) ? `/products/${valid}` : `/product?id=${encodeURIComponent(valid)}`;
}
