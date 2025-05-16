'use server';

/**
 * @fileOverview Personalized product recommendation flow.
 *
 * - getPersonalizedRecommendations - A function that suggests complementary products and spiritual service recommendations.
 * - PersonalizedRecommendationInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationInputSchema = z.object({
  productName: z.string().describe('The name of the product the user is viewing.'),
  userNeeds: z.string().describe('The specific needs and preferences of the user.'),
});
export type PersonalizedRecommendationInput = z.infer<typeof PersonalizedRecommendationInputSchema>;

const PersonalizedRecommendationOutputSchema = z.object({
  recommendedProducts: z
    .array(z.string())
    .describe('A list of product names that complement the selected product.'),
  spiritualServiceSuggestions: z
    .array(z.string())
    .describe('A list of spiritual service suggestions that align with the user needs.'),
  reasoning: z
    .string()
    .describe('Explanation of why those product and service recommendations were made'),
});
export type PersonalizedRecommendationOutput = z.infer<typeof PersonalizedRecommendationOutputSchema>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationInput
): Promise<PersonalizedRecommendationOutput> {
  return personalizedRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: PersonalizedRecommendationInputSchema},
  output: {schema: PersonalizedRecommendationOutputSchema},
  prompt: `You are an AI assistant specializing in herbal medicine and spiritual wellness.

  Based on the product the user is viewing and their specific needs, provide personalized product recommendations and spiritual service suggestions.

  Product: {{{productName}}}
  User Needs: {{{userNeeds}}}

  Consider the holistic healing journey of the user.

  Format your response as a JSON object with "recommendedProducts", "spiritualServiceSuggestions", and "reasoning" fields.
  The "recommendedProducts" and "spiritualServiceSuggestions" fields should be lists of product and service names.
  The "reasoning" field should explain why those product and service recommendations were made.
  `,
});

const personalizedRecommendationFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationFlow',
    inputSchema: PersonalizedRecommendationInputSchema,
    outputSchema: PersonalizedRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
