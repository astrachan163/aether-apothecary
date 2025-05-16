'use client';

import React, { useState, useEffect } from 'react';
import { IngredientList } from '@/components/ingredients/IngredientList';
import { mockIngredients } from '@/data/ingredients';
import type { Ingredient } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function IngredientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(mockIngredients);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setFilteredIngredients(mockIngredients);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = mockIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(lowercasedFilter) ||
      ingredient.description.toLowerCase().includes(lowercasedFilter) ||
      ingredient.traditionalUses.toLowerCase().includes(lowercasedFilter) ||
      ingredient.spiritualBenefits.toLowerCase().includes(lowercasedFilter) ||
      ingredient.physicalBenefits.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredIngredients(filtered);
  }, [searchTerm]);

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
