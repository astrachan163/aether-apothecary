// src/ai/genkit.ts
import {genkit} from 'genkit';
// Registry only. Legacy server generation stays unavailable until a provider
// is separately selected and reviewed; the shipped UI uses separate callables.
export const ai = genkit({ plugins: [] });
