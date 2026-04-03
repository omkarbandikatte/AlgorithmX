import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

dotenv.config();

async function runDiagnostics() {
  console.log("🔍 Starting AI Diagnostics (V0.21.0 SDK)...");

  // 1. Test Groq
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const groqRes = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Connection test' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 5
    });
    console.log("✅ Groq Connection: SUCCESS", groqRes.choices[0].message.content);
  } catch (err: any) {
    console.error("❌ Groq Connection: FAILED", err.message);
  }

  // 2. Test Gemini (V0.21.0 Synthetic Part Check)
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    // Test contents array syntax
    const geminiRes = await model.generateContent({ 
        contents: [{ role: 'user', parts: [{ text: "Return 'OK'" }] }] 
    });
    
    console.log("✅ Gemini Connection: SUCCESS", geminiRes.response.text());
  } catch (err: any) {
    console.error("❌ Gemini Connection: FAILED", err.message);
  }

  console.log("🏁 Diagnostics Complete.");
}

runDiagnostics();
