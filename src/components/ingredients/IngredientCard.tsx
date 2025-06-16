
import Image from 'next/image';
import type { Ingredient } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Leaf } from 'lucide-react';

interface IngredientCardProps {
  ingredient: Ingredient;
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  return (
    <Card className="flex flex-col sm:flex-row items-start p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg overflow-hidden">
      {ingredient.imageUrl && (
        <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-md overflow-hidden flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
          <Image
            src={ingredient.imageUrl}
            alt={ingredient.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 96px"
            data-ai-hint={ingredient.dataAiHint}
          />
        </div>
      )}
      <div className="flex-grow">
        <h3 className="text-xl font-semibold text-foreground flex items-center mb-1">
          <Leaf className="mr-2 h-5 w-5 text-accent flex-shrink-0" />
          {ingredient.name}
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">{ingredient.description}</p>
      </div>
    </Card>
  );
}
