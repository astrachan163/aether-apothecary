'use server';
/**
 * @fileOverview A flow for generating product images.
 * - generateProductImages - A function that generates a set of product images.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateProductImagesInputSchema, type GenerateProductImagesInput, type GenerateProductImagesOutput } from '@/ai/schemas/product-images';


const generateProductImageFlow = ai.defineFlow(
  {
    name: 'generateProductImageFlow',
    inputSchema: GenerateProductImagesInputSchema,
    outputSchema: z.string(), // Returns a single image data URI
  },
  async (input) => {
    const promptText = `
      Generate a single, realistic, studio-quality image for an herbal wellness product.
      
      **Image Style Guidelines:**
      - Soft, natural lighting. Avoid harsh shadows.
      - Clean, minimalist background, often a soft, neutral color (like light gray, beige) or a subtle natural texture (like wood or stone).
      - Elegant and well-balanced. The product should be the clear hero. Props like dried herbs, fresh ingredients, or simple ceramic dishes are acceptable but should not clutter the scene.
      - Mood: Serene, calming, and trustworthy.

      **Product Details:**
      - **Name:** ${input.name}
      - **Description:** ${input.description}
    `;
    
    const promptParts = [{ text: promptText }];
    if (input.contextImage) {
        promptParts.push({ media: { url: input.contextImage } });
    }

    const {media, finishReason} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (finishReason === 'BLOCKED' || finishReason === 'SAFETY') {
        throw new Error('Image generation was blocked for safety reasons.');
    }
    
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
