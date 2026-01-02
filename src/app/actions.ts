'use server';

import { identifyWasteAndRecommendBin, type IdentifyWasteAndRecommendBinOutput } from '@/ai/flows/identify-waste-and-recommend-bin';
import { z } from 'zod';

// Define a schema for file validation
const imageFileSchema = z.instanceof(File).refine(file => file.size > 0, 'Image file cannot be empty.');

export async function analyzeWasteImage(formData: FormData): Promise<{ success: true; data: IdentifyWasteAndRecommendBinOutput } | { success: false; error: string }> {
  const image = formData.get('image');

  const validation = imageFileSchema.safeParse(image);

  if (!validation.success) {
    const issues = validation.error.issues.map(issue => issue.message).join(', ');
    return { success: false, error: `Invalid image file: ${issues}` };
  }

  const file = validation.data;
  
  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const imageUri = `data:${file.type};base64,${base64}`;
    
    const result = await identifyWasteAndRecommendBin({ imageUri });
    
    return { success: true, data: result };

  } catch (e) {
    console.error(e);
    // Return a user-friendly error message
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to analyze image: ${errorMessage}` };
  }
}
