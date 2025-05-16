export type AilmentType = 'spiritual' | 'emotional' | 'physical' | 'mental';

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  dataAiHint?: string;
  price: string; 
  category: string; 
  ailments: AilmentType[];
  ingredients: string[]; // Names of ingredients
  sku?: string;
}

export interface Ingredient {
  id: string;
  slug: string;
  name: string;
  description: string;
  traditionalUses: string;
  spiritualBenefits: string;
  physicalBenefits: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface CommunityStory {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  dataAiHint?: string;
  productId?: string;
  productName?: string;
  story: string;
  date: string;
}
