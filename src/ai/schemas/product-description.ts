/**
 * @fileOverview Schemas and types for the product description generation flow.
 */
import {z} from 'genkit';

export const GenerateProductDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the herbal product.'),
  shortDescription: z.string().describe('The short description of the product for context.'),
  keywords: z.string().describe('Comma-separated keywords for the product (e.g., calming, soothing, lavender).'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

export const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The full, detailed product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;
