import { Timestamp } from 'firebase/firestore';

export type AilmentType = 'spiritual' | 'emotional' | 'physical' | 'mental';

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  imageUrl: string;
  dataAiHint?: string;
  images?: string[]; // For multiple images
  category: string;
  inventory: number;
  active: boolean;
  ingredients: string[]; // Names of ingredients
  ailments: AilmentType[];
  sku?: string;
  benefits?: string[];
  usage?: string;
  createdAt?: Timestamp | Date | string; // Flexible for data source
  updatedAt?: Timestamp | Date | string;
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
