
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';
import { StoryCard } from '@/components/community/StoryCard';
import { mockProducts } from '@/data/products';
import { mockStories } from '@/data/stories';
import { ArrowRight, Leaf, Users } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = mockProducts.slice(0, 3);
  const featuredStory = mockStories[0];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-primary via-secondary to-background">
        <Image 
          src="/images/products/Banner.PNG" 
          alt="Victorious Herbal Elements background"
          layout="fill"
          objectFit="cover"
          quality={80}
          className="opacity-20"
          data-ai-hint="hero banner"
        />
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Discover Nature's Wisdom
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Embark on a holistic healing journey with Victorious Herbal Elements. Explore our curated collection of herbal alternatives and find personalized paths to well-being.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/products">
              Explore Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-semibold tracking-tight text-center mb-10">Featured Elixirs & Remedies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="flex justify-center">
            <Card className="hover:shadow-xl transition-shadow duration-300 md:w-1/2">
                <CardHeader>
                <Leaf className="h-10 w-10 text-accent mb-2" />
                <CardTitle className="text-2xl">Wisdom of the Earth</CardTitle>
                <CardDescription>
                    Delve into our Ingredient Glossary to understand the traditional uses and benefits of nature's remedies.
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
      
      {/* Community Story Highlight */}
      {featuredStory && (
        <section className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-10">From Our Community</h2>
          <div className="max-w-2xl mx-auto">
            <StoryCard story={featuredStory} />
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
              <Link href="/community">More Healing Journeys <Users className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
