import type { Ingredient } from '@/lib/types';

export const mockIngredients: Ingredient[] = [
  {
    id: '1',
    slug: 'lavender',
    name: 'Lavender',
    description: 'A versatile herb known for its calming aroma and soothing properties.',
    traditionalUses: 'Used for centuries to promote relaxation, reduce anxiety, and aid sleep. Also applied topically for skin irritations and burns.',
    spiritualBenefits: 'Promotes peace, tranquility, and purification. Enhances intuition and spiritual awareness. Associated with the crown chakra.',
    physicalBenefits: 'Anti-inflammatory, antiseptic, and analgesic properties. Helps alleviate headaches, muscle pain, and insect bites. Supports skin healing.',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'lavender flower',
  },
  {
    id: '2',
    slug: 'frankincense',
    name: 'Frankincense',
    description: 'A resin obtained from Boswellia trees, prized for its aromatic and healing qualities.',
    traditionalUses: 'Burned as incense in religious ceremonies for purification and to create a sacred atmosphere. Used in traditional medicine for its anti-inflammatory effects.',
    spiritualBenefits: 'Elevates spiritual consciousness, aids in meditation and prayer, and dispels negative energy. Connects to higher realms.',
    physicalBenefits: 'Supports respiratory health, reduces inflammation (especially in joints), boosts immune system, and promotes healthy skin.',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'frankincense resin',
  },
  {
    id: '3',
    slug: 'calendula',
    name: 'Calendula',
    description: 'A vibrant orange flower with powerful skin-healing abilities.',
    traditionalUses: 'Applied to wounds, burns, and rashes to accelerate healing and prevent infection. Taken internally for digestive issues.',
    spiritualBenefits: 'Brings warmth, joy, and light. Associated with the sun and creativity. Offers protection and aids in manifesting positive outcomes.',
    physicalBenefits: 'Potent anti-inflammatory, antimicrobial, and vulnerary (wound-healing) properties. Excellent for all types of skin conditions.',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'calendula flower',
  },
  {
    id: '4',
    slug: 'peppermint',
    name: 'Peppermint',
    description: 'A hybrid mint known for its refreshing scent and invigorating effects.',
    traditionalUses: 'Used to aid digestion, relieve nausea, freshen breath, and alleviate headaches. Its cooling sensation is valued for muscle pain.',
    spiritualBenefits: 'Clears mental fog, enhances focus and concentration. Purifies energy and promotes alertness. Aids in communication.',
    physicalBenefits: 'Soothes digestive upset, relieves tension headaches, opens airways, and has antimicrobial properties beneficial for oral health.',
    imageUrl: 'https://placehold.co/300x200.png',
    dataAiHint: 'peppermint leaves',
  },
];

export const getIngredientBySlug = (slug: string): Ingredient | undefined => mockIngredients.find(i => i.slug === slug);
