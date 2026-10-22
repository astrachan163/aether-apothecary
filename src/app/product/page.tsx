'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductDetailPage from '../products/[id]/product-detail';
import { selectedProductId } from '@/lib/product-links';

function SelectedProduct() {
  const search = useSearchParams();
  return <ProductDetailPage productId={selectedProductId(search.get('id'))} />;
}

export default function ProductPage() {
  return <Suspense fallback={<p className="p-8">Loading product</p>}><SelectedProduct /></Suspense>;
}
