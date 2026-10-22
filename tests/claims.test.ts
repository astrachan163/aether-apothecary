import { describe, expect, it } from 'vitest';
import { FDA_DISCLAIMER, findBannedClaim } from '../shared/claims';

const words = ['treat', 'cure', 'prevent', 'heal', 'anxiety', 'depression', 'cancer', 'diabetes', 'inflammation', 'immune', 'pain', 'insomnia', 'detox', 'arthritis', 'COVID', 'disease', 'blood pressure', 'ailment', 'remedy'];

describe('claims validator', () => {
  it('allows the FDA disclaimer', () => {
    expect(findBannedClaim(FDA_DISCLAIMER)).toBeNull();
  });

  for (const word of words) {
    it(`blocks ${word}`, () => {
      expect(findBannedClaim(`People say it will ${word} you.`)).toBeTruthy();
    });
  }
});
