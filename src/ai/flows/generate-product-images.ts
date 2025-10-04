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

    try {
        const {media, finishReason} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image', // Corrected model based on documentation
        prompt: promptParts,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
        });
        
        if (finishReason === 'BLOCKED' || finishReason === 'SAFETY') {
            throw new Error('Image generation was blocked for safety reasons.');
        }
        
        if (!media || !Array.isArray(media) || media.length === 0 || !media[0].url) {
            throw new Error('Image generation failed to produce a valid media object.');
        }

        return media[0].url;
    } catch (e: any) {
        // Re-throw with a more detailed error for debugging
        const specificError = e.message || 'An unknown error occurred during AI generation.';
        console.error(`[generateProductImageFlow Error] ${specificError}`);
        throw new Error(`AI generation failed: ${specificError}`);
    }
  }
);


export async function generateProductImages(input: GenerateProductImagesInput): Promise<GenerateProductImagesOutput> {
  try {
    const imageDataUris: string[] = [];
    for (let i = 0; i < 4; i++) {
      // Added a log to show progress
      console.log(`Generating image ${i + 1} of 4...`);
      const imageDataUri = await generateProductImageFlow(input);
      imageDataUris.push(imageDataUri);
    }
    console.log("Successfully generated all 4 images.");
    return { images: imageDataUris };
  } catch (error: any) {
    // Log the specific error and re-throw a user-friendly one
    const detailedError = error.message || "An unknown error occurred.";
    console.error(`[generateProductImages Error] Failed to generate all images: ${detailedError}`);
    throw new Error(`Failed to generate product images. Reason: ${detailedError}`);
  }
}
