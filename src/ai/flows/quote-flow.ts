'use server';
/**
 * @fileOverview A simple quote generator.
 *
 * - getFocusQuote - A function that returns an inspirational quote.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function getFocusQuote(): Promise<string> {
  return quoteFlow();
}

const quotePrompt = ai.definePrompt({
  name: 'quotePrompt',
  output: {schema: z.string().describe('A short, inspirational quote about focus.')},
  prompt: `generate inspirational quotes`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const quoteFlow = ai.defineFlow(
  {
    name: 'quoteFlow',
  },
  async () => {
    const {output} = await quotePrompt();
    return output ?? '';
  }
);
