
'use client'; // Needs to be client component to use useData and for dynamic data

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation'; // useParams for client component
import { useData } from '@/contexts/DataContext';
import type { Product, CommunityStory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StoryCard } from '@/components/community/StoryCard';
import { ArrowLeft, Leaf, Package, ShoppingCart, Sparkles, Users, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Removed generateStaticParams as this page is now dynamic client-side

export default function ProductDetailPage() {
  const params = useParams();
  const { getProducts, getStories } = useData();
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading state
  const [relatedStories, setRelatedStories] = useState<CommunityStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const productId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (productId) {
      const products = getProducts();
      const stories = getStories();
      const foundProduct = products.find(p => p.id === productId);
      
      setProduct(foundProduct || null); // null if not found after check
      
      if (foundProduct) {
        setRelatedStories(stories.filter(story => story.productId === foundProduct.id));
      } else {
        setRelatedStories([]);
      }
    }
    setIsLoading(false);
  }, [productId, getProducts, getStories]);


  if (isLoading || product === undefined) { // Show skeleton while loading or if product is initially undefined
    return (
      <div className="container mx-auto px-4 md:px-8 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div>
            <Skeleton className="h-10 w-3/4 mb-3" />
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full mb-6" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound(); // Call notFound if product is null (explicitly not found)
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <Button variant="outline" asChild className="mb-8">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.dataAiHint || "product image"}
            priority={true} 
          />
        </div>

        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">{product.name}</h1>
          <p className="text-2xl font-semibold text-accent mb-4">{product.price}</p>
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary" className="capitalize bg-secondary text-secondary-foreground">{product.category}</Badge>
            {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
          </div>
          
          <p className="text-foreground/80 leading-relaxed mb-6">{product.description}</p>

          <Card className="mb-6 bg-background/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Leaf className="mr-2 h-5 w-5 text-accent" />Key Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {product.ingredients.map(ingredient => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="mb-6 bg-background/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-accent" />Suited For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.ailments.map(ailment => (
                  <Badge key={ailment} variant="outline" className="capitalize text-sm py-1 px-2.5 border-accent text-accent">
                    {ailment} Healing
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mb-4">
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      {relatedStories.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
            <Users className="mr-2 h-6 w-6 text-accent" /> Community Stories for {product.name}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
