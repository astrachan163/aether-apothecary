
'use client'; // Needs to be client component to use useData

import React from 'react'; // Import React for JSX
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';
import { StoryCard } from '@/components/community/StoryCard';
import { ArrowRight, Leaf, Users } from 'lucide-react';
import { useData } from '@/contexts/DataContext'; // Use DataContext

export default function HomePage() {
  const { getProducts, getStories } = useData();
  const allProducts = getProducts();
  const allStories = getStories();

  const featuredProducts = allProducts.slice(0, 3);
  // Ensure there's at least one story before trying to access it
  const featuredStory = allStories.length > 0 ? allStories[0] : null; 

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-lg bg-background shadow-lg">
        <div className="relative h-48 w-full md:h-64">
          <Image
            src="/images/products/Banner.PNG"
            alt="Victorious Herbal Elements background"
            fill
            quality={80}
            className="object-cover"
            data-ai-hint="hero banner"
            priority
          />
        </div>
        <div className="bg-background px-4 py-10 text-center md:px-8 md:py-14">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Discover Nature's Wisdom
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground md:text-xl">
            Browse the Victorious Herbal Elements sample catalog. Explore herbal oils, soaps, and teas, and read how customers enjoy them.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/products">
              Explore Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-center mb-10">Featured products</h2>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No featured products available at the moment.</p>
        )}
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8">
        <div className="flex justify-center">
            <Card className="hover:shadow-xl transition-shadow duration-300 md:w-1/2">
                <CardHeader>
                <Leaf className="h-10 w-10 text-accent mb-2" />
                <CardTitle className="text-2xl">Wisdom of the Earth</CardTitle>
                <CardDescription>
                    Open the ingredient glossary to read how these plants are traditionally used.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/ingredients">Explore Ingredients</Link>
                </Button>
                </CardContent>
            </Card>
        </div>
      </section>
      
      {featuredStory && (
        <section className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-10">From Our Community</h2>
          <div className="max-w-2xl mx-auto">
            <StoryCard story={featuredStory} />
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
              <Link href="/community">More community stories <Users className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      )}
       {(!featuredStory && allStories.length > 0) && ( // Fallback if first story was deleted but others exist
        <section className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-10">From Our Community</h2>
           <p className="text-center text-muted-foreground">Check out more stories on our community page!</p>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
              <Link href="/community">More community stories <Users className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
