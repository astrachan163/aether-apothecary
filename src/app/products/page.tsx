'use client';

import React, { useState, useEffect } from 'react';
import { ProductList } from '@/components/products/ProductList';
import { ProductFilter } from '@/components/products/ProductFilter';
import { mockProducts } from '@/data/products';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setFilteredProducts(mockProducts);
      setIsLoading(false);
    }, 500); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (newFilteredProducts: Product[]) => {
    setFilteredProducts(newFilteredProducts);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Our Herbal Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore natural remedies crafted with care for your holistic well-being.
        </p>
      </header>

      <ProductFilter products={mockProducts} onFilterChange={handleFilterChange} />
      
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
