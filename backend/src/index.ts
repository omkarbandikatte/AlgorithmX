import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import admin, { db, rtdb } from './config/firebase';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth';
import groq from './config/groq';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

// ──────────────────────────────────────────────
// Resolved AI Roadmap (Exhaustive Precision Mode)
// ──────────────────────────────────────────────

app.post('/api/ai/roadmap', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Please provide a topic.' });

  try {
    console.log(`🗺️  AI Roadmap System Triggered: [${topic}]`);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        generationConfig: { responseMimeType: "application/json" } // FORCING JSON MODE
    });

    const prompt = `
      Generative Task: Create a hierarchical learning roadmap for: "${topic}".
      Return a JSON object with:
      - nodes: array of {id: string, label: string, description: string}
      - edges: array of {from: string, to: string}
      Requirements: 6-10 nodes, strict dependency graph, beginner to advanced.
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().trim();

    console.log("🎨 RAW Response Captured.");

    const roadmap = JSON.parse(text);
    console.log("✅ Final Parsing Successful");
    res.json(roadmap);
  } catch (error: any) {
    console.error('❌ AI Roadmap Failure Deep-Dive:', error.message);
    res.status(500).json({ 
        error: 'AI Roadmap engine error.', 
        details: error.message || 'Generation or parsing failed.' 
    });
  }
});

// ──────────────────────────────────────────────
// Multimodal Doubt Solver (Simplified Stability)
// ──────────────────────────────────────────────

app.post('/api/ai/doubt-solver', authMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  const file = req.file;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const parts: any[] = [{ text: query || "Explain this in detail." }];

    if (file) {
      parts.push({ inlineData: { data: file.buffer.toString('base64'), mimeType: file.mimetype } });
    }

    const result = await model.generateContent(parts);
    res.json({ answer: (await result.response).text() });
  } catch (error: any) {
    console.error('❌ Doubt Solver Error:', error.message);
    res.status(500).json({ error: 'Doubt solver failed.' });
  }
});

// ──────────────────────────────────────────────
// Interview Turn logic
// ──────────────────────────────────────────────

app.post('/api/ai/interview/turn', authMiddleware, upload.fields([{ name: 'audio' }, { name: 'frame' }]), async (req: AuthenticatedRequest, res: Response) => {
  const { resumeText, jobDescription, history = "[]" } = req.body;
  const files = req.files as any;

  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        generationConfig: { responseMimeType: "application/json" }
    });
    
    const parts: any[] = [{ text: `AI Interviewer system prompt. Resume: ${resumeText}. History: ${history}. Analyze turn and return JSON: { "nextQuestion": "text", "proctoringScore": number, "proctoringFeedback": "string" }` }];

    if (files.audio?.[0]) parts.push({ inlineData: { data: files.audio[0].buffer.toString('base64'), mimeType: files.audio[0].mimetype } });
    if (files.frame?.[0]) parts.push({ inlineData: { data: files.frame[0].buffer.toString('base64'), mimeType: files.frame[0].mimetype } });

    const result = await model.generateContent(parts);
    res.json(JSON.parse((await result.response).text()));
  } catch (error) {
    res.status(500).json({ error: 'Interview turn failed' });
  }
});

// ──────────────────────────────────────────────
// Resume Suite (LLaMA 3.3)
// ──────────────────────────────────────────────

app.post('/api/ai/resume/score', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chat = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'HR Expert. JSON Score: totalScore, breakdown, highlights.' }, { role: 'user', content: req.body.resumeText }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(chat.choices[0].message.content || '{}'));
  } catch (error) {
    res.status(500).json({ error: 'Scoring failed.' });
  }
});

app.post('/api/ai/resume/import', authMiddleware, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      text = (await pdf(req.file.buffer)).text;
    } else {
      text = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
    }
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Parse failed.' });
  }
});

// ──────────────────────────────────────────────
// Health
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', firebase: admin.apps.length > 0 }));

app.listen(port, () => console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`));
