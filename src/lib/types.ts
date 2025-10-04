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
  images?: string[]; 
  category: string;
  inventory: number;
  active: boolean;
  ingredients: string[]; 
  ailments: AilmentType[];
  sku?: string;
  benefits?: string[];
  usage?: string;
  createdAt?: Timestamp | Date | string; 
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

// Types for Stripe Integration and Order Management
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Price per item at time of purchase
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  stripeSessionId: string;
  stripePaymentIntent?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
