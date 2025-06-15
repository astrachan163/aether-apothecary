
'use client';

import React, { useState, useEffect } from 'react';
import { IngredientList } from '@/components/ingredients/IngredientList';
import { ingredients as allIngredientsData } from '@/data/ingredients'; // Renamed to avoid conflict if Ingredient type is also named 'ingredients'
import type { Ingredient } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function IngredientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Correctly map string array from ingredients.ts to Ingredient[]
  // This assumes you want to create full Ingredient objects based on the names.
  // If ingredients.ts was meant to export Ingredient[] directly, that file would need to change.
  // For now, I'll adapt to the current structure of ingredients.ts (string[]) and types.ts (Ingredient interface)
  // This will require a definition for each ingredient string.
  // Let's assume for now ingredients.ts *should* be exporting Ingredient[] objects.
  // Given the error, the immediate fix is to use the correct export.
  // However, the data structure in ingredients.ts (string[]) vs what IngredientList expects (Ingredient[]) is a mismatch.

  // For the purpose of fixing *this specific import error*, I will assume ingredients.ts provides the necessary structure.
  // If not, a more comprehensive fix is needed in ingredients.ts or how it's mapped here.
  // The error *only* points to the import name. Let's make a minimal change.
  // The page was previously using mockIngredients which was of type Ingredient[].
  // The file ingredients.ts exports string[]. This is a larger issue than just the import name.

  // Let's create a temporary mapping based on the string array to satisfy the Ingredient type for now.
  // This is a common pattern if the raw data is just names.
  // However, `mockIngredients` was already defined in the project before, suggesting `src/data/ingredients.ts`
  // might have been changed incorrectly.

  // Looking at the provided `src/data/ingredients.ts`, it's an array of strings.
  // The `Ingredient` type expects an object with id, slug, name, description etc.
  // The previous version of `IngredientsPage` used `mockIngredients` which was likely of type `Ingredient[]`.

  // To fix the immediate error and maintain functionality, I will:
  // 1. Import `ingredients` from `src/data/ingredients.ts`.
  // 2. Create a new `Ingredient[]` array by mapping over the imported string array.
  //    Each string will become the `name` of an `Ingredient` object.
  //    Other fields will be placeholders or derived. This is a stop-gap.
  //    Ideally, `src/data/ingredients.ts` should export `Ingredient[]`.

  // Let's assume the user *intended* for `src/data/ingredients.ts` to be the source of truth,
  // and the page needs to adapt.

  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Transform the string array from allIngredientsData into Ingredient[]
    const transformedIngredients: Ingredient[] = allIngredientsData.map((name, index) => ({
      id: `${index + 1}`,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      description: `Learn more about ${name}.`, // Placeholder
      traditionalUses: 'Traditional uses to be added.', // Placeholder
      spiritualBenefits: 'Spiritual benefits to be added.', // Placeholder
      physicalBenefits: 'Physical benefits to be added.', // Placeholder
      // imageUrl: `https://placehold.co/100x100.png?text=${encodeURIComponent(name.substring(0,2))}`, // Placeholder image
      // dataAiHint: name.toLowerCase().split(' ').slice(0,2).join(' ')
    }));
    setAllIngredients(transformedIngredients);
    setFilteredIngredients(transformedIngredients);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (isLoading) return; // Don't filter until data is loaded

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = allIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(lowercasedFilter) ||
      ingredient.description.toLowerCase().includes(lowercasedFilter) ||
      ingredient.traditionalUses.toLowerCase().includes(lowercasedFilter) ||
      ingredient.spiritualBenefits.toLowerCase().includes(lowercasedFilter) ||
      ingredient.physicalBenefits.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredIngredients(filtered);
  }, [searchTerm, allIngredients, isLoading]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      <header className="mb-10 text-center">
        <Leaf className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Wisdom of the Earth</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Explore our glossary of natural ingredients and uncover their traditional uses and potent benefits.
        </p>
      </header>

      <div className="mb-8">
        <Input 
          type="text"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base"
        />
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <IngredientList ingredients={filteredIngredients} />
      )}
    </div>
  );
}
