
import type { Ingredient } from '@/lib/types';
import { IngredientCard } from './IngredientCard';

interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No ingredients found.</p>;
  }

  return (
    <div className="space-y-4">
      {ingredients.map((ingredient) => (
        <IngredientCard key={ingredient.id} ingredient={ingredient} />
      ))}
    </div>
  );
}
