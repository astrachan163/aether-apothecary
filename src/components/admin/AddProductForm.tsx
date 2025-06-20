'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useData } from '@/contexts/DataContext';
import type { AilmentType, Product } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/generate-product-description';


const ailmentOptions: AilmentType[] = ['spiritual', 'emotional', 'physical', 'mental'];

const productFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters.').max(150, 'Too long'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  imageUrl: z.string().url('Must be a valid URL (e.g., /images/products/new.png or https://placehold.co/600x400.png)'),
  dataAiHint: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be at least 0.01.'),
  category: z.string().min(2, 'Category is required.'),
  ailments: z.array(z.enum(ailmentOptions)).min(1, 'Select at least one ailment.'),
  ingredients: z.string().min(3, 'Enter at least one ingredient, comma-separated.'),
  sku: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface AddProductFormProps {
  onProductAdded: () => void;
}

export default function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const { addProduct } = useData();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      imageUrl: '',
      dataAiHint: '',
      price: undefined,
      category: '',
      ailments: [],
      ingredients: '',
      sku: '',
    },
  });

  const handleGenerateDescription = async () => {
    const { name, shortDescription, ingredients, ailments } = form.getValues();
    if (!name || !shortDescription) {
      toast({
        title: "Cannot Generate Description",
        description: "Please fill in the Product Name and Short Description first.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const keywords = [...new Set([...ingredients.split(','), ...ailments])].join(', ');
      const result = await generateProductDescription({ name, shortDescription, keywords });
      if (result.description) {
        form.setValue('description', result.description, { shouldValidate: true });
        toast({
          title: "Description Generated!",
          description: "The AI-powered description has been added.",
        });
      }
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a description at this time.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const onSubmit = (data: ProductFormData) => {
    const newProduct: Product = {
      id: Date.now().toString(), // Simple ID generation for prototype
      name: data.name,
      shortDescription: data.shortDescription,
      description: data.description,
      imageUrl: data.imageUrl,
      dataAiHint: data.dataAiHint,
      price: data.price, // Price is already a number
      category: data.category,
      ailments: data.ailments,
      ingredients: data.ingredients.split(',').map(s => s.trim()).filter(s => s), // Convert comma-separated string to array
      sku: data.sku,
    };
    addProduct(newProduct);
    toast({
        title: "Product Added!",
        description: `${data.name} has been added to the store.`,
    });
    form.reset();
    onProductAdded(); // Close dialog or navigate
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl><Input placeholder="e.g., Healing Elixir" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description (for cards)</FormLabel>
              <FormControl><Textarea placeholder="Brief summary, max 150 chars" {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
               <div className="flex justify-between items-center">
                <FormLabel>Full Description</FormLabel>
                <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-accent" />}
                  Generate with AI
                </Button>
              </div>
              <FormControl><Textarea placeholder="Detailed product information" {...field} rows={4} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl><Input placeholder="/images/products/your-image.png or https://placehold.co/600x400.png" {...field} /></FormControl>
              <FormDescription>Use a local path like /images/products/image.png or a placeholder URL.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="dataAiHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image AI Hint (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., herbal tea" {...field} /></FormControl>
              <FormDescription>Max two words, for AI image generation hints if using placeholders.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="19.99" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input placeholder="e.g., Oils, Teas" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., VHE-001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ingredients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredients (comma-separated)</FormLabel>
              <FormControl><Input placeholder="Lavender, Chamomile, Mint" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ailments"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel className="text-base">Targeted Ailments</FormLabel>
                <FormDescription>Select all that apply.</FormDescription>
              </div>
              {ailmentOptions.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="ailments"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal capitalize">
                          {item}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-6">
          Add Product
        </Button>
      </form>
    </Form>
  );
}
