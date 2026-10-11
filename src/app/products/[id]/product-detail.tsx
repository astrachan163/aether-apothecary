'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StoryCard } from '@/components/community/StoryCard';
import { ArrowLeft, Leaf, Sparkles, Users } from 'lucide-react';
import { DisclaimerMark } from '@/components/DisclaimerMark';


export default function ProductDetailPage() {
  const params = useParams();
  const { getProducts, getStories } = useData();
  const productId = typeof params.id === 'string' ? params.id : undefined;
  const product = productId ? getProducts().find((item) => item.id === productId) : undefined;
  const relatedStories = product
    ? getStories().filter((story) => story.productId === product.id)
    : [];

  if (!product) {
    notFound();
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
          <p className="text-2xl font-semibold text-accent mb-4">{`$${product.price.toFixed(2)}`}</p>
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary" className="capitalize bg-secondary text-secondary-foreground">{product.category}</Badge>
            {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
          </div>
          
          <p className="text-foreground/80 leading-relaxed mb-6">{product.description}<DisclaimerMark /></p>

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
          
          {product.ailments.length > 0 && (
          <Card className="mb-6 bg-background/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-accent" />Traditional use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.ailments.map(ailment => (
                  <Badge key={ailment} variant="secondary" className="capitalize text-sm py-1 px-2.5">
                    {ailment}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          <Button
            type="button"
            aria-disabled="true"
            className="mb-4 min-h-11 w-full bg-accent text-accent-foreground"
            onClick={(event) => {
              event.preventDefault();
            }}
          >
            Demo only
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
