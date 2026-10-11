
import type { CommunityStory } from '@/lib/types';

// This data will now serve as the INITIAL seed for the DataContext.
// The live application state will be managed by DataContext.
export const mockStories: CommunityStory[] = [
  {
    id: '1',
    userName: 'Seraphina Moon',
    userAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman smiling',
    productId: '1',
    productName: 'Sacred Anointing Oil (Victory)',
    story: "Using the Sacred Anointing Oil during my daily meditation has transformed my practice. I feel a deeper connection to my inner self and a profound sense of peace. It's truly a blessing.",
    date: '2023-10-15',
  },
  {
    id: '2',
    userName: 'Elias Stone',
    userAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'man nature',
    productId: '2',
    productName: 'Calendula Botanical Oil',
    story: "I keep the Calendula Botanical Oil by the garden door. I enjoy the herbal scent after a long afternoon outside. It is part of my routine, and I like that it is simple.",
    date: '2023-11-02',
  },
  {
    id: '3',
    userName: 'Luna Bloom',
    userAvatarUrl: 'https://placehold.co/100x100.png', // Added placeholder avatar for consistency
    dataAiHint: 'woman nature', // Added placeholder hint
    productId: '3', // Assuming this relates to product ID '3' (All Natural Herbal Black Soap)
    productName: 'All Natural Herbal Black Soap', // Updated to match
    story: "The All Natural Herbal Black Soap has become a staple in my routine. The scent is incredibly calming, and I enjoy how soft my skin feels afterward.",
    date: '2023-09-20',
  },
];
