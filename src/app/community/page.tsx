'use client';

import React, { useState, useEffect } from 'react';
import { StoryList } from '@/components/community/StoryList';
import { mockStories } from '@/data/stories';
import { mockProducts } from '@/data/products';
import type { CommunityStory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [filteredStories, setFilteredStories] = useState<CommunityStory[]>(mockStories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setFilteredStories(mockStories);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let stories = [...mockStories];
    if (searchTerm) {
      stories = stories.filter(story => 
        story.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedProduct) {
      stories = stories.filter(story => story.productId === selectedProduct);
    }
    setFilteredStories(stories);
  }, [searchTerm, selectedProduct]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <header className="mb-10 text-center">
        <Users className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Shared Journeys</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Read inspiring testimonials from our community and their experiences with Aether Apothecary products.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-card rounded-lg shadow">
        <Input 
          type="text"
          placeholder="Search stories or users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base"
        />
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Products</SelectItem>
            {mockProducts.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[150px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StoryList stories={filteredStories} />
      )}
    </div>
  );
}
