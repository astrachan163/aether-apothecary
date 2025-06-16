
'use client';

import React, { useState, useEffect } from 'react';
import { StoryList } from '@/components/community/StoryList';
import { AddStoryForm, type StoryFormData } from '@/components/community/AddStoryForm';
import { mockStories as initialMockStories } from '@/data/stories';
import { mockProducts } from '@/data/products';
import type { CommunityStory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

const ALL_PRODUCTS_FILTER_VALUE = "__ALL_PRODUCTS__";
const NO_PRODUCT_STORY_VALUE = "__NO_PRODUCT_SELECTED__";


export default function CommunityPage() {
  const [allStories, setAllStories] = useState<CommunityStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<CommunityStory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState(''); // Empty string for initial placeholder
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate data fetching for initial stories
    const timer = setTimeout(() => {
      setAllStories(initialMockStories);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let stories = [...allStories];
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
  }, [searchTerm, selectedProductFilter, allStories]);

  const handleStorySubmit = (data: StoryFormData) => {
    setIsSubmitting(true);
    
    let productIdForStory: string | undefined = data.productId;
    let productNameForStory: string | undefined;

    if (data.productId && data.productId !== NO_PRODUCT_STORY_VALUE) {
      const relatedProduct = mockProducts.find(p => p.id === data.productId);
      productNameForStory = relatedProduct?.name;
    } else {
      productIdForStory = undefined; // Ensure no product ID if "None" was selected
    }

    const newStory: CommunityStory = {
      id: Date.now().toString(), 
      userName: data.userName,
      story: data.story,
      productId: productIdForStory,
      productName: productNameForStory,
      date: new Date().toISOString(),
      // userAvatarUrl: 'https://placehold.co/100x100.png', 
      // dataAiHint: 'person',
    };

    // Simulate API call
    setTimeout(() => {
      setAllStories(prevStories => [newStory, ...prevStories]);
      toast({
        title: "Story Submitted!",
        description: "Thank you for sharing your experience.",
      });
      setIsSubmitting(false);
    }, 500);
  };

  const handleRemoveStory = (storyId: string) => {
    setAllStories(prevStories => prevStories.filter(story => story.id !== storyId));
    toast({
      title: "Story Removed",
      description: "The story has been removed from the list.",
      variant: "destructive" 
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <header className="mb-10 text-center">
        <Users className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Shared Journeys</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Read inspiring testimonials from our community and share your own experiences with Victorious Herbal Elements products.
        </p>
      </header>

      <AddStoryForm products={mockProducts} onStorySubmit={handleStorySubmit} isLoading={isSubmitting} />

      <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 bg-card rounded-lg shadow">
        <Input 
          type="text"
          placeholder="Search stories or users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base"
        />
        <Select value={selectedProductFilter} onValueChange={setSelectedProductFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by product (All Products)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PRODUCTS_FILTER_VALUE}>All Products</SelectItem>
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
        <StoryList stories={filteredStories} onRemoveStory={handleRemoveStory} />
      )}
    </div>
  );
}
