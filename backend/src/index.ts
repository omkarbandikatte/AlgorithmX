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
    
    const prompt = `
      Generative Task: Create a hierarchical learning roadmap for: "${topic}".
      Return a JSON object with:
      - nodes: array of {id: string, label: string, description: string}
      - edges: array of {from: string, to: string}
      Requirements: 6-10 nodes, strict dependency graph, beginner to advanced.
    `;

    const chat = await groq.chat.completions.create({
      messages: [
          { role: "system", content: "You strictly output JSON." },
          { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const text = chat.choices[0].message?.content || '{}';

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
    const content: any[] = [{ type: "text", text: query || "Explain this in detail." }];
    
    if (file) {
      const base64Image = file.buffer.toString('base64');
      content.push({
        type: "image_url",
        image_url: { url: `data:${file.mimetype};base64,${base64Image}` }
      });
    }

    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content }],
      model: "llama-3.2-11b-vision-preview"
    });

    res.json({ answer: chat.choices[0].message?.content || '' });
  } catch (error: any) {
    console.error('❌ Doubt Solver Error:', error.message);
    res.status(500).json({ error: 'Doubt solver failed.' });
  }
});

import interviewRoutes from './routes/ai/interview.routes';

// ──────────────────────────────────────────────
// Interview Suite (Groq Modular)
// ──────────────────────────────────────────────

app.use('/api/ai/interview', interviewRoutes);

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
