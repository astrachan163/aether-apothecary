import Image from 'next/image';
import type { Ingredient } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Leaf, BookOpen, Heart, ShieldCheck, Sparkles } from 'lucide-react';

interface IngredientCardProps {
  ingredient: Ingredient;
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  return (
    <AccordionItem value={ingredient.id} className="bg-card rounded-lg shadow-md mb-4 overflow-hidden">
      <AccordionTrigger className="p-6 hover:bg-secondary/50 transition-colors">
        <div className="flex items-center text-left">
          {ingredient.imageUrl && (
            <div className="relative w-16 h-16 mr-4 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={ingredient.imageUrl}
                alt={ingredient.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint={ingredient.dataAiHint || "ingredient image"}
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Leaf className="mr-2 h-5 w-5 text-accent" />
              {ingredient.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{ingredient.description}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-6 bg-background/30 border-t">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />Traditional Uses:</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{ingredient.traditionalUses}</p>
          </div>
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />Spiritual Benefits:</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{ingredient.spiritualBenefits}</p>
          </div>
          <div>
            <h4 className="font-semibold text-md mb-1 flex items-center"><ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />Physical Benefits:</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{ingredient.physicalBenefits}</p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
