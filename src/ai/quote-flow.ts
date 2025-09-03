'use server';
/**
 * @fileOverview A simple quote generator using the Google Generative AI SDK.
 *
 * - getFocusQuote - A function that returns an inspirational quote.
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

// Get the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Initialize the GoogleGenerativeAI client
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// --- START: NEW CHANGES ---

// 1. Array of fallback quotes
const FALLBACK_QUOTES = [
  "The key to success is to focus our conscious mind on things we desire not things we fear. - Brian Tracy",
  "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus. - Alexander Graham Bell",
  "The successful warrior is the average man, with laser-like focus. - Bruce Lee",
  "Focus is a matter of deciding what things you're not going to do. - John Carmack",
  "Your focus determines your reality. - Qui-Gon Jinn"
];

// 2. Helper function to get a random quote from the fallback list
function getRandomFallbackQuote(): string {
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[randomIndex];
}

// --- END: NEW CHANGES ---

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export async function getFocusQuote(): Promise<string> {
  // If the API key is missing or client fails to initialize, go straight to fallback.
  if (!genAI) {
    console.error('Gemini API key not configured. Using a fallback quote.');
    return getRandomFallbackQuote();
  }
  
  try {
    console.log("Attempting to fetch quote from Gemini API...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
    const prompt = `Generate a single, short, inspirational quote about focus. Do not include any extra text, commentary, or quotation marks. Only output the quote text itself.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const quote = response.text() ?? "";

    // 3. If AI returns an empty string, use a fallback quote
    if (!quote) {
      console.log("AI returned an empty response. Using a fallback quote.");
      return getRandomFallbackQuote();
    }

    console.log("Successfully fetched quote:", quote);
    return quote;
    
  } catch (error) {
    // 4. If the entire API call fails, use a fallback quote
    console.error("Error fetching AI quote. Using a fallback quote.", error);
    return getRandomFallbackQuote();
  }
}