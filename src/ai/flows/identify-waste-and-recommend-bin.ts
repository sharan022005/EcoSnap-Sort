'use server';
/**
 * @fileOverview An AI agent that identifies waste from an image and recommends a bin.
 *
 * - identifyWasteAndRecommendBin - A function that handles the waste identification and bin recommendation process.
 * - IdentifyWasteAndRecommendBinInput - The input type for the identifyWasteAndRecommendBin function.
 * - IdentifyWasteAndRecommendBinOutput - The return type for the identifyWasteAndRecommendBin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyWasteAndRecommendBinInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "A photo of a waste item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyWasteAndRecommendBinInput = z.infer<
  typeof IdentifyWasteAndRecommendBinInputSchema
>;

const IdentifyWasteAndRecommendBinOutputSchema = z.object({
  binColor: z
    .enum(['Red', 'Blue', 'Green'])
    .describe('The recommended bin color for the waste item.'),
  ecoFact: z.string().describe('A short eco-fact related to waste disposal.'),
});
export type IdentifyWasteAndRecommendBinOutput = z.infer<
  typeof IdentifyWasteAndRecommendBinOutputSchema
>;

export async function identifyWasteAndRecommendBin(
  input: IdentifyWasteAndRecommendBinInput
): Promise<IdentifyWasteAndRecommendBinOutput> {
  return identifyWasteAndRecommendBinFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyWasteAndRecommendBinPrompt',
  input: {schema: IdentifyWasteAndRecommendBinInputSchema},
  output: {schema: IdentifyWasteAndRecommendBinOutputSchema},
  prompt: `Analyze this image of a waste item.

Is the waste item 'Recyclable' (Blue Bin), 'Organic' (Green Bin), or 'Hazardous/Reject' (Red Bin)?

Return ONLY the bin color and a 1-sentence eco-fact.

Image: {{media url=imageUri}}`,
});

const identifyWasteAndRecommendBinFlow = ai.defineFlow(
  {
    name: 'identifyWasteAndRecommendBinFlow',
    inputSchema: IdentifyWasteAndRecommendBinInputSchema,
    outputSchema: IdentifyWasteAndRecommendBinOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
