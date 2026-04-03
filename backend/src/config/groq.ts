import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Initializes the Groq client with the API key from environment variables.
 * Usesllama-3.3-70b-versatile for high-performance AI completions.
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('your-groq')) {
  console.warn('⚠️ GROQ_API_KEY is missing. AI Resume features will not work.');
}

export default groq;
