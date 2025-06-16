
'use client';

import React, { useState, useEffect } from 'react';
import { ProductList } from '@/components/products/ProductList';
import { ProductFilter } from '@/components/products/ProductFilter';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid } from 'lucide-react';
import { useData } from '@/contexts/DataContext'; // Use DataContext

export default function ProductsPage() {
  const { getProducts } = useData();
  const allProducts = getProducts(); // Get current products from context

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Data is from context, set initial filtered products
    setFilteredProducts(allProducts);
    setIsLoading(false);
  }, [allProducts]); // Re-filter if allProducts from context changes

  const handleFilterChange = React.useCallback((newFilteredProducts: Product[]) => {
    setFilteredProducts(newFilteredProducts);
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <header className="mb-12 text-center">
        <LayoutGrid className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Our Herbal Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore natural remedies crafted with care for your holistic well-being.
        </p>
      </header>

      {/* Pass allProducts from context to ProductFilter */}
      <ProductFilter products={allProducts} onFilterChange={handleFilterChange} />
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[240px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ProductList products={filteredProducts} />
      )}
    </div>
  );
}
