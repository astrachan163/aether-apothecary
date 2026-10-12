export const FDA_DISCLAIMER =
  'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';

const PHRASES = ['blood pressure'];

const WORDS = [
  'treatments',
  'treatment',
  'treating',
  'treated',
  'treats',
  'treat',
  'curing',
  'cured',
  'cures',
  'cure',
  'preventing',
  'prevented',
  'prevention',
  'prevents',
  'prevent',
  'healing',
  'healed',
  'heals',
  'heal',
  'inflammations',
  'inflammation',
  'inflammatory',
  'immunity',
  'immune',
  'anxieties',
  'anxiety',
  'depressive',
  'depression',
  'cancers',
  'cancer',
  'diabetes',
  'pains',
  'painful',
  'pain',
  'insomnia',
  'detox',
  'arthritis',
  'covid',
  'diseases',
  'disease',
  'ailments',
  'ailment',
  'remedies',
  'remedy',
];

export function findBannedClaim(text: string): string | null {
  const scrubbed = text.split(FDA_DISCLAIMER).join(' ');
  for (const phrase of PHRASES) {
    const pattern = new RegExp(`\\b${phrase}\\b`, 'i');
    if (pattern.test(scrubbed)) return phrase;
  }
  for (const word of WORDS) {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    if (pattern.test(scrubbed)) return word;
  }
  return null;
}

export function assertCatalogText(fields: Record<string, unknown>): void {
  for (const value of Object.values(fields)) {
    if (typeof value !== 'string') continue;
    const hit = findBannedClaim(value);
    if (hit) {
      throw new Error(`blocked-claim:${hit}`);
    }
  }
}
