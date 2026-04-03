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

app.post('/api/ai/roadmap/save', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { topic, nodes, edges } = req.body;
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  try {
    const docRef = await db.collection('users').doc(req.user!.uid).collection('roadmaps').add({
      topic,
      nodes,
      edges,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: docRef.id, message: 'Saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save roadmap' });
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

app.post('/api/ai/interview/final-feedback', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionHistory } = req.body;
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an AI Interview Coach. Provide a final evaluation report.
      Return strictly a JSON object:
      {
        "report": "Detailed 2-3 paragraph markdown report of their performance",
        "finalScore": 85
      }
      History: ${JSON.stringify(sessionHistory || [])}
    `;

    const result = await model.generateContent(prompt);
    const textResp = (await result.response).text().trim();

    const jsonMatch = textResp.match(/\{[\s\S]*\}/);
    const parseableText = jsonMatch ? jsonMatch[0] : textResp;

    const data = JSON.parse(parseableText);
    
    // Auto-Save Interview to DB
    if (db) {
      await db.collection('users').doc(req.user!.uid).collection('interviews').add({
        score: data.finalScore || 0,
        report: data.report || textResp,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ report: data.report || textResp });
  } catch (error: any) {
    console.error('❌ Final Report Error:', error.message);
    res.status(500).json({ error: 'Report failed' });
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
    const resultJson = JSON.parse(chat.choices[0].message.content || '{}');
    
    // Auto-Save Resume Score to DB
    if (db) {
       await db.collection('users').doc(req.user!.uid).collection('resumes').add({
         totalScore: resultJson.totalScore,
         breakdown: resultJson.breakdown,
         highlights: resultJson.highlights,
         createdAt: admin.firestore.FieldValue.serverTimestamp()
       });
    }

    res.json(resultJson);
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
// AI Voice Command Interpreter
// ──────────────────────────────────────────────

app.post('/api/ai/voice-command', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    console.log(`🎙️  Groq Voice Intent Mapping: [${prompt}]`);

    const systemPrompt = `
      You are the Rakshak AI Voice Concierge. 
      Convert user voice prompt into structured JSON.
      Paths: "/dashboard", "/resume", "/doubt-solver", "/interview", "/roadmap".
      
      Actions:
      - NAVIGATE: Go to a page.
      - EXECUTE: Navigate and perform task.
      
      Return JSON:
      {
        "action": "NAVIGATE" | "EXECUTE",
        "path": "string",
        "payload": { "topic": "string", "tab": "chat" | "talk" },
        "speech": "Short confirmation to say back"
      }
      Example: "Go to talk mode" -> { "action": "NAVIGATE", "path": "/doubt-solver", "payload": { "tab": "talk" }, "speech": "Switching to talk mode." }
    `;

    const chat = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chat.choices[0].message.content || '{}');
    console.log("✅ Groq Intent Parsed Successfully");
    res.json(result);
  } catch (error: any) {
    console.error('❌ Groq Voice Error:', error.message);
    res.status(500).json({ error: 'Voice intent mapping failed' });
  }
});

// ──────────────────────────────────────────────
// Health
// ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', firebase: admin.apps.length > 0 }));

// User History Fetcher
app.get('/api/user/history', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!db) return res.status(500).json({ error: 'DB not initialized' });
  try {
    const uid = req.user!.uid;
    const roadmapsSnap = await db.collection('users').doc(uid).collection('roadmaps').orderBy('createdAt', 'desc').get();
    const interviewsSnap = await db.collection('users').doc(uid).collection('interviews').orderBy('createdAt', 'desc').get();
    const resumesSnap = await db.collection('users').doc(uid).collection('resumes').orderBy('createdAt', 'desc').get();

    res.json({
      roadmaps: roadmapsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      interviews: interviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      resumes: resumesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(port, () => console.log(`🚀 Rakshak AI Backend listening at http://localhost:${port}`));
