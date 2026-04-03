"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAnswerService = exports.transcribeAudioService = exports.generateQuestionsService = void 0;
const groq_1 = __importDefault(require("../../config/groq"));
const fs_1 = __importDefault(require("fs"));
// Helper to strip markdown JSON boundaries
const parseJSON = (text) => {
    try {
        return JSON.parse(text.replace(/```json\n?|```/gi, "").trim());
    }
    catch (e) {
        console.error("JSON Parsing failed", text);
        return {};
    }
};
const generateQuestionsService = async (role, stack, exp) => {
    const prompt = `
    You are an expert interviewer.

    Generate 5 interview questions for:
    Role: ${role}
    Tech Stack: ${stack}
    Experience: ${exp} years

    Return ONLY valid JSON:
    {
      "questions": ["q1", "q2", "q3", "q4", "q5"]
    }
  `;
    const completion = await groq_1.default.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "openai/gpt-oss-120b",
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
exports.generateQuestionsService = generateQuestionsService;
const transcribeAudioService = async (filePath) => {
    // Leverage Groq's natively hosted fast Whisper-V3
    const completion = await groq_1.default.audio.transcriptions.create({
        file: fs_1.default.createReadStream(filePath),
        model: "whisper-large-v3",
    });
    return completion.text;
};
exports.transcribeAudioService = transcribeAudioService;
const evaluateAnswerService = async (question, userAnswer) => {
    const prompt = `
    You are an expert interviewer.

    Question:
    ${question}

    Candidate Answer:
    ${userAnswer}

    Evaluate and return ONLY JSON:
    {
      "score": number (1-10),
      "feedback": "detailed feedback",
      "idealAnswer": "perfect answer"
    }
  `;
    const completion = await groq_1.default.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "openai/gpt-oss-120b",
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
exports.evaluateAnswerService = evaluateAnswerService;
