'use server';
/**
 * @fileOverview A flow for generating product images.
 * - generateProductImages - A function that generates a set of product images.
 */

import {ai} from '@/ai/genkit';
import { GenerateProductImagesInputSchema, GenerateProductImagesOutputSchema, type GenerateProductImagesInput, type GenerateProductImagesOutput } from '@/ai/schemas/product-images';

const generationPrompt = `
    INSTRUCTIONS:
    You are a professional product photographer AI. Your task is to generate a single, realistic, studio-quality image for an herbal wellness product based on the provided details.

    **Image Style Guidelines:**
    - **Lighting:** Soft, natural lighting. Avoid harsh shadows.
    - **Background:** Clean, minimalist background, often a soft, neutral color (like light gray, beige) or a subtle natural texture (like wood or stone).
    - **Composition:** Elegant and well-balanced. The product should be the clear hero. Props like dried herbs, fresh ingredients, or simple ceramic dishes are acceptable but should not clutter the scene.
    - **Mood:** Serene, calming, and trustworthy.

    **Product Details:**
    - **Name:** {{{name}}}
    - **Description:** {{{description}}}

    {{#if contextImage}}
    **Contextual Image:**
    Use the following image as a strong reference for the product's shape, color, or packaging style. Do not simply copy it, but let it inspire the final product shot.
    {{media url=contextImage}}
    {{/if}}

    Generate one unique image based on these instructions.
`;


const generateProductImageFlow = ai.defineFlow(
  {
    name: 'generateProductImageFlow',
    inputSchema: GenerateProductImagesInputSchema,
    outputSchema: z.string(), // Returns a single image data URI
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [{
            text: generationPrompt,
            context: input,
        }],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed to produce an image.');
    }
    return media.url;
  }
);


export async function generateProductImages(input: GenerateProductImagesInput): Promise<GenerateProductImagesOutput> {
  try {
    // Generate 4 images in parallel
    const imagePromises = Array(4).fill(null).map(() => generateProductImageFlow(input));
    const imageDataUris = await Promise.all(imagePromises);
    return { images: imageDataUris };
  } catch (error) {
    console.error("Error in generateProductImages parallel execution:", error);
    // Fallback or re-throw
    throw new Error("Failed to generate one or more product images.");
  }
}
