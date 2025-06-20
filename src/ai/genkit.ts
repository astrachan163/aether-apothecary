// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // You can specify the API key here,
      // but it is recommended to configure it in the environment
      // (e.g. GOOGLE_API_KEY)
    }),
  ],
});
