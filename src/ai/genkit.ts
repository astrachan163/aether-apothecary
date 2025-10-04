// src/ai/genkit.ts
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      project: 'monospace-1', // Your Google Cloud project ID
      location: 'us-central1',  // The location of your Vertex AI resources
    }),
  ],
});
