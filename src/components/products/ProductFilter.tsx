
'use client';

import type { AilmentType, Product, Ingredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Brain, Filter, Heart, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';
import { useData } from '@/contexts/DataContext';

interface ProductFilterProps {
  products: Product[]; // These are all products from DataContext
  onFilterChange: (filteredProducts: Product[]) => void;
}

const ailmentOptions: { value: AilmentType; label: string; icon: React.ElementType }[] = [
  { value: 'spiritual', label: 'Spiritual', icon: Sparkles },
  { value: 'emotional', label: 'Emotional', icon: Heart },
  { value: 'physical', label: 'Physical', icon: ShieldCheck },
  { value: 'mental', label: 'Mental', icon: Brain },
];

const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__";

export function ProductFilter({ products, onFilterChange }: ProductFilterProps) {
  const { getIngredients } = useData();
  const allIngredients = getIngredients(); // Get ingredients from DataContext

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedAilments, setSelectedAilments] = React.useState<AilmentType[]>([]);
  const [selectedIngredient, setSelectedIngredient] = React.useState<string>(''); // Stores ingredient name
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  const allCategories = Array.from(new Set(products.map(p => p.category)));

  const handleAilmentChange = (ailment: AilmentType, checked: boolean) => {
    setSelectedAilments(prev => 
      checked ? [...prev, ailment] : prev.filter(a => a !== ailment)
    );
  };
  
  const applyFilters = React.useCallback(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAilments.length > 0) {
      filtered = filtered.filter(p => 
        selectedAilments.every(sa => p.ailments.includes(sa))
      );
    }

    if (selectedIngredient && selectedIngredient !== ALL_ITEMS_FILTER_VALUE) { 
      filtered = filtered.filter(p => p.ingredients.includes(selectedIngredient));
    }
    
    if (selectedCategory && selectedCategory !== ALL_ITEMS_FILTER_VALUE) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    onFilterChange(filtered);
  }, [products, searchTerm, selectedAilments, selectedIngredient, selectedCategory, onFilterChange]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAilments([]);
    setSelectedIngredient('');
    setSelectedCategory('');
    onFilterChange(products); 
  };

  return (
    <div className="mb-8 p-6 bg-card rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4 flex items-center"><Filter className="mr-2 h-5 w-5 text-accent" /> Filter Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search-term" className="text-sm font-medium">Search by Name/Description</Label>
          <Input 
            id="search-term"
            type="text" 
            placeholder="e.g., Lavender, Healing" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-1 block">Filter by Ailment</Label>
          <div className="space-y-2 mt-2">
            {ailmentOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`ailment-${opt.value}`} 
                  checked={selectedAilments.includes(opt.value)}
                  onCheckedChange={(checked) => handleAilmentChange(opt.value, !!checked)}
                />
                <Label htmlFor={`ailment-${opt.value}`} className="flex items-center font-normal">
                  <opt.icon className="mr-1.5 h-4 w-4 text-muted-foreground" />
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label htmlFor="ingredient-filter" className="text-sm font-medium">Filter by Ingredient</Label>
          <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
            <SelectTrigger id="ingredient-filter" className="w-full mt-1">
              <SelectValue placeholder="Select an ingredient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Ingredients</SelectItem>
              {allIngredients.map(ing => (
                <SelectItem key={ing.id} value={ing.name}> 
                  <Leaf className="inline-block mr-2 h-4 w-4 text-muted-foreground" />{ing.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category-filter" className="text-sm font-medium">Filter by Category</Label>
           <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter" className="w-full mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value={ALL_ITEMS_FILTER_VALUE}>All Categories</SelectItem>
              {allCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={resetFilters} className="text-accent hover:bg-accent/10">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
