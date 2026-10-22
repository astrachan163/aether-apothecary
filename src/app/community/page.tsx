
'use client';

import React, { useState, useEffect } from 'react';
import { StoryList } from '@/components/community/StoryList';
import { AddStoryForm, type StoryFormData } from '@/components/community/AddStoryForm';
import type { CommunityStory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { useData } from '@/contexts/DataContext'; // Use DataContext

const ALL_PRODUCTS_FILTER_VALUE = "__ALL_PRODUCTS__";
const NO_PRODUCT_STORY_VALUE = "__NO_PRODUCT_SELECTED__";


export default function CommunityPage() {
  const { addStory, getStories, getProducts } = useData();
  const { toast } = useToast();

  const [filteredStories, setFilteredStories] = useState<CommunityStory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState(ALL_PRODUCTS_FILTER_VALUE); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentProducts = getProducts();
  const currentStories = getStories();


  useEffect(() => {
    // Data is now from context, set initial filtered stories
    setFilteredStories(currentStories);
    setIsLoading(false);
  }, [currentStories]); // Depend on currentStories from context via getStories()

  useEffect(() => {
    let stories = [...currentStories]; // Use currentStories from context
    if (searchTerm) {
      stories = stories.filter(story => 
        story.story.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedProductFilter && selectedProductFilter !== ALL_PRODUCTS_FILTER_VALUE) {
      stories = stories.filter(story => story.productId === selectedProductFilter);
    }
    setFilteredStories(stories);
  }, [searchTerm, selectedProductFilter, currentStories]);


  const handleStorySubmit = (data: StoryFormData) => {
    setIsSubmitting(true);
    
    let productIdForStory: string | undefined = data.productId;
    let productNameForStory: string | undefined;

    if (data.productId && data.productId !== NO_PRODUCT_STORY_VALUE) {
      const relatedProduct = currentProducts.find(p => p.id === data.productId);
      productNameForStory = relatedProduct?.name;
    } else {
      productIdForStory = undefined; 
    }

    const newStory: CommunityStory = {
      id: Date.now().toString(), 
      userName: data.userName,
      story: data.story,
      productId: productIdForStory,
      productName: productNameForStory,
      date: new Date().toISOString(),
      sample: true,
    };

    addStory(newStory); // Add story via DataContext
    toast({
      title: 'Story preview added',
      description: 'This draft stays in memory for this visit. It has not been published.',
    });
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <header className="mb-10 text-center">
        <Users className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Shared Journeys</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Stories marked as samples are examples, not customer reviews.
        </p>
      </header>

      <AddStoryForm products={currentProducts} onStorySubmit={handleStorySubmit} isLoading={isSubmitting} />
      <p className="mb-6 text-sm text-muted-foreground">Story previews stay in memory for this visit and are not published.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-card rounded-lg shadow">
        <Input 
          type="text"
          aria-label="Search stories or names"
          placeholder="Search stories or users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base"
        />
        <Select value={selectedProductFilter} onValueChange={setSelectedProductFilter}>
          <SelectTrigger aria-label="Filter stories by product" className="min-h-11">
            <SelectValue placeholder="Filter by product (All Products)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PRODUCTS_FILTER_VALUE}>All Products</SelectItem>
            {currentProducts.map(product => (
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
            <div key={i} className="flex flex-col space-y-3 p-4 bg-card rounded-lg shadow">
              <div className="flex items-center space-x-3 mb-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        // Pass isAdmin to StoryList if StoryCard needs to conditionally show remove button.
        // For now, StoryCard's onRemove is optional and handled by AdminStoryManager.
        <StoryList stories={filteredStories} />
      )}
    </div>
  );
}
