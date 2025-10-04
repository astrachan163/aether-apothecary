// src/ai/genkit.ts
import {genkit} from 'genkit';
import {vertexAI} from '@genkit-ai/google-cloud';

export const ai = genkit({
  plugins: [
    vertexAI({
      project: 'aether-apothecary', // Your Google Cloud project ID
      location: 'us-central1',  // The location of your Vertex AI resources
    }),
  ],
});
