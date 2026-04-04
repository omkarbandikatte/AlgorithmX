import groq from '../../config/groq';
import fs from 'fs';

// Helper to aggressively strip markdown and conversational text
const parseJSON = (text: string) => {
  try {
    const cleanJSON = text.replace(/```json\n?|```/gi, "").trim();
    const match = cleanJSON.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(cleanJSON);
  } catch (e) {
    console.error("JSON Parsing failed", text);
    return { score: 0, feedback: "Error processing feedback.", idealAnswer: "Error processing answer." };
  }
};

export const generateQuestionsService = async (role: string, stack: string, exp: number, language: string = "en-US") => {
  const prompt = `
    You are an expert interviewer.

    Generate 5 interview questions for:
    Role: ${role}
    Tech Stack: ${stack}
    Experience: ${exp} years
    Language: The generated text MUST be strictly in ${language} language code.

    Rules:
    - If Experience is 0, generate beginner level questions.
    - If Experience is 1-3, generate moderate level questions.
    - If Experience is strictly greater than 3, generate advanced/system design questions.
    - Please make sure the output JSON object keys are strictly exactly 'questions' regardless of language. The array values MUST be translated to ${language}.

    Return ONLY valid JSON:
    {
      "questions": ["q1", "q2", "q3", "q4", "q5"]
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    stream: true
  });

  let responseText = "";
  for await (const chunk of completion) {
    const content = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(content); // 🔥 live streaming equivalent for Node.js
    responseText += content;
  }
  console.log("\n"); // Cleanup new line after streaming

  return parseJSON(responseText);
};

export const transcribeAudioService = async (filePath: string) => {
  // Leverage Groq's natively hosted fast Whisper-V3
  const completion = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
    prompt: "Next.js, TypeScript, React, Component, Backend, Node, Express, Programming, Software.", // Keyword list limits hallucinations
    language: "en", // CRITICAL: This strictly prevents whisper-large-v3 from hallucinating Urdu/Arabic during dead silence
  });
  return completion.text;
};

export const evaluateAnswerService = async (question: string, userAnswer: string, language: string = "en-US") => {
  const prompt = `
    You are an expert technical interviewer.
    
    IMPORTANT: You MUST identify the language of the Candidate Answer (e.g. English, Urdu, Hindi, Spanish). 
    Your feedback, recommendations, AND the idealAnswer MUST be provided entirely in the EXACT SAME LANGUAGE as the Candidate Answer and the target language: ${language}.
    Ensure your JSON response contains ONLY perfectly translated values for the defined keys.

    Question:
    ${question}

    Candidate Answer:
    ${userAnswer}

    Evaluate the answer out of 10. You MUST respond with ONLY a raw JSON object and nothing else.
    {
      "score": <number>,
      "feedback": "<detailed feedback in ${language}>",
      "idealAnswer": "<perfect answer in ${language}>"
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    stream: true
  });

  let responseText = "";
  for await (const chunk of completion) {
    const content = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(content); // 🔥 live streaming equivalent for Node.js
    responseText += content;
  }
  console.log("\n"); // Cleanup new line after streaming

  return parseJSON(responseText);
};