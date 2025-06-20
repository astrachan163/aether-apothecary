'use server';
/**
 * @fileOverview A flow for generating product descriptions.
 * - generateProductDescription - A function that generates a product description.
 */

import {ai} from '@/ai/genkit';
import { GenerateProductDescriptionInputSchema, GenerateProductDescriptionOutputSchema, type GenerateProductDescriptionInput, type GenerateProductDescriptionOutput } from '@/ai/schemas/product-description';


const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  model: 'googleai/gemini-1.5-pro-latest',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert botanical copywriter specializing in herbal supplements and wellness products for an e-commerce store called "Victorious Herbal Elements". Your tone should be informative, trustworthy, and serene.

You must generate a detailed and engaging product description based on the provided product name, its short description, and keywords.

CRITICAL INSTRUCTIONS:
1.  Do NOT make any medical claims.
2.  Use compliant language. Phrases like "supports a sense of calm," "traditionally used for," or "promotes well-being" are acceptable.
3.  Do NOT use phrases like "treats," "cures," "prevents," or "diagnoses any disease."
4.  The output should be a single, well-written paragraph or two, suitable for a product detail page.

PRODUCT NAME: {{{name}}}
SHORT DESCRIPTION: {{{shortDescription}}}
KEYWORDS: {{{keywords}}}
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}
