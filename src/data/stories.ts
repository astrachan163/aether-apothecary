import type { CommunityStory } from '@/lib/types';

export const mockStories: CommunityStory[] = [
  {
    id: '1',
    userName: 'Seraphina Moon',
    userAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman smiling',
    productId: '1',
    productName: 'Sacred Anointing Oil',
    story: "Using the Sacred Anointing Oil during my daily meditation has transformed my practice. I feel a deeper connection to my inner self and a profound sense of peace. It's truly a blessing.",
    date: '2023-10-15',
  },
  {
    id: '2',
    userName: 'Elias Stone',
    userAvatarUrl: 'https://placehold.co/100x100.png',
    dataAiHint: 'man nature',
    productId: '2',
    productName: 'Herbal Healing Salve',
    story: "I'm an avid gardener and often get minor cuts and scrapes. The Herbal Healing Salve is a lifesaver! It soothes irritation instantly and helps my skin heal much faster. I love that it's all-natural.",
    date: '2023-11-02',
  },
  {
    id: '3',
    userName: 'Luna Bloom',
    productId: '3',
    productName: 'Lavender Dream Soap',
    story: "The Lavender Dream Soap has become a staple in my evening routine. The scent is incredibly calming, and it leaves my skin feeling soft. I've noticed a significant improvement in my sleep quality.",
    date: '2023-09-20',
  },
];
