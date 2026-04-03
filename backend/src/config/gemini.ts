import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Initializes the Gemini client using the Google Generative AI SDK.
 * Powered by Gemini 1.5 Pro/Flash for optimized multimodal doubt solving.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is missing. Multimodal doubt solver will not work.');
}

/**
 * Common Model Selection:
 * - gemini-1.5-flash: Fast & affordable for most tasks
 * - gemini-1.5-pro: High-reasoning and deep context
 */
export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export default genAI;
