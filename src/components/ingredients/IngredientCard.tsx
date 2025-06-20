
import Image from 'next/image';
import type { Ingredient } from '@/lib/types';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Leaf } from 'lucide-react';

interface IngredientCardProps {
  ingredient: Ingredient;
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  return (
    <AccordionItem value={ingredient.id} className="border-b-0 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 overflow-hidden">
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex items-center w-full">
            {ingredient.imageUrl && (
            <div className="relative w-16 h-16 mr-4 rounded-md overflow-hidden flex-shrink-0">
                <Image
                    src={ingredient.imageUrl}
                    alt={ingredient.name}
                    fill
                    className="object-cover"
                    data-ai-hint={ingredient.dataAiHint || 'ingredient'}
                />
            </div>
            )}
            <div className="flex-grow text-left">
                <h3 className="text-xl font-semibold text-foreground flex items-center mb-1">
                <Leaf className="mr-2 h-5 w-5 text-accent flex-shrink-0" />
                {ingredient.name}
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{ingredient.description}</p>
            </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-6 pt-2 bg-background/50">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-md mb-1">Traditional Uses</h4>
            <p className="text-sm text-muted-foreground">{ingredient.traditionalUses}</p>
          </div>
          <div>
            <h4 className="font-semibold text-md mb-1">Spiritual Benefits</h4>
            <p className="text-sm text-muted-foreground">{ingredient.spiritualBenefits}</p>
          </div>
          <div>
            <h4 className="font-semibold text-md mb-1">Physical Benefits</h4>
            <p className="text-sm text-muted-foreground">{ingredient.physicalBenefits}</p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
