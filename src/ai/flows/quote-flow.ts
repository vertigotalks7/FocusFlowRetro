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

const fallbackQuotes = [
  "The secret of getting ahead is getting started.",
  "The journey of a thousand miles begins with a single step.",
  "Either you run the day, or the day runs you.",
  "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.",
  "The key is not to prioritize what's on your schedule, but to schedule your priorities."
];

const quoteFlow = ai.defineFlow(
  {
    name: 'quoteFlow',
  },
  async () => {
    try {
      console.log("Attempting to fetch quote from Gemini API...");
      const {output} = await quotePrompt();
      const quote = output ?? "The journey of a thousand miles begins with a single step.";
      console.log("Successfully fetched quote:", quote);
      return quote;
    } catch (error) {
      console.error("Error fetching AI quote, using fallback:", error);
      // Return a random fallback quote if the AI service fails
      const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      console.log("Using fallback quote:", fallback);
      return fallback;
    }
  }
);
