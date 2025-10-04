'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useData } from '@/contexts/DataContext';
import type { AilmentType, Product } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateProductImages } from '@/ai/flows/generate-product-images';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';


const ailmentOptions: AilmentType[] = ['spiritual', 'emotional', 'physical', 'mental'];

const productFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters.').max(150, 'Too long'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  imageUrl: z.string().min(1, 'Please generate and select an image.'), // Must be a non-empty string (data URI)
  price: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().min(0.01, 'Price must be at least 0.01.')
  ),
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
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [contextImage, setContextImage] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      imageUrl: '',
      price: '' as any, // Initialize with empty string instead of undefined
      category: '',
      ailments: [],
      ingredients: '',
      sku: '',
    },
  });

  const handleContextFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContextImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


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
    setIsGeneratingDesc(true);
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
      setIsGeneratingDesc(false);
    }
  };
  
  const handleGenerateImages = async () => {
    const { name, description } = form.getValues();
    if (!name || !description) {
      toast({
        title: "Cannot Generate Images",
        description: "Please fill in the Product Name and Full Description first. Use the AI to generate a description if needed.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingImages(true);
    setGeneratedImages([]); // Clear old images
    setSelectedImageIndex(null); // Reset selection
    form.setValue('imageUrl', '', { shouldValidate: true }); // Clear form value and trigger validation
    try {
      const result = await generateProductImages({ 
        name, 
        description,
        ...(contextImage && { contextImage }), // Conditionally add contextImage if it exists
      });
      if (result.images && result.images.length > 0) {
        setGeneratedImages(result.images);
        toast({
          title: "Images Generated!",
          description: "Select your favorite image below.",
        });
      }
    } catch (error) {
      console.error("Error generating images:", error);
      toast({
        title: "Image Generation Failed",
        description: "Could not generate images at this time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleImageSelection = (index: number, imageDataUri: string) => {
    setSelectedImageIndex(index);
    form.setValue('imageUrl', imageDataUri, { shouldValidate: true });
  };

  const onSubmit = (data: ProductFormData) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: data.name,
      shortDescription: data.shortDescription,
      description: data.description,
      imageUrl: data.imageUrl,
      dataAiHint: 'product image', // We can set a generic hint as it's AI generated
      price: data.price,
      category: data.category,
      ailments: data.ailments,
      ingredients: data.ingredients.split(',').map(s => s.trim()).filter(s => s),
      sku: data.sku,
    };
    addProduct(newProduct);
    toast({
        title: "Product Added!",
        description: `${data.name} has been added to the store.`,
    });
    form.reset();
    onProductAdded();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        {/* Product Details Section */}
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl><Input placeholder="e.g., Healing Elixir" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="shortDescription" render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description (for cards)</FormLabel>
              <FormControl><Textarea placeholder="Brief summary, max 150 chars" {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
               <div className="flex justify-between items-center">
                <FormLabel>Full Description</FormLabel>
                <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGeneratingDesc || isGeneratingImages}>
                  {isGeneratingDesc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-accent" />}
                  Generate with AI
                </Button>
              </div>
              <FormControl><Textarea placeholder="Detailed product information" {...field} rows={4} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>

        {/* AI Image Generation Section */}
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="text-lg">AI Image Generation</CardTitle>
                <FormDescription>
                    Optionally upload a context image (e.g., a sketch or reference), then generate images. Select one to use for the product.
                </FormDescription>
                 <FormField control={form.control} name="imageUrl" render={() => ( <FormMessage className="text-destructive pt-2"/> )}/>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <FormLabel htmlFor="context-image">Context Image (Optional)</FormLabel>
                    <div className="flex items-center gap-4">
                        <Input id="context-image" type="file" accept="image/*" onChange={handleContextFileChange} className="max-w-xs" />
                        {contextImage && <Image src={contextImage} alt="Context preview" width={40} height={40} className="rounded-md object-cover" />}
                    </div>
                </div>

                <Button type="button" onClick={handleGenerateImages} disabled={isGeneratingDesc || isGeneratingImages} className="w-full">
                    {isGeneratingImages ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                    Generate Product Images
                </Button>

                {isGeneratingImages && (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-md" />)}
                    </div>
                )}
                
                {generatedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {generatedImages.map((imgSrc, index) => (
                            <div 
                                key={index} 
                                className="relative group cursor-pointer"
                                onClick={() => handleImageSelection(index, imgSrc)}
                            >
                                <Image
                                    src={imgSrc}
                                    alt={`Generated product image ${index + 1}`}
                                    width={250}
                                    height={250}
                                    className={cn("rounded-md object-cover aspect-square transition-all", selectedImageIndex === index ? "ring-2 ring-offset-2 ring-accent" : "hover:opacity-80")}
                                />
                                {selectedImageIndex === index && (
                                    <div className="absolute inset-0 bg-accent/60 flex items-center justify-center rounded-md">
                                        <CheckCircle2 className="h-10 w-10 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Other Fields Section */}
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="19.99" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="e.g., Oils, Teas" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
        </div>
        <FormField control={form.control} name="sku" render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., VHE-001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="ingredients" render={({ field }) => (
            <FormItem>
              <FormLabel>Ingredients (comma-separated)</FormLabel>
              <FormControl><Input placeholder="Lavender, Chamomile, Mint" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="ailments" render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel className="text-base">Targeted Ailments</FormLabel>
                <FormDescription>Select all that apply.</FormDescription>
              </div>
              {ailmentOptions.map((item) => (
                <FormField key={item} control={form.control} name="ailments" render={({ field }) => (
                    <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                        <FormControl>
                          <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => (
                            checked ? field.onChange([...(field.value || []), item]) : field.onChange((field.value || []).filter((value) => value !== item))
                          )}/>
                        </FormControl>
                        <FormLabel className="font-normal capitalize">{item}</FormLabel>
                    </FormItem>
                )}/>
              ))}
              <FormMessage />
            </FormItem>
        )}/>
        
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-6" disabled={isGeneratingDesc || isGeneratingImages}>
          Add Product
        </Button>
      </form>
    </Form>
  );
}
