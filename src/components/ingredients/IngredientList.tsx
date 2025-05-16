import type { Ingredient } from '@/lib/types';
import { IngredientCard } from './IngredientCard';
import { Accordion } from '@/components/ui/accordion';

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No ingredients found.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.id} ingredient={ingredient} />
      ))}
    </Accordion>
  );
}
