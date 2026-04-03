import dotenv from 'dotenv';
dotenv.config();

import { generateQuestionsService, evaluateAnswerService } from './src/services/ai/interview.service';

async function runTest() {
  console.log('--- Testing generateQuestionsService ---');
  try {
    const questions = await generateQuestionsService("Frontend Developer", "React, Next.js, TypeScript", 2);
    console.log("\n✅ Generated Questions Output:", JSON.stringify(questions, null, 2));
  } catch (err) {
    console.error("\n❌ Error in generateQuestionsService:", err);
  }

  console.log('\n--- Testing evaluateAnswerService ---');
  try {
    const evaluation = await evaluateAnswerService(
      "Explain the difference between client-side rendering and server-side rendering in Next.js.",
      "Client side rendering happens in the browser using javascript, while server side rendering generates the HTML on the server before sending it down."
    );
    console.log("\n✅ Evaluation Output:", JSON.stringify(evaluation, null, 2));
  } catch (err) {
    console.error("\n❌ Error in evaluateAnswerService:", err);
  }
}

runTest();