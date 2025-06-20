
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquarePlus } from 'lucide-react';
// Note: onStorySubmit will now typically come from DataContext via the parent page.

const storyFormSchema = z.object({
  userName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  story: z.string().min(10, { message: 'Story must be at least 10 characters.' }).max(1000),
  productId: z.string().optional(), // Can be empty or NO_PRODUCT_VALUE
});

export type StoryFormData = z.infer<typeof storyFormSchema>;

interface AddStoryFormProps {
  products: Product[]; // Products list passed from parent (which gets it from DataContext)
  onStorySubmit: (data: StoryFormData) => void; // This will trigger adding to DataContext
  isLoading: boolean;
}

const NO_PRODUCT_VALUE = "__NO_PRODUCT_SELECTED__"; // Ensure this matches usage

export function AddStoryForm({ products, onStorySubmit, isLoading }: AddStoryFormProps) {
  const form = useForm<StoryFormData>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      userName: '',
      story: '',
      productId: '', // Empty string for initial placeholder, Select component handles this
    },
  });

  const onSubmit = (data: StoryFormData) => {
    onStorySubmit(data); // Parent (CommunityPage) will handle adding to DataContext
    form.reset();
  };

  return (
    <Card className="mb-10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <MessageSquarePlus className="mr-2 h-7 w-7 text-accent" />
          Share Your Story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Story / Testimonial</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share your experience..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Product (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ''} // Ensure default value is an empty string for placeholder
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_PRODUCT_VALUE}>None</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    If your story is about a specific product, select it here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Your Story'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
