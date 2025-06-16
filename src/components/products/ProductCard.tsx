
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface ProductCardProps {
  product: Product;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      const { sessionId } = await response.json();

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe redirect to checkout error:', error);
        }
      }
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block group">
          <div className="relative w-full h-60">
            <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.dataAiHint || "product image"}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl mb-2">
          <Link href={`/products/${product.id}`} className="hover:text-accent transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3 h-20 overflow-hidden">
          {product.shortDescription}
        </CardDescription>
        <div className="mb-3">
          <span className="text-lg font-semibold text-accent">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
          </span>
        </div>
        {product.category && (
          <Badge variant="secondary" className="text-xs capitalize bg-secondary text-secondary-foreground">
            {product.category}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 flex flex-col items-stretch gap-2">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/products/${product.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button onClick={handleCheckout} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Buy Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
