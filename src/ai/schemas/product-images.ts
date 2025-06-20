/**
 * @fileOverview Schemas and types for the product image generation flow.
 */
import {z} from 'genkit';

export const GenerateProductImagesInputSchema = z.object({
  name: z.string().describe('The name of the herbal product.'),
  description: z.string().describe('The detailed description of the product for context.'),
  contextImage: z.string().optional().describe("An optional context image of a product design or similar item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateProductImagesInput = z.infer<typeof GenerateProductImagesInputSchema>;

export const GenerateProductImagesOutputSchema = z.object({
  images: z.array(z.string()).describe('An array of generated image data URIs.'),
});
export type GenerateProductImagesOutput = z.infer<typeof GenerateProductImagesOutputSchema>;
