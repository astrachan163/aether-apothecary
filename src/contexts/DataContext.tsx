
'use client';

import type { ReactNode }  from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product, CommunityStory, Ingredient } from '@/lib/types';
import { mockProducts as initialProducts } from '@/data/products';
import { mockStories as initialStories } from '@/data/stories';
import { ingredients as initialIngredients } from '@/data/ingredients';


interface DataContextType {
  products: Product[];
  stories: CommunityStory[];
  ingredients: Ingredient[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (updatedProduct: Product) => void; 
  addStory: (story: CommunityStory) => void;
  removeStory: (storyId: string) => void;
  getProducts: () => Product[];
  getStories: () => CommunityStory[];
  getIngredients: () => Ingredient[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stories, setStories] = useState<CommunityStory[]>(initialStories);
  const [ingredientsData, setIngredientsData] = useState<Ingredient[]>(initialIngredients);


  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    // Also remove related stories
    setStories(prevStories => prevStories.map(s => s.productId === productId ? {...s, productId: undefined, productName: undefined} : s));
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    // Update product name in stories if it changed
    setStories(prevStories => prevStories.map(s => {
      if (s.productId === updatedProduct.id && s.productName !== updatedProduct.name) {
        return {...s, productName: updatedProduct.name};
      }
      return s;
    }));
  }, []);

  const addStory = useCallback((story: CommunityStory) => {
    setStories(prev => [story, ...prev]);
  }, []);

  const removeStory = useCallback((storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
  }, []);

  // Simple getters to ensure components get the current state
  const getProducts = useCallback(() => products, [products]);
  const getStories = useCallback(() => stories, [stories]);
  const getIngredients = useCallback(() => ingredientsData, [ingredientsData]);


  return (
    <DataContext.Provider value={{ 
      products, 
      stories, 
      ingredients: ingredientsData,
      addProduct, 
      removeProduct,
      updateProduct,
      addStory, 
      removeStory,
      getProducts,
      getStories,
      getIngredients
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
